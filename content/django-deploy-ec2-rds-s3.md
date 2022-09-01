---
title: "DjangoをEC2(Ubuntu)、RDS(PostgreSQL)、S3の環境にデプロイをする"
date: 2021-07-26T17:59:20+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","デプロイ","AWS","EC2","RDS","S3" ]
---

[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)の続編。EC2にデプロイした後、RDS、S3を使って、さらに大型のウェブアプリを動作させる。

本記事ではRDS(PostgreSQL)、S3のセットアップを中心に解説をする。基本的なEC2へのデプロイの流れは上記記事を確認するべし。


## RDS(PostgreSQL)の設定

### 流れ

1. ダッシュボードからRDSのインスタンス生成
1. セキュリティグループの設定(EC2からRDSへのアクセスを許可する)
1. EC2へSSH接続、RDSへアクセスする
1. settings.pyに設定を書き込む
1. マイグレーションしてNginx再起動


### ダッシュボードからRDSのインスタンス生成

まず、RDSへアクセスしてインスタンスを作る。データベースの作成をクリックし、

データベースの制作方法は標準、エンジンのオプションはPostgreSQL、テンプレートは無料利用枠、マスターパスワードを指定し、それ以外はそのまま、データベースの作成をクリックする。

下記画面が表示され、作成中から利用可能になればOK。

<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-19-01.png" alt="インスタンス生成"></div>


### セキュリティグループの設定(EC2からRDSへのアクセスを許可する)

<!--TODO:ここで時間が経ったらセキュリティグループの許可対象が変わってEC2からRDSへのアクセスができなくなる。-->



通常、ウェブアプリの全データが格納されているRDSは、EC2のみアクセスを許可するようにセキュリティを施さなければならない。

もし、RDSのアクセスがEC2以外の全ての端末からもアクセスできてしまうと、ウェブアプリの全データはRDSのパスワードが特定され次第、即流出する。

故にRDSにアクセスを許可するのは、EC2のみにしなければならない。これからその設定を施す。

先ほど、制作したRDSのインスタンスをクリック。接続とセキュリティのタブから、VPCセキュリティグループのリンクをクリック

<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-27-08.png" alt="インスタンスのセキュリティ設定"></div>

このセキュリティ設定のインバウンドルールを編集、このデータベースのインスタンスにアクセスしたい、EC2と同じセキュリティグループをソースに指定、

<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-29-32.png" alt="インバウンドルールを設定、EC2側からのアクセスを許可する。"></div>

ルールを保存してセキュリティは設定完了。

### EC2へSSH接続、RDSへアクセスする

まず、EC2へSSHを使ってログインする。ログイン完了後、以下のコマンドを打って、RDSへpostgresユーザーとしてログインをする。この時、セキュリティグループの設定がうまく行っていない(EC2からRDSへのアクセスが許可されていない)場合、ログインに失敗する。

    psql -h [エンドポイント] -p 5432 -U postgres

このpostgresのパスワードはRDSのインスタンスを作った時に指定したパスワードである。

ここでログインしたときのターミナルはSQLのターミナルになっている。だから、[PostgreSQLインストールから、ユーザーとDBを作る](/post/startup-postgresql/)に書かれてある下記のコマンドは通用しない。

    #下記はSQLのターミナルには通用しない。
    #createuser --createdb --username=postgres --pwprompt [任意のユーザー名]
    #createdb [任意のDB名] --owner=[任意のユーザー名]

以下のSQLを実行して、[任意のユーザー]と[任意のDB名]を作成する。

    CREATE ROLE [任意のユーザー名] LOGIN PASSWORD '[任意のユーザー名に対するパスワード]';
    ALTER ROLE [任意のユーザー名] WITH CREATEDB;
    
    #一旦Ctrl+Dでpostgresユーザーから抜け、下記コマンドで任意のユーザー名で入る

    psql -h [エンドポイント] -p 5432 -U [任意のユーザー名] postgres
    CREATE DATABASE [任意のDB名]
    
    #Ctrl+Dでログアウト、作ったDB名、作ったユーザー名でログインする。

    psql -h [エンドポイント] -p 5432 -U [任意のユーザー名] -d [任意のDB名]
    

先ほどのコマンドを真似て、Ctrl+Dでpostgresからログアウトした後、[任意のユーザー名]で再度ログインする。

    psql -h [エンドポイント] -p 5432 -U [任意のユーザー名] -d [任意のDB名]

### settings.pyに設定を書き込む

先ほど制作したユーザー名及びパスワード、DB名をsettings.pyに記録する。

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'ここにDBの名前',
            'USER': 'ここにユーザー名',
            'PASSWORD':'ここにパスワード',
            'HOST': 'ここにRDSのホスト名',
            'PORT': 'ここにRDSへアクセスに使うポート番号',
        }
    }

この状態でマイグレーションを行う。


