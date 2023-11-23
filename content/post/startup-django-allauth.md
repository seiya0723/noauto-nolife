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


### 追記(2023年11月) 最新版ではsettings.pyの設定がこれまでと異なる

そのため、バージョンを指定してインストールしておいたほうが無難。

    pip install django-allauth==0.54


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

メールアドレスを使用した認証方法を実装する場合、上記にさらに追記が必要。

### SendgridAPIを使用した方法

まず、DjangoでSendgridのAPIを使用して送信を行う場合、事前に`django-sendgrid-v5`をインストールしておく。

    pip install django-sendgrid-v5


SendgridのAPIを使用したメール送信を行うようにsettings.pyを書き換える。


    #################django-allauthでのメール認証設定ここから###################
    
    #djangoallauthでメールでユーザー認証する際に必要になる認証バックエンド
    AUTHENTICATION_BACKENDS = [
        "django.contrib.auth.backends.ModelBackend",
        "allauth.account.auth_backends.AuthenticationBackend",
    ]
    
    #ログイン時の認証方法はemailとパスワードとする
    ACCOUNT_AUTHENTICATION_METHOD   = "email"
    
    #ログイン時にユーザー名(ユーザーID)は使用しない
    ACCOUNT_USERNAME_REQUIRED       = False
    
    #ユーザー登録時に入力したメールアドレスに、確認メールを送信する事を必須(mandatory)とする
    ACCOUNT_EMAIL_VARIFICATION  = "mandatory"
    
    #ユーザー登録画面でメールアドレス入力を要求する(True)
    ACCOUNT_EMAIL_REQUIRED      = True
    

    #DEBUGがTrueのとき、メールの内容は全て端末に表示させる(実際にメールを送信したい時はここをコメントアウトする)
    if DEBUG:
        EMAIL_BACKEND   = "django.core.mail.backends.console.EmailBackend"
    else:
        #TODO:SendgridのAPIキーと送信元メールアドレスを入れていない時、以下が実行されると必ずエラーになる点に注意。
        EMAIL_BACKEND       = "sendgrid_backend.SendgridBackend"
        DEFAULT_FROM_EMAIL  = "ここにデフォルトの送信元メールアドレスを指定"

        #【重要】APIキーの入力後、GitHubへのプッシュは厳禁。可能であれば.gitignoreに指定した別ファイルから読み込む
        SENDGRID_API_KEY    = "ここにsendgridのAPIkeyを記述する"

        #Sendgrid利用時はサンドボックスモードを無効化しておく。
        SENDGRID_SANDBOX_MODE_IN_DEBUG = False
    
    #################django-allauthでのメール認証設定ここまで###################

    SITE_ID = 1
    LOGIN_REDIRECT_URL = '/'
    ACCOUNT_LOGOUT_REDIRECT_URL = '/'


当たり前だが、SendgridのユーザーIDとパスワードを入力した状態でGitHubにプッシュしたり、コードを外部に公開したりしないように。

ログイン画面で、下記画像が表示されれば成功。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-44-06.png" alt="メールアドレスを使用した認証方式"></div>

APIキーを入力し、指定したメールアドレスが実在するものであれば、本当にメールを送信することができる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-46-00.png" alt="Sendgridを使用したメール送信"></div>



### パスワードを使用した方法【Sendgridには使用不可】

パスワードを使用したメール送信の場合は下記のようにする。2021年を境にパスワードを使用したSendgridのメール送信は受け付けなくなったため、Sendgridにはこの方法は通用しない。

