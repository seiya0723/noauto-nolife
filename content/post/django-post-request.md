---
title: "DjangoでHTTPリクエストのPOSTメソッドを送信する"
date: 2021-10-04T07:54:13+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","初心者向け" ]
---


[DjangoでHelloWorld【HttpResponse及びレンダリング】](/post/startup-django-helloworld/)にて、HelloWorldをやった人向け。本記事はビュークラスとテンプレートを使用した場合を想定して解説する。

DjangoでHTTPリクエストのPOSTメソッドを送信する。これにより、データをリクエストボディに含ませることが可能になり、HTTPSを実装すれば投稿内容の暗号化も可能になる。

## 手順

1. views.pyのビュークラスにて、POSTメソッドを追加する
1. テンプレートにformタグ等を追加する
1. POSTメソッドのデータを参照するキー名とformタグのname属性を合わせる

## views.pyのビュークラスにて、POSTメソッドを追加する

まずは、下記のようにgetメソッドの書き方に倣って、postメソッドを追加する。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            return render(request,"index.html")
        
        def post(self, request, *args, **kwargs):
            return render(request,"index.html")
    
    index   = IndexView.as_view()

`*args`と`**kwargs`については[DjangoやPythonにおける*argsと**kwargsとは何か](/post/django-args-kwargs/)を参照。

## テンプレートにformタグ等を追加する

`index.html`に`form`タグなどを追加する。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>ハローワールド</title>
    </head>
    <body>
        <p>Hello World !!</p>

        <form action="" method="POST">
            {% csrf_token %}
            <input type="text" name="comment">
            <input type="submit" value="送信">
        </form>

    </body>
    </html>

まず`form`タグを作る。`action`属性はリクエストの送信先のURLを指定する。未指定であれば表示したページと同じページに送信する。`method`属性は`POST`を指定することで、POSTメソッドのHTTPリクエストの送信が可能になる。未指定であればGETメソッドの送信になる。

POSTメソッドを送信する上で無くてはならないのが、`{% csrf_token %}`。これはCSRFというセキュリティ攻撃の対策として、トークンを供給するためのテンプレートタグ。この`{% csrf_token %}`が無いPOSTメソッドは、必ずサーバー側で拒否されるので、欠落しないようにする。

`form`タグの子要素として2つの`input`タグを書く。ひとつは`type`属性にtextを指定。これでテキストボックスになる(未指定でも可)。`name`属性に`comment`を指定する。この`name`属性の値を使用して、サーバーサイドが値を確認する。2つめの`input`タグは`type`属性に`submit`を指定する。この`submit`を指定することで送信ボタンとして機能する。そのため、`value`属性に『送信』と書いて、ボタンに『送信』と表示させる。

## POSTメソッドのデータを参照するキー名とformタグのname属性を合わせる

先ほど、`name`属性に`comment`を指定したので、ビュー側でその`comment`を参照する。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
            return render(request,"index.html")
        
        def post(self, request, *args, **kwargs):
            print(request.POST["comment"])
            return render(request,"index.html")
    
    index   = IndexView.as_view()


`request`オブジェクト内にPOST属性がある。この属性は辞書型扱いなので、キーを指定することで値を参照できる。送信されたPOSTメソッドのデータからcommentを表示させるためには下記のように記述する。

    request.POST["comment"]

## 実際に動かしてみる

フォームに適当な文字列を入力して、送信ボタンを押すと、ターミナルにそのまま内容が表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-10-04 15-55-32.png" alt="POST文の送信ができた"></div>

## 結論

POSTメソッドを送信する上でやることをまとめる。

- まず、views.pyにて、getメソッドと同様にpostメソッドを作る。
- formタグのmethod属性にPOSTを指定する
- POSTメソッドを送信する際には`{% csrf_token %}`を忘れずに
- name属性の値とrequest.POSTのキーを一致させる

POSTメソッドの送信と`models.py`を組み合わせることで、クライアントが投稿したデータがDBへ保存されるようになる。これにより、簡易掲示板等のシンプルなウェブアプリを作ることができる。

詳しくは下記記事を参照。

[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)

また、このPOSTメソッドを送信した状態で、F5キーを押したりしてページの更新をすると、警告が出る。

『このページを表示するにはフォームデータを再度送信する必要があります。フォームデータを再送信すると以前実行した検索、投稿や注文などの処理が繰り返されます。』

この警告の対策に関しては下記を参照。

[Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法](/post/django-redirect/)
