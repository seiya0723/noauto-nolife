---
title: "Djangoビギナーが40分で掲示板アプリを作る方法"
date: 2020-10-20T14:20:34+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "django","スタートアップシリーズ","初心者向け" ]
---

公式のDjangoチュートリアルではよくわからない方に捧げます。

対象読者は既にDjangoをインストール済み、Linux系コマンド習得済み、Python及びHTML/CSS/JSの基本構文を把握済みとします。

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


初心者向けの記事につき、forms.pyのバリデーション、デプロイ、DB設定、Ajaxなどは割愛します。

また、views.pyはクラスベースのビューを採用。

## プロジェクトを作る(5分)

    mkdir startup_bbs
    cd startup_bbs
    django-admin startproject config .

予めディレクトリを作っておき、その状態で`django-admin startproject config .`を実行することでsettings.pyやurls.py等の設定ファイルをconfigディレクトリ内に収めることができます。

## アプリを作る(5分)

下記コマンドでbbsアプリを作る。

    python3 ./manage.py startapp bbs


## settings.pyの書き換え(5分)

冒頭、に下記を追加

import os

INSTALLED_APPSに下記を追加

    'bbs.apps.BbsConfig',

TEMPLATESのDIRSに下記を追加

    os.path.join(BASE_DIR,"templates")

LANGUAGE_CODE、TIME_ZONEを下記に変更

    LANGUAGE_CODE = 'ja'
    TIME_ZONE = 'Asia/Tokyo'

## urls.pyでURLの指定(5分)

`config/urls.py`を下記に修正

    from django.contrib import admin
    from django.urls import path,include
    
    urlpatterns = [
        path('admin/', admin.site.urls),
        path('', include("bbs.urls"), name="bbs"),
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


上記views.pyはGET文を受け取ったら、`bbs/index.html`のレンダリングをする。とは言え、templatesの`bbs/index.html`はまだ存在しないので次の項目で作成する。

## templatesでHTMLの作成(5分)

まず、プロジェクトディレクトリ直下にtemplatesディレクトリを作る。続いてbbsディレクトリを作る

    mkdir -p templates/bbs/
   
こういうときは-pオプション使えば楽。templates/bbs/index.htmlを作る。下記をそのままコピペでOK


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
    
            {% for content in data %}
            <div class="border">
                {{ content.comment }}
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


## マイグレーション実行(2分)

models.pyで定義したフィールドはマイグレーションを実行して、DBに格納先のテーブルを作る。この時、settings.pyのINSTALL_APPSに含まれていないものはマイグレーションされない点に注意。

    python3 manage.py makemigration
    python3 manage.py migrate

マイグレーションが完了すると下記画像のようになる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-20 15-55-43.png" alt="マイグレーション成功"></div>

## views.pyでDBへアクセス(5分)

views.pyはクライアントから受け取ったデータをDBに保存したり、DBからデータを抜き取ってページに表示させなければならない。故に、下記の様にviews.pyを書き換える。

    from django.shortcuts import render,redirect

    from django.views import View
    from .models import Topic

    class BbsView(View):

        def get(self, request, *args, **kwargs):

            data    = Topic.objects.all()
            context = { "data":data }

            return render(request,"bbs/index.html",context)

        def post(self, request, *args, **kwargs):

            posted  = Topic( comment = request.POST["comment"] )
            posted.save()

            data    = Topic.objects.all()
            context = { "data":data }

            return redirect("bbs:index")

    index   = BbsView.as_view()



## 開発用サーバーを起動する(3分)

開発用サーバーを起動させ、動作を確かめる。

    python3 manage.py runserver 127.0.0.1:8000

上記コマンドを実行した後、 http://127.0.0.1:8000/ にアクセスする。下記のような画面が表示されれば成功。


<div class="img-center"><img src="/images/Screenshot from 2020-10-20 16-07-52.png" alt=""></div>

## ソースコードDL先

https://github.com/seiya0723/startup_bbs
