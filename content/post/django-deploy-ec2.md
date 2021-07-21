---
title: "DjangoをAWSのEC2(Ubuntu)にデプロイする"
date: 2021-07-18T09:45:32+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","デプロイ","aws","上級者向け" ]
---

Herokuとは違ってサーバーが日本にもあり、なおかつ課金すれば大型のウェブアプリでもインターネット上に公開できる、それがAWS。

本記事ではAWSのEC2を使用し、画像アップロード可能な簡易掲示板をデプロイ工程を解説する。

## デプロイ対象のコード

ソースコードは以下。

https://github.com/seiya0723/django_fileupload

作り方は下記を参照。

[Djangoで画像及びファイルをアップロードする方法](https://noauto-nolife.com/post/django-fileupload/)


## 必要なもの

- クレジットカード
- AWSアカウント
- Djangoのsettings.py
- Linuxのコマンド(cp,mkdir,mv,cdなど)
- ネットワーク、データベース、セキュリティなどの基本的な知識
- sshコマンドの使用方法の知識


## 備考

プロジェクトのディレクトリ構造は『現場で使えるDjangoの教科書』に準拠している。

## 手順

1. EC2にてインスタンスを作る
1. インスタンスへSSH接続
1. インスタンスの.bashrcの設定変更、Python等の必要なパッケージをインストールする
1. PostgreSQLの設定
1. プロジェクトディレクトリをscpでアップロード 
1. settings.pyの書き換え
1. systemdにgunicornの自動起動を指定
1. Nginxの設定
1. マイグレーション
1. 静的ファイル配信
1. インバウンドにHTTPアクセスの許可


インスタンスを作ってSSHでログインするまでは、基本的に下記リンクに書かれたUbuntuへのデプロイと差異は殆ど無い。

ただし、今回はUbuntuに直にpip3コマンドを実行してPythonライブラリをインストールするのではなく、仮想環境virtualenvを使用してライブラリをインストールする。これで開発環境とデプロイ環境でライブラリのバージョンが一致する。

[DjangoをLinux(Ubuntu)サーバーにデプロイする方法【Nginx+PostgreSQL】](/post/django-deploy-linux/)


## EC2にてインスタンスを作る

オレンジ色のインスタンスの起動をクリック、

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-24-19.png" alt="インスタンス作成"></div>

Amazonマシンイメージ(OSのこと)はUbuntuを選択する。スクロールしてUbuntuが64ビット(x86)になっていることを確認して『選択』をクリック

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-26-42.png" alt="マシンイメージの選択"></div>

インスタンスタイプはデフォルトの無料枠の対象のままでOK、『次のステップ』をクリックして任意の設定を施す。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-44-30.png" alt="インスタンスタイプの選択"></div>


インスタンスの設定、及び、ストレージの追加、タグの追加はそのままデフォルトでOK、セキュリティグループの設定ではSSHのアクセスをマイIPからのみ許すように設定。

これでAWSのサーバーへSSHを利用できるのは自分だけ。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-48-43.png" alt="マイIPからのみSSHを許可"></div>

確認したら、起動を押す。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-51-16.png" alt="起動を押す"></div>

SSHを利用するには専用の秘密鍵を生成する必要がある。先ほどの起動ボタンを押すと、下記のようなダイアログが出てくるので、新しいキーペアの作成を選び、適当なキーペア名を指定して、キーペアのダウンロードを押す。


<div class="img-center"><img src="/images/Screenshot from 2021-07-12 10-55-17.png" alt="キーペアの作成"></div>

上記の場合、seiya0723-aws.pemという秘密鍵ファイルが生成され、ダウンロードされる。DLできたらインスタンスの作成をクリックする。

この秘密鍵ファイルは再DLはできないので、別途USBメモリなどに保管するなどバックアップを取り、なおかつファイルが外部に漏れないよう、厳重に管理する。

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-00-26.png" alt="インスタンス作成完了"></div>

これでEC2のインスタンスが生成できた。

## インスタンスへSSH接続

自分のPCの端末(Windowsの場合はTeraTerm等のSSHクライアントソフトなど)から、先ほど生成したSSHの秘密鍵を使ってインスタンスへ接続を行う。

まず、先ほどDLした秘密鍵のディレクトリまで移動して、権限を所有者のみ読み取り権限に変更する。この所有者のみ読み取りの権限ありに設定しないと、SSHでログインはできない。

    chmod 400 seiya0723-aws.pem

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-10-37.png" alt="所有者読み取りのみ可"></div>

そして、その秘密鍵を使って`ssh`コマンドを実行する。

    ssh -i "seiya0723-aws.pem" ubuntu@[パブリックIPv4 DNS]

パブリックIPv4 DNSはインスタンスの画面から確認できる。赤で塗りつぶした部分から、amazonaws.comまでをパブリックIPv4 DNSに指定

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-15-39.png" alt="パブリックIPv4 DNS"></div>

上記コマンドを実行すると、`Are you sure you want to continue connecting (yes/no)?`と聞かれるので、`yes`を入力してEnterを押す。

これでインスタンスへのSSHに成功する。ターミナルの左端のユーザー名、リモートホスト名が変わったらOK

<div class="img-center"><img src="/images/Screenshot from 2021-07-12 11-20-23.png" alt="ログイン成功"></div>


## インスタンスの.bashrcの設定変更、Python等の必要なパッケージをインストールする

まず、インスタンスのbashの設定を変更する。

    vi ~/.bashrc

下記のように記述。

    HISTSIZE=100000
    HISTFILESIZE=200000
    HISTTIMEFORMAT='%y/%m/%d %H:%M:%S '

この設定を読み込ませる。これでhistoryコマンドを打つとコマンドを打った日付が確認できて便利。

    source ~/.bashrc

全パッケージの更新

    sudo apt update && sudo apt -y upgrade && sudo apt -y autoremove

pip、PostgreSQL、Nginx等、必要なパッケージをインストール

    sudo apt install python3-pip python3-dev libpq-dev postgresql postgresql-contrib nginx

virtualenvのインストール

    sudo -H pip3 install --upgrade pip
    sudo -H pip3 install virtualenv

## PostgreSQLの設定

PostgreSQLにて、DBとそのDBにアクセスするユーザーを作る。

詳しくは下記リンクを参照。

[PostgreSQLインストールから、ユーザーとDBを作る](/post/startup-postgresql/)


## プロジェクトディレクトリをscpでアップロード 

scpコマンドを実行し、Djangoのプロジェクトのディレクトリを任意の場所にアップロードする。今回は、[DjangoをLinux(Ubuntu)サーバーにデプロイする方法【Nginx+PostgreSQL】](/post/django-deploy-linux/)に倣って、`~/Documents/`に格納する。

まず、EC2へログインした状態でDocumentsディレクトリを作る

    mkdir ~/Documents

Ctrl+Dを押してログアウトをする。

`~/Documents/プロジェクト名/`にプロジェクトのファイル一式をコピーする。再帰的にアップロードする`-r`オプションをお忘れなく。(※`-ri`であり`-ir`ではない)。また、プロジェクトのディレクトリ名を`django_fileupload`に改名している。

    scp -ri "seiya0723-aws.pem" ./django_fileupload/ ubuntu@[パブリックIPv4 DNS]:~/Documents/

再びSSHでEC2へログインし、先ほどアップロードしたディレクトリに移動して、仮想環境を作成し、有効にしておく。必要なライブラリをインストール。(※pycharm等ですでに手元で仮想環境を使っている場合、この工程はスキップする。)

    virtualenv venv
    source ./venv/bin/activate
    pip install django gunicorn psycopg2 psycopg2-binary Pillow
    
もし、すでにvenvがある場合、ファイル数が多いvenvはscpでアップロードせず、予めrequirements.txtを作っておき、以下のようにrequirements.txtに書かれてあるライブラリをインストールさせる。

    # ローカルにて
    source ./venv/bin/activate
    pip freeze > requirements.txt

    #venvを削除した上で、scp。その後sshでログイン
    source ./venv/bin/activate
    pip install -r requirements.txt

こうすることで、venvをそのままアップロードするよりも時間がかからない。
    


## settings.pyの書き換え

`settings.py`の内容を書き換える。`ALLOWED_HOSTS`にパブリックIPv4のアドレスを書く。

    """
    Django settings for config project.
    
    Generated by 'django-admin startproject' using Django 2.2.3.
    
    For more information on this file, see
    https://docs.djangoproject.com/en/2.2/topics/settings/
    
    For the full list of settings and their values, see
    https://docs.djangoproject.com/en/2.2/ref/settings/
    """
    
    import os
    
    # Build paths inside the project like this: os.path.join(BASE_DIR, ...)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Quick-start development settings - unsuitable for production
    # See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/
    
    # SECURITY WARNING: keep the secret key used in production secret!
    SECRET_KEY  = "GENERATED KEY "
    try:
        from . import local_settings
    except ImportError:
        pass
    
    # SECURITY WARNING: don't run with debug turned on in production!
    #DEBUG = True
    DEBUG = False
    
    #↓EC2のパブリックIPv4アドレスを入力(※DNSではない)
    ALLOWED_HOSTS = [ "" ]
    
    # Application definition
    
    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'upload.apps.UploadConfig',
    ]
    
    MIDDLEWARE = [
        'django.middleware.security.SecurityMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ]
    
    ROOT_URLCONF = 'config.urls'
    
    TEMPLATES = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [os.path.join(BASE_DIR,"templates")],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        },
    ]
    
    WSGI_APPLICATION = 'config.wsgi.application'
    
    # Database
    # https://docs.djangoproject.com/en/2.2/ref/settings/#databases
    
    # local_settings.pyを参照
    if DEBUG:
        DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
            }
        }
    
    
    # Password validation
    # https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators
    
    AUTH_PASSWORD_VALIDATORS = [
        {
            'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
        },
    ]
    
    
    # Internationalization
    # https://docs.djangoproject.com/en/2.2/topics/i18n/
    
    LANGUAGE_CODE = 'ja'
    
    TIME_ZONE = 'Asia/Tokyo'
    
    USE_I18N = True
    
    USE_L10N = True
    
    USE_TZ = True
    
    
    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/2.2/howto/static-files/
    
    PROJECT_NAME    = os.path.basename(BASE_DIR)
    
    STATIC_URL      = '/static/'
    STATICFILES_DIRS    = [os.path.join(BASE_DIR, "static")]

    if not DEBUG:
        STATIC_ROOT         = "/var/www/{}/static".format(PROJECT_NAME)
    
    MEDIA_URL       = "/media/"
    if DEBUG:
        MEDIA_ROOT          = os.path.join(BASE_DIR, "media")
    else:
        MEDIA_ROOT          = "/var/www/{}/media".format(PROJECT_NAME)
    

