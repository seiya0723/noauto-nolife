---
title: "DjangoでPythonライブラリのマークダウンを試してみる【pip install Markdown】"
date: 2022-10-16T22:51:20+09:00
lastmod: 2022-10-30T20:18:20+09:00
draft: false
thumbnail: "images/Screenshot from 2022-10-30 20-08-23.png"
categories: [ "サーバーサイド" ]
tags: [ "Django","Pythonライブラリ","ウェブデザイン","マークダウン" ]
---

どうやらPythonライブラリにマークダウンを実現させるライブラリがあるそうだ。これがDjangoで扱えるらしい。

かなり前から、どうにかしてDjangoでマークダウンを実現できないかと考えていたが、ようやく見つかって良かった。

さっそく試してみる。

## インストール

    pip install Markdown


バージョンはこうなった。

```
importlib-metadata==5.0.0
Markdown==3.4.1
zipp==3.9.0
```

## 動かすとこうなる

このマークダウンを読み込み、HTMLに変換してもらう。

<div class="img-center"><img src="/images/Screenshot from 2022-10-11 08-55-05.png" alt=""></div>


    ## Pythonの構文
    
    ```
    for i in range(6):
        print(i)
    
    
        print("hello")
    
    
    print("hello")
    ```

    このように`for`文を使うことで繰り返し処理ができる


これを、test.mdとして保存する。

Pythonコードはこれ

    import markdown
    
    with open("test.md", "r", encoding="utf-8") as f:
        text = f.read()
        html = markdown.markdown(text)
    
    print(html)

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-11 08-56-25.png" alt=""></div>

どうしてこうなった。

バッククオーテーション3つで囲っている部分は`<pre><code></code></pre>`になってほしかったのだが...

あと、Pythonのようなインデント構文の場合は`\t`を使ってインデントしてほしいのに、~~現時点ではそれに対応していないようだ。~~

## exteintons引数を使う

どうやら、バッククオーテーションの部分はextentions引数を使うことで、HTML化する事ができるそうだ。

参照元: https://python-markdown.github.io/extensions/


    import markdown
    
    with open("test.md", "r", encoding="utf-8") as f:
        text = f.read()
        html = markdown.markdown(text, extensions=["extra"])
    
    print(html)

結果はこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-17 15-20-23.png" alt=""></div>

正常にHTMLに変換してくれたようだ。ちなみに、このextraを使うことで、マークダウンのテーブルの記法もHTMLへ変換してくれる。


## マークダウンの中にHTMLがあるとどうなる？【XSS】

このように、マークダウンの中にHTMLがある場合。


    ## Pythonの構文
    
    ```
    for i in range(6):
        print(i)
    
    
        print("hello")
    
    
    print("hello")
    ```
    
    
    このように`for`文を使うことで繰り返し処理ができる
    <script>console.log("MDに書いたHTMLがそのまま動くのはXSSの問題がある。これを無効化する必要が有る");</script>
    

こうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-17 15-22-51.png" alt=""></div>

scriptタグの部分はエスケープしてくれない。そのため、Djangoに実装をする場合はこの点を考慮する必要がある。

この対策をしないとXSS脆弱性を生み出してしまう。


## では、実際にDjangoでマークダウンを運用するにはどうしたら良い？

まずは[カスタムテンプレートフィルタ(カスタムテンプレートタグ)](/post/django-custom-template-tags-hashtags/)を実装する必要がある。

実験台になってもらうのは、いつもの[40分Django](/post/startup-django/)。


### マークダウン記法をHTMLに変換するカスタムテンプレートフィルタを作る

`bbs/templatetags/markdown.py`を作る。

中身は下記。


    import markdown
    from django import template
    
    from django.utils.html import escape
    from django.utils.safestring import mark_safe
    
    register = template.Library()
    
    @register.filter()
    def md(value):
    
        # まずDBに投稿されているデータをescapeでエスケープする(HTML直書きを無効化)
        escaped     = escape(value)
    
        # 続いて、マークダウンをHTMLに直す markdown.markdown
        marked      = markdown.markdown( escaped , extensions=["extra"])
    
        # その上で、HTMLをエスケープさせずにレンダリングする  mark_safe
        return mark_safe( marked )


動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-30 20-08-23.png" alt=""></div>

しっかり、XSS対策をしつつ、マークダウン記法が反映された。


ただ、これだと、改行が1回だけ、例えば以下みたいな文章だと、1行で表示されてしまう問題がある。


    こんな
    文章だと
    1行で表示される。


<div class="img-center"><img src="/images/Screenshot from 2022-10-30 20-10-07.png" alt=""></div>


原因は、pタグ内の改行がbrタグに変換されないから。

だから、こんなふうに施しをするとよいだろう。

    import markdown
    from django import template
    
    from django.utils.html import escape
    from django.utils.safestring import mark_safe
    
    register = template.Library()
    
    @register.filter()
    def md(value):
    
        # まずDBに投稿されているデータをescapeでエスケープする(HTML直書きを無効化)
        escaped     = escape(value)
    
        # 続いて、マークダウンをHTMLに直す markdown.markdown
        marked      = markdown.markdown( escaped , extensions=["extra"])
    
        #bs4を使ってpタグの改行に対してのみ、BRタグに書き換える。
        import bs4,re
    
        soup    = bs4.BeautifulSoup(marked, "html.parser")
        p_elems = soup.select("p")
    
        for p_elem in p_elems:
            p_elem_br   = re.sub( "\n","<br>", str(p_elem) )
    
            #markedは"を&quot;としている。そのため、置換でヒットさせるためには、エスケープする必要がある。
            #FIXME:他にもreplaceでヒットしないエスケープ文字がいくらかあるっぽい
    
            marked      = marked.replace( str(p_elem).replace("\"","&quot;"), p_elem_br)
    
        # その上で、HTMLをエスケープさせずにレンダリングする  mark_safe
        return mark_safe( marked )


ご覧の通り、まだまだ完全とは程遠いが、先ほどの文章はこんなふうに表示される。

<div class="img-center"><img src="/images/Screenshot from 2022-10-30 20-10-56.png" alt=""></div>

他にもエスケープされている文字列があるようだが、これ以上対策をしても次項の問題は解決されないので、放置することにした。


## マークダウン入力と同時にプレビューをするには？

エンジニア向けの質問投稿サイトなどは、マークダウンで入力できるようになっている。

そのマークダウン入力時に、隣でプレビューを表示する事が多いだろう。

JavaScriptがテキストエリアの入力を検知して、リアルタイムでマークダウンをHTMLに変換、それを表示しているのだ。

このPythonライブラリのMarkdownで、同じことをやろうとすると、Ajaxを使うしかない。

しかし、キー入力をするたびにAjaxでリクエストを飛ばしているようでは、クライアント、サーバーともに甚大な負荷がかかる。

よって、マークダウンの入力と同時にプレビューをするには、JavaScriptのmarked.jsを使うしか方法はないのだ。

今回のPythonのMarkdownは、このプレビューを考慮するとあまり得策とは言えないだろう。


## 結論

これで、Djangoでマークダウンを使って表現をする事ができたが、まだまだ課題は山積みである。

とりわけ、JavaScriptでマークダウンを表現したほうが良いかもしれない。

一応、方法論の1つとして知っておく程度で良いだろう。

あとは、適当にCSSを用意する。

## 参照元

- https://pypi.org/project/Markdown/
- https://learndjango.com/tutorials/django-markdown-tutorial
- https://python-markdown.github.io/extensions/