### マイグレーションしてNginx再起動

仮想環境を使用する場合は予めアクティベートした上でマイグレーションを実行。

    python3 manage.py migrate

Nginxを再起動する。

    sudo systemctl restart nginx gunicorn

パブリックIPにアクセスするとこれまで投稿されたデータが表示されなくなる。これでRDSの実装は成功。(※ローカルのPostgreSQLからRDS上のPostgreSQLへDBが変わったから。)


### Q1:EC2に直にインストールしたPostgreSQLから、RDSのPostgreSQLにデータを移行するには？

前もって、サービスを一時停止することをユーザーに通知しておき、セキュリティ設定からインバウンドHTTPの許可を削除する。

続いて、`dumpdata`コマンドを実行してDBの全データのバックアップを行い、新しいRDSの設定を施した上で、`loaddata`を実行する。


    python3 manage.py dumpdata [アプリ名] > backup.json

    #ここでRDSの設定を施し、settings.pyのDATABASESの設定を書き換える。

    python3 manage.py loaddata ./[アプリ名]/fixture/backup.json

詳しくは[loaddata](/post/django-loaddata/)、[dumpdata](/post/django-dumpdata/)について解説しているページを参照。

ただし、データの移行前と移行後でモデルが書き換わっている場合、当然loaddataは失敗する。このデータ移行作業直前まではモデルの変更はしないようにするか、予め移行前のPostgreSQLにてマイグレーションをした上で作業を行う。



## S3の設定


### 流れ

1. S3のバケットを作る
1. IAMを使ってS3へアクセスする際に必要になるキーを生成する
1. boto3とdjango-stragesをインストール
1. settings.pyにて設定を記入
1. Nginxを再起動


### S3のバケットを作る

まず、ストレージに当たるS3のバケットを作る。

バケット名は任意、ウェブアプリ側から公開をするためパブリックアクセスをブロックのチェックを外す。他はそのままでバケットを作成する。

<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-37-05.png" alt="バケットを作成する。"></div>

これでストレージができあがった。

### IAMを使ってS3へアクセスする際に必要になるキーを生成する

ストレージのS3を作ってもウェブアプリがそこにアクセスするにはキーが必要になる。それがなければURLにアクセスして、マウスクリックでファイルをアップロードする普通のクラウドストレージに過ぎない。

そこでIAMを作る。IAMを作ることでウェブアプリ側からS3へアップロードができるようになる。

IAMのダッシュボードに行き、ユーザーを追加をクリック。ユーザー名は任意、アクセスの種類としてプログラムによるアクセスをチェックする。

<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-40-14.png" alt="IAMを作る"></div>

アクセス許可は既存のポリシーを直接アタッチを選択。s3FullAccessにチェックを入れる。

<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-42-05.png" alt="IAMの権限"></div>

タグ追加はしなくてもいい。確認したらユーザーの作成を実行する。作成を実行した後、パスワードとIDが表示されるので、スクリーンショットを取るなどして控えておく。

<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-43-29.png" alt="IAMのパスワードとID"></div>


### boto3とdjango-stragesをインストール

仮想環境をアクティベートした上で、下記コマンドを実行

    pip install boto3
    pip install django-storages

バージョンは下記がインストールされた。

    boto3==1.18.8
    django-storages==1.11.1


### settings.pyにて設定を記入
    
`INSTALLED_APPS`に`"storages"`を追加。末端に、MEDIAの設定を施す。

今回、静的ファイルは通常のNginxの共有ディレクトリ(`/var/www/[プロジェクト名]`)を指定して、アップロードされたファイルと保存領域を分けている。


    """
    Django settings for config project.
    
    Generated by 'django-admin startproject' using Django 3.1.7.
    
    For more information on this file, see
    https://docs.djangoproject.com/en/3.1/topics/settings/
    
    For the full list of settings and their values, see
    https://docs.djangoproject.com/en/3.1/ref/settings/
    """
    
    import os
    
    from pathlib import Path
    
    # Build paths inside the project like this: BASE_DIR / 'subdir'.
    BASE_DIR = Path(__file__).resolve().parent.parent
    
    
    # Quick-start development settings - unsuitable for production
    # See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/
    
    # SECURITY WARNING: keep the secret key used in production secret!
    SECRET_KEY = 'シークレットキーを生成する。'
    
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = False
    
    ALLOWED_HOSTS = [ "ここにパブリックIPv4アドレスを" ]
    
    # Application definition
    
    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
    
        #====中略=====
    
        'storages', #←追加
    
    ]
    
    
    #==========中略=============
    
    
    # Internationalization
    # https://docs.djangoproject.com/en/3.1/topics/i18n/
    
    LANGUAGE_CODE = 'ja'
    
    TIME_ZONE = 'Asia/Tokyo'
    
    USE_I18N = True
    
    USE_L10N = True
    
    USE_TZ = True
    
    
    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/3.1/howto/static-files/
    
    
    PROJECT_NAME    = os.path.basename(BASE_DIR)
    
    STATIC_URL      = '/static/'
    STATICFILES_DIRS    = [os.path.join(BASE_DIR, "static")]
    
    if not DEBUG:
        STATIC_ROOT         = "/var/www/{}/static".format(PROJECT_NAME)
    
    """"
    MEDIA_URL       = "/media/"
    if DEBUG:
        MEDIA_ROOT          = os.path.join(BASE_DIR, "media")
    else:
        MEDIA_ROOT          = "/var/www/{}/media".format(PROJECT_NAME)
    
    """
    
    DEFAULT_AUTO_FIELD='django.db.models.AutoField'
    
    
    #下記を追加
    
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    MEDIA_URL = '/media/'
    
    AWS_ACCESS_KEY_ID = "ここにアクセスキーのIDを入れる" 
    AWS_SECRET_ACCESS_KEY = "ここにアクセスキーを入れる。"
    AWS_STORAGE_BUCKET_NAME = "ここにバケットの名前を入れる"
    
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    S3_URL = 'http://%s.s3.amazonaws.com/' % AWS_STORAGE_BUCKET_NAME
    MEDIA_URL = S3_URL
    
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None
    
