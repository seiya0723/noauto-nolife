---
title: "【Django】allauthのurls.pyをカスタムする【新規アカウント作成、パスワード変更処理の無効化など】"
date: 2021-05-25T09:49:51+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","allauth","上級者向け","セキュリティ" ]
---

Django-allauth。とても便利ではあるが、運用する場所によっては必要のない処理も含まれている。

例えば、新規アカウント作成の処理。これは限られた人間しかアクセスを許されないサイト(例:社員用のウェブアプリ等)の場合、部外者が勝手にアカウントを作り、内部へのアクセスを許してしまう。

そこで、新規アカウント作成処理やパスワード変更処理などを無効化させる。そのためには、allauthのurls.pyをカスタムし、割り当てている処理を書き換える。


## config/urls.py

    from django.contrib import admin
    from django.urls import path,include
    
    from . import allauth_urls
    
    urlpatterns = [ 
        path('admin/', admin.site.urls),
    
        #path('accounts/', include('allauth.urls')),
        path('accounts/', include(allauth_urls)),
    ]

通常であれば`allauth.urls`を`include`するが、`urls.py`をカスタムするため、別に作った`config/allauth_urls.py`を`include`する。

## config/allauth_urls.py

allauthのGitHubからコピペして、新たに`allauth_urls.py`を作り、改修する。


    from django.urls import path,include,re_path
    from allauth.account import views
    
    #無効化したい処理をリダイレクト
    #TIPS:処理が無効化されている旨を表示させるにはTemplateViewでテンプレートを表示させる
    from django.views.generic.base import RedirectView
    
    #accounts関係
    #https://github.com/pennersr/django-allauth/blob/master/allauth/account/urls.py
    
    urlpatterns = [
    
        #無効化させたい処理をコメントアウト、汎用ビューのリダイレクトを処理に割り当て
        #path("signup/", views.signup, name="account_signup"),
        path("signup/", RedirectView.as_view(url="/"), name="account_signup"),
    
    
        path("login/", views.login, name="account_login"),
        path("logout/", views.logout, name="account_logout"),
        path(
            "password/change/",
            views.password_change,
            name="account_change_password",
        ),  
        path("password/set/", views.password_set, name="account_set_password"),
        path("inactive/", views.account_inactive, name="account_inactive"),
        # E-mail
        path("email/", views.email, name="account_email"),
        path(
            "confirm-email/",
            views.email_verification_sent,
            name="account_email_verification_sent",
        ),  
        re_path(
            r"^confirm-email/(?P<key>[-:\w]+)/$",
            views.confirm_email,
            name="account_confirm_email",
        ),  
        # password reset
        path("password/reset/", views.password_reset, name="account_reset_password"),
        path(
            "password/reset/done/",
            views.password_reset_done,
            name="account_reset_password_done",
        ),  
        re_path(
            r"^password/reset/key/(?P<uidb36>[0-9A-Za-z]+)-(?P<key>.+)/$",
            views.password_reset_from_key,
            name="account_reset_password_from_key",
        ),  
        path(
            "password/reset/key/done/",
            views.password_reset_from_key_done,
            name="account_reset_password_from_key_done",
        ),  
    ]
    
    #ソーシャルアカウント関係
    #https://github.com/pennersr/django-allauth/blob/master/allauth/urls.py
    
    from importlib import import_module
    from allauth.socialaccount import providers
    from allauth import app_settings
    
    if app_settings.SOCIALACCOUNT_ENABLED:
        urlpatterns += [path("social/", include("allauth.socialaccount.urls"))]
    
    # Provider urlpatterns, as separate attribute (for reusability).
    provider_urlpatterns = []
    for provider in providers.registry.get_list():
        try:
            prov_mod = import_module(provider.get_package() + ".urls")
        except ImportError:
            continue
        prov_urlpatterns = getattr(prov_mod, "urlpatterns", None)
        if prov_urlpatterns:
            provider_urlpatterns += prov_urlpatterns
    urlpatterns += provider_urlpatterns



汎用ビュー(`django.views.generic.base`)の`RedirectView`を使用して、処理内容`allauth`のビューから書き換える。

この状態で、`http://127.0.0.1:8000/accounts/signup/`にアクセスしようとするとトップページにリダイレクトされる。これでアカウント作成処理は無効化された。

### Q1:なぜ削除ではないのか？

allauthの一部のテンプレートとビューで`name`を指定してURLを逆引きしている。そのため、無効化したいからと言ってその`path()`をまるごと削除してしまうと逆引きに失敗してエラーが出る。

同様に、`name`を書き換えてしまうとエラーが出る。

そこで、`name`はそのままに、処理内容だけ書き換える(リダイレクトさせる)ことで対処した。

### Q2:処理が無効化されている旨を表示させるには？

汎用ビューの`TemplateView`を使い、適当なテンプレートを指定してあげれば、処理が無効化されている旨を表示できる。

## 結論

これでアカウント作成、パスワード変更などのセキュリティ的にきわどい処理を無効化させることができる。実際に新しくアカウントを追加したり、パスワードの変更などを行う際には管理サイトから行うと良いだろう。

後は、allauthのテンプレートを改修して、無効化させた処理のリンク、今回であればアカウント作成のリンクを削除するなどをすれば良いだろう。allauthのテンプレートの装飾や改修などは下記記事からできる。

[Django-allauthのログインページの装飾を装飾する【テンプレートの追加】](/post/django-allauth-loginpage/)



