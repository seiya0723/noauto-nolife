---
title: "DjangoでPythonライブラリのマークダウンを試してみる【pip install Markdown】"
date: 2022-10-16T22:51:20+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","Pythonライブラリ","ウェブデザイン","追記予定" ]
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

近日追記予定。








## 結論

これで、Djangoでマークダウンを運用する兆しが見えてきたと思う。


## 参照元

- https://pypi.org/project/Markdown/
- https://learndjango.com/tutorials/django-markdown-tutorial
- https://python-markdown.github.io/extensions/