先ほどIAMで作ったアクセスキーのIDとキーを入力する。

一部の解説サイトでは`DEFAULT_FILE_STORAGE`で指定している、参照するクラス名が古いものになっている場合がある(s3boto3がs3botoになっている等)。

もしバージョンを確認して今回のものと不一致であれば、[django-storagesのGitHub](https://github.com/jschneier/django-storages/tree/7a672d437e4bb633f2737048f5b70a96c70bc611/storages)から参照して適宜編集する。

### Nginxを再起動

settings.pyを正しく書いたらNginxを再起動する。

    sudo systemctl restart gunicorn nginx

これでウェブアプリ側からアップロードされたファイルがS3保管されるようになる。


<div class="img-center"><img src="/images/Screenshot from 2021-07-28 12-18-14.png" alt="Django側からアップロードされたファイルが保管される。"></div>

### Q1:アップロードしたファイルはS3へ送られるのですが、ウェブアプリ側からは見れません。

上記設定で問題がない場合は、テンプレート側のパス設定に問題がある可能性があります。

テンプレートは下記のように書き換えを行います。

    <!--↓書き換え前-->

    {% for content in data %}
    <div class="my-2">
        <img class="img-fluid" src="/media/{{ content.photo }}" alt="投稿された画像">
    </div>
    {% endfor %}

    <!--↓書き換え後-->

    {% for content in data %}
    <div class="my-2">
        <img class="img-fluid" src="{{ content.photo.url }}" alt="投稿された画像">
    </div>
    {% endfor %}

`/var/www/プロジェクト名/media/`もしくはDEBUG中で`プロジェクト名/media/`を参照している場合は書き換え前でも問題なく動きますが、S3を参照する時、書き換え後のように書かないと正常に動作しません。

参照元:https://docs.djangoproject.com/en/3.2/ref/models/fields/

<div class="img-center"><img src="/images/Screenshot from 2021-07-29 16-53-27.png" alt="url属性を参照する。"></div>

このようにImageField及びFileFieldのフィールド名にurl属性が付与されているので、それを参照します。これは`MEDIA_ROOT`などで指定した値を元に絶対パスを生成しているから動作します。先のS3の`settings.py`では`MEDIA_ROOT`が未指定でも、`django-storages`が生成するため同じようにS3宛の絶対パスで生成されます。

ちなみに、[Djangoの管理サイトをカスタムする【全件表示、全フィールド表示、並び替え、画像表示、検索など】](/post/django-admin-custom/)では画像の参照は下記のようになっています。

    #画像のフィールドはimgタグで画像そのものを表示させる
    def format_photo(self,obj):
        if obj.photo:
            return format_html('<img src="{}" alt="画像" style="width:15rem">', obj.photo.url)

そのため、上記リンクに倣って作っている場合、テンプレート側と違って管理サイトだけ正常に画像が表示されます。
    
<div class="img-center"><img src="/images/Screenshot from 2021-07-28 14-53-32.png" alt=""></div>

## 結論

これで動画共有サイト、ファイル共有サイトなどの大型のデータを取り扱うサービス展開ができるようになる。

無料枠のEC2は8GB程度しか無いので、大容量ファイルのアップロードなどを行う場合は早めにS3やRDSを実装しておくと良いだろう。


## 参照元

https://www.kakiro-web.com/postgresql/postgresql-create-user.html

https://www.dbonline.jp/postgresql/connect/index2.html


https://qiita.com/sand/items/b897aa47c304b7fbdcb5

https://qiita.com/frosty/items/e793da61f9525d7afbe6
