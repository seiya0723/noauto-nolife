---
title: "【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】"
date: 2020-10-24T16:32:35+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "スタートアップシリーズ","django","allauth","セキュリティ","認証" ]
---


ここに、Django-allauthの実装方法をまとめる。主に`settings.py`を操作することになる。

また、allauth付属のテンプレートではHTMLのみなのでテンプレート及びCSSによる装飾も付せて説明する。

## はじめに

django-allauthは外部ライブラリなので、pipコマンドでインストールする必要がある。

    pip install django-allauth


## ユーザーIDとパスワードを使用した認証方法の実装

ユーザーIDとパスワードを使用した認証方法の実装は簡単。


まずは`settings.py`を編集する。`SITE_ID`、ログイン後、ログアウト後のリダイレクト先を指定する。

    #django-allauth関係。django.contrib.sitesで使用するSITE_IDを指定する
    SITE_ID = 1
    #django-allauthログイン時とログアウト時のリダイレクトURL
    LOGIN_REDIRECT_URL = '/'
    ACCOUNT_LOGOUT_REDIRECT_URL = '/'

`INSTALLED_APPS`にも下記を追加する。

    INSTALLED_APPS = [

        # 省略 

        'django.contrib.sites', # ←追加
        'allauth', # ←追加
        'allauth.account', # ←追加
        'allauth.socialaccount', # ←追加
        
    ]

プロジェクト直下の`urls.py`に下記を追加する。

    path('accounts/', include('allauth.urls')),


後はマイグレーションを実行する。

    python3 manage.py migrate

これだけでOK。http://127.0.0.1:8000/accounts/signup/ にアクセスする。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-38-58.png" alt="ユーザーIDとパスワードによる認証画面"></div>

管理サイトなどにログインしている場合、上記のような表示にはならず、トップページにリダイレクトされる点に注意。予め管理サイトからはログアウトしておく。


このようにデフォルトの状態だとHTMLしか表示されていないので、別途装飾が必要な点に注意。(方法は後述)

## メールアドレスとパスワードを使用した認証方法の実装

メールアドレスを使用した認証方法を実装する場合、上記にさらに追記が必要。以下はSendgridを使用したメール送信を行う場合の方法。


    #################django-allauthでのメール認証設定ここから###################
    
    #djangoallauthでメールでユーザー認証する際に必要になる認証バックエンド
    AUTHENTICATION_BACKENDS = [
        "django.contrib.auth.backends.ModelBackend",
        "allauth.account.auth_backends.AuthenticationBackend",
    ]
    
    #ログイン時の認証方法はemailとパスワードとする
    ACCOUNT_AUTHENTICATION_METHOD   = "email"
    
    #ログイン時にユーザー名(ユーザーID)は使用しない
    ACCOUNT_USERNAME_REQUIRED       = "False"
    
    #ユーザー登録時に入力したメールアドレスに、確認メールを送信する事を必須(mandatory)とする
    ACCOUNT_EMAIL_VARIFICATION  = "mandatory"
    
    #ユーザー登録画面でメールアドレス入力を要求する(True)
    ACCOUNT_EMAIL_REQUIRED      = True
    
    
    #ここにメール送信設定を入力する(Sendgridを使用する場合)
    EMAIL_BACKEND   = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST      = 'smtp.sendgrid.net'
    EMAIL_USE_TLS   = True
    EMAIL_PORT      = 587
    
    
    #【超重要】メールのパスワードとメールアドレスの入力後、GitHubへのプッシュはダメ!!絶対!!不正アクセスされるよ!!
    """
    EMAIL_HOST_USER     = ''
    EMAIL_HOST_PASSWORD = ''
    """
    #DEBUGがTrueのとき、メールの内容は全て端末に表示させる
    if DEBUG:
        EMAIL_BACKEND   = "django.core.mail.backends.console.EmailBackend"
    
    #CHECK:認証時のメールの本文等の編集は templates/allauth/account/email/ から行うことができる
    
    #################django-allauthでのメール認証設定ここまで###################

    #django-allauth関係。django.contrib.sitesで使用するSITE_IDを指定する
    SITE_ID = 1
    #django-allauthログイン時とログアウト時のリダイレクトURL
    LOGIN_REDIRECT_URL = '/'
    ACCOUNT_LOGOUT_REDIRECT_URL = '/'


当たり前だが、SendgridのユーザーIDとパスワードを入力した状態でGitHubにプッシュしたり、コードを外部に公開したりしないように。

ログイン画面で、下記画像が表示されれば成功。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-44-06.png" alt="メールアドレスを使用した認証方式"></div>

ちなみに、SendgridのアカウントのIDとパスワードを入力した状態でアカウント登録をすれば、本当にメールを送信することができる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-46-00.png" alt="Sendgridを使用したメール送信"></div>


## django-allauthのテンプレートの修正と装飾

ご覧の通り、デフォルトの状態だと、HTMLのみで構成されており、装飾は一切施されていない。そのため、適宜コードを修正する必要がある。

まず、[公式のGitHub](https://github.com/pennersr/django-allauth)からソースをDL。ソース内の`allauth/templates/`の中身全てを、新たに作ったallauthというディレクトリの中に入れる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-57-58.png" alt="Djangoallauthのテンプレートの中身"></div>

続いて、settings.pyのTEMPLATESのDIRを修正する。下記を追加。allauthのテンプレートを明示的に読み込ませることでテンプレート修正と装飾が可能になる。

    os.path.join(BASE_DIR, 'templates', 'allauth')

後は、先程templatesに格納したHTMLファイルを修正していくだけ。ちなみに、メール送信時の文言も`templates/allauth/account/email/`から修正できる。

## 結論

基本settings.py中心に修正を加えるだけで簡単に実装できるdjango-allauthだが、そのままでは装飾なしなので、公式のコードを持ってきて改造する必要がある。

それから本格的にサービスを展開するのであれば、ボット対策として認証時にRecaptchaなどを同時に実装するべし。

## ソースコード

https://github.com/seiya0723/safe_ecsite_02

