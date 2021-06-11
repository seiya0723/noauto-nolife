---
title: "Djangoビギナーが40分で掲示板アプリを作る方法"
date: 2020-10-20T14:20:34+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","スタートアップシリーズ","初心者向け" ]
---

公式のDjangoチュートリアルではよくわからない方に捧げる

対象読者は既にDjangoをインストール済み、Linux系コマンド習得済み、Python及びHTML/CSS/JSの基本構文を把握済みとする。

## 流れ

以下、流れ。

1. プロジェクトを作る(5分)
1. アプリを作る(5分)
1. settings.pyの書き換え(5分)
1. urls.pyでURLの指定(5分)
1. views.pyで処理の定義(5分)
1. templatesでHTMLの作成(5分)
1. models.pyでフィールドの定義(5分)
1. マイグレーション実行(2分)
1. views.pyでDBへアクセス(5分)
1. 開発用サーバーを起動する(3分)


初心者向けの記事につき、forms.pyのバリデーション、デプロイ、DB設定、Ajaxなどは割愛する。

また、views.pyはクラスベースのビューを採用。

## プロジェクトを作る(5分)

    mkdir startup_bbs
    cd startup_bbs
    django-admin startproject config .

予めディレクトリを作っておき、その状態で`django-admin startproject config .`を実行することで`settings.py`や`urls.py`等の設定ファイルをconfigディレクトリ内に収めることが可能。

## アプリを作る(5分)

下記コマンドでbbsアプリを作る。

    python3 manage.py startapp bbs


## settings.pyの書き換え(5分)

冒頭に下記を追加

    import os

`INSTALLED_APPS`に下記を追加

    'bbs.apps.BbsConfig',

`TEMPLATES`の`DIRS`に下記を追加

    os.path.join(BASE_DIR,"templates")

`LANGUAGE_CODE`、`TIME_ZONE`を下記に変更

    LANGUAGE_CODE = 'ja'
    TIME_ZONE = 'Asia/Tokyo'

## urls.pyでURLの指定(5分)

`config/urls.py`を下記に修正

    from django.contrib import admin
    from django.urls import path,include
    
    urlpatterns = [
        path('admin/', admin.site.urls),
        path('', include("bbs.urls")),
    ]

`bbs/urls.py`を作成、内容は下記

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [
        path('', views.index, name="index"),
    ]

## views.pyで処理の定義(5分)

まずはGET文を正常に処理させるように書く。`bbs/views.py`に下記を書き込む。

    from django.shortcuts import render
    from django.views import View
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            return render(request,"bbs/index.html")
    
    index   = BbsView.as_view()


上記`views.py`はGET文を受け取ったら、`templates/bbs/index.html`のレンダリングをするという意味。`urls.py`から呼び出される`views.index`は`BbsView.as_view()`、即ち`BbsView`の処理のことである。

`render()`にはレンダリング対象のHTMLを指定する。とは言え、`templates/bbs/index.html`はまだ存在しないので次の項目で作成する。

`*args`、`**kwargs`についての詳細は下記を参考に。

[DjangoやPythonにおける\*argsと\*\*kwargsとは何か](/post/django-args-kwargs/)


## templatesでHTMLの作成(5分)

まず、プロジェクトディレクトリ直下に`templates`ディレクトリを作る。続いて`bbs`ディレクトリを作る

    mkdir -p templates/bbs/
   
こういうときは`mkdir`コマンドの`-p`オプション使うことで、2階層以上のディレクトリを一気に作れる。

続いて`templates/bbs/index.html`を作る。下記をそのままコピペでOK。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                {{ topic.comment }}
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>


## models.pyでフィールドの定義(5分)

`bbs/models.py`に下記を記入。

    from django.db import models
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment


テーブル名は`topic`、そのテーブルの中に文字列型のデータを格納するフィールド、即ち`models.CharField()`の`comment`を定義する。

テーブルの主キーは数値型かつオートインクリメントの`id`が、`models.Model`を継承した時点で付与されている。だから特別な理由(数値型ではない主キーを指定したいなど)を除き、あえて`id`まで定義する必要はない。

## マイグレーション実行(2分)

`models.py`で定義したフィールドはマイグレーションを実行して、DBに格納先のテーブルを作る。この時、`settings.py`の`INSTALL_APPS`に含まれていないものはマイグレーションを実行してもマイグレーションファイルが生成されない点に注意。

    python3 manage.py makemigrations
    python3 manage.py migrate

マイグレーションが完了すると下記画像のようになる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-20 15-55-43.png" alt="マイグレーション成功"></div>

## views.pyでDBへアクセス(5分)

`views.py`はクライアントから受け取ったデータをDBに保存したり、DBからデータを抜き取ってページに表示させなければならない。故に、下記の様に`views.py`を書き換える。

    from django.shortcuts import render,redirect

    from django.views import View
    from .models import Topic

    class BbsView(View):

        def get(self, request, *args, **kwargs):

            topics  = Topic.objects.all()
            context = { "topics":topics }

            return render(request,"bbs/index.html",context)

        def post(self, request, *args, **kwargs):

            posted  = Topic( comment = request.POST["comment"] )
            posted.save()

            return redirect("bbs:index")

    index   = BbsView.as_view()

`models.py`の中にある`Topic`クラスを`import`する。これでDBへデータの読み書きができるようになる。

`get`メソッドでは全データの参照、`post`メソッドではクライアントから受け取ったデータをDBへ書き込んでいる。

`post`メソッドではデータを書き込んだ後、`get`メソッドへリダイレクトしている。このリダイレクトをする時、`bbs/urls.py`に書いた`app_name`と`name`を組み合わせてURLを逆引きし、リダイレクト先を指定している。

    redirect("[app_name]:[name]")


## 開発用サーバーを起動する(3分)

開発用サーバーを起動させ、動作を確かめる。

    python3 manage.py runserver 127.0.0.1:8000

上記コマンドを実行した後、 http://127.0.0.1:8000/ にアクセスする。下記のような画面が表示されれば成功。

<div class="img-center"><img src="/images/Screenshot from 2020-10-20 16-07-52.png" alt="簡易掲示板の完成"></div>

## ソースコードDL先

https://github.com/seiya0723/startup_bbs