このsettings.pyの末端のstaticとmediaに書かれてある`/var/www/django_fileupload/`は存在しないので、作る必要がある。

    sudo mkdir /var/www/django_fileupload/

所有者とグループはrootになっているので、所有者はubuntu、グループはwww-dataに書き換える。

    sudo chown ubuntu:www-data /var/www/django_fileupload/

mediaとstaticまでは作る必要はない。Djangoが自動的に作ってくれる。


続いて`conifg/local_settings.py`に下記を記入

    SECRET_KEY  = "ジェネレートしたシークレットキーをここに書く"
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'ここに先に作ったDBの名前を',
            'USER': 'ここに先に作ったユーザーの名前を',
            'PASSWORD':'ここに先に作ったユーザーのパスワードを',
            'HOST': 'localhost',
            'PORT': '',
        }
    }




## systemdにgunicornの自動起動を指定


先ほど仮想環境にインストールさせたgunicornを自動起動させるsystemdを書く。

    sudo vim /etc/systemd/system/gunicorn.service

中身は下記


    [Unit]
    Description=gunicorn daemon
    After=network.target
    
    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/Documents/django_fileupload
    ExecStart       =/home/ubuntu/Documents/django_fileupload/venv/bin/gunicorn --access-logfile - --workers 3 \
                     --bind unix:/home/ubuntu/Documents/django_fileupload/django_fileupload.socket config.wsgi:application
    
    [Install]
    WantedBy=multi-user.target

