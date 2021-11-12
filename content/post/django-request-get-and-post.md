---
title: "【Django】formタグを使ってHTTPリクエストのGETメソッド、POSTメソッドを送信する"
date: 2021-11-12T07:12:45+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","初心者向け" ]
---

## 前提

[DjangoでHelloWorld【HttpResponse及びレンダリング】](/post/startup-django-helloworld/)ができた状態を前提として話を進める。


## HTTPリクエストのGETメソッドの送信方法

用途は主に、検索がある。

まず`index.html`

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">
    
            <form action="" method="GET">
                <input type="text" name="search" value="{{ request.GET.search }}" placeholder="キーワード"> 
                <input type="submit" value="検索">
            </form>
    
        </main>
    </body>
    </html>

formタグの`method`属性はGETメソッドを送信するので、GETと指定する(小文字のgetでも良い)。`action`属性はリクエストの送信先URLを指定する。今回の送信先はこのページを表示したビューと同じURLなので未記入で良い。

続いて`views.py`を編集する。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):

            if "search" in request.GET:
                print(request.GET["search"])

            return render(request,"index.html")
    
    index   = IndexView.as_view()

request.GETは辞書型であり、リクエスト送信時のデータが格納されている。

もし、GETメソッドのデータとして`search`があればそれをprint文で表示する。この`search`は`index.html`の`form`タグ内に指定した`input`タグの`name="search"`から来ている。

つまり、`input`タグの`name`属性が変わった場合、それに合わせてビューから呼び出す処理も書き換える。

実践では、このビューの部分の処理を検索の処理に置き換える。[.filter()](/post/django-or-and-search/)を使うと良いだろう。


## HTTPリクエストのPOSTメソッドの送信方法

用途は主にデータの書き込み、編集、削除などがある。

まず`index.html`

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">
    
            <form action="" method="GET">
                <input type="text" name="search" value="{{ request.GET.search }}" placeholder="キーワード"> 
                <input type="submit" value="検索">
            </form>
    
            <form action="" method="POST">
                {% csrf_token %}
                <input type="text" name="comment" placeholder="コメント">
                <input type="submit" value="送信">
            </form>
    
        </main>
    </body>
    </html>


注意しなければならないのは、`{% csrf_token %}`をformタグ内に記入すること。これを忘れると、CSRFトークンの検証失敗によりPOSTメソッドがビューに行き着かない。

続いて、`views.py`

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):

            if "search" in request.GET:
                print(request.GET["search"])

            return render(request,"index.html")

        def post(self,request):

            if "comment" in request.POST:
                print(request.POST["comment"])

            return render(request,"index.html")
    
    index   = IndexView.as_view()


GETメソッドと同様に送信した`name`属性に合わせてビュー側でデータを引き出す。

実践ではここで、受け取ったデータで[DBへ書き込み](/post/startup-django/)をする。もしくは[forms.pyでバリデーションをした上で書き込み](/post/django-forms-validate/)をする。

また、POSTメソッドを送信した状態で、`render()`を実行するのは好ましくない。なぜなら、POSTメソッドを送信した状態で、F5キーを押すなどして、ページを更新すると、

    『このページを表示するにはフォームデータを再度送信する必要があります。フォームデータを再送信すると以前実行した検索、投稿や注文などの処理が繰り返されます。』

という文言が出る。そのまま再送信を押すと、POSTメソッドが再び送信される。具体的な対策方法は下記を参照。

[Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法](Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法)

## 結論

このformタグを使ってのリクエストの送信が実現できれば、後はモデルを定義するだけで[DBへの書き込みや読み込み](/post/startup-django/)、[検索](/post/django-or-and-search/)などが実現できる。