内部ネットワークのメールを利用する際などに使うと良いだろう。


    #################django-allauthでのメール認証設定ここから###################
    
    #djangoallauthでメールでユーザー認証する際に必要になる認証バックエンド
    AUTHENTICATION_BACKENDS = [
        "django.contrib.auth.backends.ModelBackend",
        "allauth.account.auth_backends.AuthenticationBackend",
    ]
    
    #ログイン時の認証方法はemailとパスワードとする
    ACCOUNT_AUTHENTICATION_METHOD   = "email"
    
    #ログイン時にユーザー名(ユーザーID)は使用しない
    ACCOUNT_USERNAME_REQUIRED       = False
    
    #ユーザー登録時に入力したメールアドレスに、確認メールを送信する事を必須(mandatory)とする
    ACCOUNT_EMAIL_VARIFICATION  = "mandatory"
    
    #ユーザー登録画面でメールアドレス入力を要求する(True)
    ACCOUNT_EMAIL_REQUIRED      = True
    

    #DEBUGがTrueのとき、メールの内容は全て端末に表示させる
    if DEBUG:
        EMAIL_BACKEND   = "django.core.mail.backends.console.EmailBackend"

    else:
        #ここにメール送信設定を入力する(Sendgridを使用する場合)
        EMAIL_BACKEND   = 'django.core.mail.backends.smtp.EmailBackend'
        EMAIL_HOST      = 'ここにメールのホストを書く'

        #メールを暗号化する
        EMAIL_USE_TLS   = True
        EMAIL_PORT      = 587

        #【重要】メールのパスワードとメールアドレスの入力後、GitHubへのプッシュは厳禁
        EMAIL_HOST_USER     = ''
        EMAIL_HOST_PASSWORD = ''
    
    #################django-allauthでのメール認証設定ここまで###################

    SITE_ID = 1
    LOGIN_REDIRECT_URL = '/'
    ACCOUNT_LOGOUT_REDIRECT_URL = '/'



### 【補足1】アカウント作成時の確認メールが英語になっている。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-46-00.png" alt="Sendgridを使用したメール送信"></div>

このようにDjangoの言語設定をjaに指定しているにもかかわらず、英語のメールが送信されてしまう。

この場合、使用するDjango-allauthのテンプレートのバージョンと、インストールされたバージョンが不一致の可能性がある。

allauthの0.51をインストールした場合、テンプレートもGitHubから0.51を使用する。

GitHubからgit cloneコマンドを実行し、ログを確認、特定のバージョンまで戻す。

    git clone https://github.com/pennersr/django-allauth

    git log 

    git reset --hard XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


[【git/GitHub】コマンドと使い方の一覧](/post/startup-git/)

ちなみに下記のように https://github.com/pennersr/django-allauth/commits/ のTagからバージョンが選べる。

<div class="img-center"><img src="/images/Screenshot from 2022-06-18 22-21-32.png" alt=""></div>


### 【補足2】任意のタイミングでメールを送信するには？

今回の設定で新規アカウント作成時にメールが送信されるようになるが、任意のタイミングで送信したい場合がほとんどだろう。

下記記事にて、ビューなどの任意のタイミングで送信できるよう解説してある。

[DjangoでSendgridを実装させる方法【APIキーと2段階認証を利用する】](/post/django-sendgrid/)


## django-allauthのテンプレートの修正と装飾

ご覧の通り、デフォルトの状態だと、HTMLのみで構成されており、装飾は一切施されていない。そのため、適宜コードを修正する必要がある。

まず、[公式のGitHub](https://github.com/pennersr/django-allauth)からソースをDL。ソース内の`allauth/templates/`の中身全てを、新たに作ったallauthというディレクトリの中に入れる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 10-57-58.png" alt="Djangoallauthのテンプレートの中身"></div>

続いて、settings.pyのTEMPLATESのDIRを修正する。下記を追加。allauthのテンプレートを明示的に読み込ませることでテンプレート修正と装飾が可能になる。

    os.path.join(BASE_DIR, 'templates', 'allauth')

後は、先程templatesに格納したHTMLファイルを修正していくだけ。ちなみに、メール送信時の文言も`templates/allauth/account/email/`から修正できる。


### 【補足1】ログイン画面を中央寄せにする

テンプレートの設定を行った後、適当にHTMLとCSSを書き換える。下記記事に詳細が書かれている。

[Django-allauthにてログイン画面を中央寄せにさせる【テンプレートのカスタマイズ】](/post/django-allauth-center-loginpage/)


## 結論

基本settings.py中心に修正を加えるだけで簡単に実装できるdjango-allauthだが、そのままでは装飾なしなので、公式のコードを持ってきて改造する必要がある。

それから本格的にサービスを展開するのであれば、ボット対策として認証時にRecaptchaなどを用意する必要があるだろう。




## ソースコード

https://github.com/seiya0723/safe_ecsite_02

