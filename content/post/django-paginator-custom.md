---
title: "【django.core.paginator】一度に2ページ以上ジャンプできるように改良する【inclusion_tag()】"
date: 2021-05-07T09:50:13+09:00
draft: false
thumbnail: "/images/Screenshot from 2021-05-09 11-23-27.png"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","カスタムテンプレートタグ" ]
---


[以前のページネーション実装記事](/post/django-paginator/)では、検索とページのパラメーターの両立を行った。

しかし、このページネーションは1ページずつしか移動できない。つまり、1ページ目の状態から2ページ目に行くことはできても、3ページ目にジャンプすることはできないのだ。

そこでページネーションを改良させ、一度に2ページ以上ジャンプできるように改良する。

## やりたいことと方法論の解説


### やりたいこと

要するに、本記事でやりたいのはこういうこと。

<div class="img-center"><img src="/images/Screenshot from 2021-05-07 10-00-48.png" alt="やりたいこと"></div>

いまアクセスしているページから1つ前と次のページだけを表示させるのではなく、1つ以上前と次のページのリンクを表示させる。

### 方法論


その方法論がこちら。

<div class="img-center"><img src="/images/Screenshot from 2021-05-07 10-21-33.png" alt="方法論"></div>

最初のページを`F`、いまアクセスしているページを`N`、最後のページを`L`とする。今アクセスしているページから1ページ以上の前と次の加減算分を`n`とする。

すると、これで方法論が確立する。即ち、こうなる。
    
    F >= N-n の時はリンクは非表示 (最初のページよりもはみ出してしまうため)
    F <  N-n の時はリンクは表示   (最初のページよりもはみ出さないため)

    L <= N+n の時はリンクは非表示 (最後のページよりもはみ出してしまうため)
    L >  N+n の時はリンクは表示   (最後のページよりもはみ出さないため)

最初と最後のページにはみ出さないようにリンクを作るには、最初と最後のページと比較する。範囲内であれば表示、範囲外であれば非表示にさせる。

## ソースコード

[以前のページネーション実装記事](/post/django-paginator/)の[コード](https://github.com/seiya0723/simple_ecsite)を元に改修を施す。

ただ、今回の件はジャンプする範囲を指定したり、ループで表現できる部分があるため、ただのカスタムテンプレートタグ(`@register.simple_tag()`)ではなく、埋め込み型のカスタムテンプレートタグ(`@register.inclusion_tag()`)で再現する。こちらのほうがテンプレートの見通しが良くなる。

まず、ページネーションのHTMLを作る。これを`templatetags/paginator.html`とする。

    <ul class="pagination justify-content-center">
        {% for page in pages %}
        <li class="page-item"><a class="page-link" {% if page.link %}href="{{ page.link }}"{% endif %}>{{ page.name }}</a></li>
        {% endfor %}
    </ul>

この`paginator.html`はページのリンクとページ番号の辞書型のリストを受け取り、DTLのforループで表示させている

続いて、その辞書型のリストを生成する、埋め込み型カスタムテンプレートタグを作る。前回と同様に`shopping/templatetags/param_change.py`を以下のように書き換える。

    from django import template
    
    register = template.Library()
    
    def param(request,key,value):
    
        copied          = request.GET.copy()
        copied[key]     = value
    
        return "?" + copied.urlencode()
    
    
    @register.inclusion_tag("shopping/paginator.html")
    def generate_pagelink(request,key,start,end,now):
    
        PAGE_RANGE  = 3
    
        start   = int(start)
        end     = int(end)
        now     = int(now)
    
        pages   = []
    
        #ここで最初のページの生成、リンクは今のページと判定
        if now != start:
            pages.append( { "name":"最初のページ","link":param(request,key,start) })
        else:
            pages.append( { "name":"最初のページ","link":"" })
    
        for i in range( now-PAGE_RANGE,now+PAGE_RANGE+1 ):
    
            #いまアクセスしているページはリンクなしでアペンド、次のループへ
            if i == now:
                pages.append( { "name":str(i),"link":"" })
                continue
            
            #範囲外なら次のループへ(アーリーリターン)
            if i <= start or end <= i:
                continue
    
            pages.append( { "name":str(i),"link":param(request,key,i) })
            print(pages)
    
            
        #ここで最初のページの生成、リンクは今のページと判定
        if now != end:
            pages.append( { "name":"最後のページ","link":param(request,key,end) })
        else:
            pages.append( { "name":"最後のページ","link":"" })
    
        return { "pages":pages }
    
埋め込み型カスタムテンプレートタグなので、まず`@register.inclusion_tag()`に引数としてテンプレートを指定する。この引数に指定したテンプレートに`return`した値が渡され、レンダリングが行われる。

処理内容は辞書型のリストを1ページずつスタックしている。ロジックは前項の方法論の通り。

後は、通常のカスタムテンプレートタグと同じ。以下を`INSTALLED_APPS`に追加。

    'shopping.templatetags.param_change',

このカスタムテンプレートタグを使いたい箇所で`{% load param_change %}`読み込みをする。関数名を指定して呼び出し。

    {% load param_change %}
    {% generate_pagelink request "page" "1" data.paginator.num_pages data.number %}

引数はリクエストオブジェクト、ページを意味するパラメータ名(キー)、開始ページ番号、終端ページ番号、いまアクセスしているページこの5つ。

これでこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-05-09 11-14-55.png" alt="ページネーション"></div>

<div class="img-center"><img src="/images/Screenshot from 2021-05-09 11-23-27.png" alt="ページネーション"></div>

やや見づらい気もするが、一応これで一度に数ページジャンプできる。後は装飾をどうにかすれば実用に堪えるであろう。

## 結論

難しいのは方法論で、実際にコードを書いてみるとそれほど難しいものではないことがわかる。ただ、引数が多いのはどうにかしたいところだ。改良の余地ありと思われる。

一応、前回のコードと同様に`page`パラメータのみを書き換えてそれ以外はそのままにしているので、この方法でも検索などの他パラメータを維持することができる。

また、ジャンプできるページの最大数は`PAGE_RANGE`と`param_change.py`にハードコードしている点もいかがかと。`settings.py`に最大ジャンプページ数を書き込んでそれを読み込みするスタイルにしたほうが汎用性が高いかもしれない。


## ソースコード

https://github.com/seiya0723/paginator_custom