プロジェクトの`wsgi.py`は`config`ディレクトリの中に`urls.py`や`settings.py`と含まれているので、`config.wsgi.application`になる点にご注意。

仮想環境(`venv`)の場所は、プロジェクトディレクトリ(`django_fileupload`)にあるので、そちらに指定している。

`systemd`のファイルはバックスラッシュ(`\`)を使うことで、改行することができる。セミコロン(`;`)を使うことでコメントアウトもできる。


起動させ、自動起動を有効化させる。


    sudo systemctl start gunicorn
    sudo systemctl enable gunicorn

この状態で、gunicornのステータスを確認する。

    sudo systemctl status gunicorn

下記の画像のように動いていればOK。


<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-38-53.png" alt="gunicorn.serviceが動いている"></div>

これで、DjangoとNginxをつなぐgunicornが動くようになった。次はNginxの設定である。


## Nginxの設定

次のファイルを作成し、Nginxの設定ファイルを作る。

    sudo vi /etc/nginx/sites-available/django_fileupload

中身は下記

    server {
        listen 80;
        server_name 【ここにパブリックIPv4アドレスを記入(※DNSではない)】;
    
        location = /favicon.ico { access_log off; log_not_found off; }
        location /static/ {
            root /var/www/django_fileupload;
        }
        location /media/ {
            root /var/www/django_fileupload;
        }
        location / {
            include proxy_params;
            proxy_pass http://unix:/home/ubuntu/Documents/django_fileupload/django_fileupload.socket;
        }
    
        client_max_body_size 100M;
    }

パブリックIPv4アドレスを指定する。そして、末端には`client_max_body_size`を指定する。これはアップロードできるファイルの容量上限値。100MBまでアップロードできるように設定した。これがないと、1MBまでしかアップロードできない。

`sites-enabled`にシンボリックリンクを作り、この設定を反映させる。

    sudo ln -s /etc/nginx/sites-available/django_fileupload /etc/nginx/sites-enabled/

デフォルト設定のシンボリックリンクは除外して、設定を再読込、nginxを再起動させる。

    sudo unlink /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl reload nginx

先ほどのgunicornと同様に、statusを確認して、動いていれば設定完了。

    sudo systemctl status nginx

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-50-11.png" alt="Nginxが動いている。"></div>


## マイグレーション

マイグレーションを実行する。

    python3 manage.py migrate

これの実行を忘れていると、もれなくサーバーエラーが表示されてしまう。


## 静的ファイル配信

staticファイルを配信する、下記コマンドを実行
    
    python3 manage.py collectstatic

このコマンドで予め作っておいた`/var/www/django_fileupload/`にstaticディレクトリが作られ、その中に静的ファイルがコピーされる。

## インバウンドにHTTPアクセスの許可

ダッシュボードの左カラムから、『ネットワーク&セキュリティ』の中にある『セキュリティグループ』をクリック。任意のセキュリティグループをクリックして、インバウンドルールタブの`Edit inbound rules`をクリック。

ルールを追加して、タイプからHTTPを指定。ソースは自分のIPアドレスを指定する。

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-13-32.png" alt="自分の端末からHTTP通信を許可する。"></div>

これで、今EC2のダッシュボードを表示している端末のみ、HTTPを使ってデプロイしたウェブアプリを見ることが許可される。


もし、開発用サーバーを使いたい場合は、下記のようにカスタムTCPを選び、ポート番号は8000を指定して、ソースはマイIPを指定する。


<div class="img-center"><img src="/images/Screenshot from 2021-07-20 14-23-34.png" alt="開発用サーバーのアクセスを許可する。"></div>

そして、開発用サーバーを起動する時は下記のコマンドを使う。

    python3 manage.py runserver 0.0.0.0:8000

これで、下記のリンクへアクセスすると、開発用サーバーを起動した内容が表示される。

    【パブリックIPv4アドレス(※DNSではない)】:8000



## デプロイしたウェブアプリへアクセス。

パブリックIPv4アドレスへアクセスすると、デプロイしたウェブアプリにアクセスできる。

<div class="img-center"><img src="/images/Screenshot from 2021-07-20 15-19-32.png" alt="デプロイ"></div>

100MBまでのファイルのアップロードできる。



## AWSのあれこれ

### 1:インスタンスを削除するには

インスタンスを終了させる。その後、自動的に削除される。そのため、EC2を一時停止にしたい場合は、インスタンスを停止を選ぶ。

https://qiita.com/shizen-shin/items/549087e77f1397bc1d92


## 結論

これでEC2へのデプロイができるようになるが、実際にサービスを一般公開するとなるとドメインを指定する必要があるだろう。ムームードメインなどからドメインを手に入れ、それを割り当てる。.comドメインなどであれば一年で1000〜2000円程度で手に入る。

また、このEC2はストレージが8GBほどしか無く、膨大なデータの取扱いや、大容量ファイルの共有には不向きである。そこで、ストレージにはS3、データベースにはRDSを別途指定する必要がある。S3であれば12ヶ月間5GBまで無料、RDSであれば12ヶ月間無料になっている。



## 参照元

https://qiita.com/tachibanayu24/items/b8d73cdfd4cbd42c5b1d

https://qiita.com/Bashi50/items/d5bc47eeb9668304aaa2#10-gunicorn%E3%81%AE%E8%A8%AD%E5%AE%9A
