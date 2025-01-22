---
title: "【Django】allauth不使用でユーザー認証機能を実装した簡易掲示板【ログインとログアウトのみ】"
date: 2022-01-01T07:00:48+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","allauth","セキュリティ" ]
---

Djangoでは、サードパーティー製ライブラリとしてdjango-allauthを使用することで、誰でも簡単にユーザー認証機能を実装させることができる。

とはいえ、事情によってライブラリの使用が制限されていたり、単なるユーザーIDとパスワードによるログインを行いたいだけであれば、デフォルトの`LoginView`及び、`LogoutView`を使えば簡単に実装できる。

本記事ではallauthよりも手っ取り早く認証を実装する手法を解説する。元となるソースコードは[40分Django簡易掲示板](/post/startup-django)。

## config/settings.py

`settings.py`にて、下記を追加する。

    LOGIN_REDIRECT_URL = "/" 
    LOGOUT_REDIRECT_URL = "/accounts/login/"

つまり、ログインをしたらトップページ(アプリのページ)、ログアウトをしたらログインフォームを表示するページにそれぞれリダイレクトをする。

## config/urls.py

`config/urls.py`にてログイン系の処理を登録する。

    from django.contrib import admin
    from django.urls import path,include
    
    from django.contrib.auth import views
    
    urlpatterns = [ 
        path('admin/', admin.site.urls),
        path("",include("bbs.urls")),
    
        #path("accounts/", include("django.contrib.auth.urls")),
    
        path("accounts/login/", views.LoginView.as_view(), name="login"),
        path("accounts/logout/", views.LogoutView.as_view(), name="logout"),
    ]

コメントアウトされている、`django.contrib.auth.urls`は、パスワードの変更や再設定も含まれているので、今回は使用しない。

ログインとログアウトのみとし、ユーザーの作成やパスワード変更処理などは管理サイトに一任させる使用にするため、ログインとログアウトの処理のみ登録した。


## templates/registration/login.html

ログイン時には当然ログインフォームを表示させなければならない。そのテンプレートを作る必要がある。

`registration/login.html`という名前は決まっているので、間違えないようにファイルを作成する。内容は下記。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <h1>ログイン</h1>
    
        <form action="" method="POST">
            {% csrf_token %}
            {{ form.as_p }}
            <input type="submit" value="ログイン">
        </form>
    
    </body>
    </html>

`forms.py`のテンプレートが利用できるのでそのまま使った。メソッドはPOSTで、CSRFトークンも忘れずに。

## 動かすとこうなる

たったこれだけで、`/accounts/login/`にアクセスするとログイン画面が表示される。

<div class="img-center"><img src="/images/Screenshot from 2022-01-02 07-55-23.png" alt=""></div>

## 特定ビュークラスで、ログインしていない場合は処理しないようにするには

`LoginRequiredMixin`をビュークラスの継承元として第一引数に指定する。多重継承する形になる。

    from django.shortcuts import render,redirect
    from django.contrib.auth.mixins import LoginRequiredMixin
    from django.views import View

    from .models import Topic
    
    
    class BbsView(LoginRequiredMixin,View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


これでログインをしていないユーザーはログインフォームにリダイレクトされる。

## 結論

django-allauthを実装すれば、ユーザー認証に必要なアカウント新規作成などの機能に加え、テンプレートまで用意してくれる。一般的なSNS等を運用する場合はこちらのほうが手軽。

しかし、アカウントの新規作成は管理サイトのみで行い、パスワードの変更も管理者の許可を経て行う形式にしたい場合、Djangoのデフォルトの認証機能をそのまま使うほうが良いだろう。


