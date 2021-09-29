---
title: "DjangoでHelloWorld【HttpResponse及びレンダリング】"
date: 2020-11-16T08:50:24+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け","スタートアップシリーズ" ]
---

Djangoのハローワールドは、やり方が何通りもある。

普通のPythonであれば、

    print("HelloWorld")

ほぼこの一通りであるが、Djangoの場合は主にHttpResponseの他に、テンプレートをレンダリングして返す方法がある。

一般的な開発においてはテンプレートのレンダリングが主流である。しかし、Django初心者、フレームワーク未経験者には難度が高い。故に、本記事では難度の低いHttpResponseから解説する。

## Djangoのハローワールドの方法一覧

以下がDjangoにおけるハローワールドの方法一覧である。難度の低い順に並べる。

- HttpResponseによる方法
    - 関数ベースのビューからHttpResponseを返したHelloWorld
    - クラスベースのビューからHttpResponseを返したHelloWorld
- テンプレートレンダリングによる方法
    - 関数ベースのビューからテンプレートレンダリングを返したHelloWorld
    - クラスベースのビューからテンプレートレンダリングを返したHelloWorld

ビューを作るには、関数ベースのビューとクラスベースのビューの2通りがある。

関数ベースのビューは汎用性に乏しいものの実装が容易、クラスベースのビューは継承を使うことで再利用可能になりコーディングが楽になるが、オブジェクト指向の知識が必要である。

## 関数ベースのビューからHttpResponseを返したHelloWorld

まず`プロジェクト名/urls.py(もしくはconfig/urls.py)`を以下のように編集する。(※アプリ内に`urls.py`を作ってパスを通す方法もあるが、今回はより簡単な`config`の`urls.py`に直接書き込む)

    from django.contrib import admin
    from django.urls import path
    
    from home import views as homeviews
    
    urlpatterns = [ 
        path('admin/', admin.site.urls),
        path('', homeviews.index),
    ]

意味は、`home`アプリ内にある`views.py`を`homeviews`として扱い、トップページ(`''`)にアクセスしたら、`homeviews`の`index`関数を実行するように指定している。`path`関数の引数として与える際に実行するわけではないので、`homeviews.index()`ではなく、`homeviews.index`である点に注意。

`home`アプリを作るには下記コマンドを実行する

    python3 manage.py startapp home

`home`ディレクトリ内に`views.py`がある。ここに関数`index`を作る。`views.py`を下記のように編集する。

    from django.http import HttpResponse
    
    def index(request):
        return HttpResponse("ハローワールド")

この状態で、開発サーバーを起動する。

    python3 manage.py runserver 127.0.0.1:8000

すると、 http://127.0.0.1:8000/ にはこんな画面が表示される。

<div class="img-center"><img src="/images/Screenshot from 2020-11-16 11-01-37.png" alt="ハローワールド"></div>

## クラスベースのビューからHttpResponseを返したHelloWorld

先の項目の状態から`views.py`を以下のように書き換える。

    from django.http import HttpResponse
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):
            return HttpResponse("ハローワールド")
    
    index   = IndexView.as_view()

`django.views`から`View`を継承してクラスを定義している。多少回りくどいが、開発規模が大きくなるとクラスベースのビューが簡潔。さらに継承させることでシンプルにコードを書くことができる。

`index   = IndexView.as_view()`によりビュークラスを関数化させ、`urls.py`から関数ベースのビューと同じように呼び出せるようにしている。

この状態で開発サーバーを起動するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-16 11-01-37.png" alt="ハローワールド"></div>

## 関数ベースのビューからテンプレートレンダリングを返したHelloWorld

まず、templatesディレクトリをhomeディレクトリ内に作る

    mkdir ./home/templates/

上記ディレクトリ内に`index.html`を作る。内容は下記。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>ハローワールド</title>
    </head>
    <body>
        <p>Hello World !!</p>
    </body>
    </html>

ビューを編集する。先のテンプレートを呼び出し、レンダリングさせる。

    from django.shortcuts import render
    
    def index(request):
        return render(request,"index.html")
    
`render`関数は、テンプレートをレンダリングすると共に、クライアントに対してレスポンスを返す。HttpResponseが単にレスポンスを返すのに対し、renderはテンプレートのレンダリングをした上でレスポンスを返す。

レンダリングとはテンプレートに書かれてあるDTL(Django Template Language)を解釈し、クライアントがWebページとして閲覧できるようにすることを言う。HttpResponseで返却されるのはただの文字列であるが、renderはhtmlファイルを指定できる。

開発サーバーを起動してブラウザを立ち上げるとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-16 13-00-32.png" alt="ハローワールド"></div>

## クラスベースのビューからテンプレートレンダリングを返したHelloWorld

クラスベースのビューからテンプレートをレンダリングするには、ビューを編集する。

    from django.shortcuts import render
    from django.views import View
    
    class IndexView(View):
    
        def get(self,request):
            return render(request,"index.html")

    index   = IndexView.as_view()

`HttpResponse`から`render`に書き換える。

同様に開発サーバーを起動するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-16 13-00-32.png" alt="ハローワールド"></div>

## 結論

簡単に記述しようとすると、どうしても本格的に開発する時に書き直さないといけない。関数ベースのビュー、HttpResponseやアプリディレクトリ内にtemplatesを置く方法は大規模開発のときにはかえって回りくどくなってしまう。

短期間で手法を習得しなければならない場合は、クラスベースのビューを使用し、templatesやstaticをプロジェクト直下に設置するよう設定を施したほうが良いかと。下記記事にその手法がある

[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)


