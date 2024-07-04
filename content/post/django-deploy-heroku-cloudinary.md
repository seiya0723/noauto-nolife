---
title: "DjangoをHeroku+Cloudinary(基本無料ストレージ)の環境にデプロイする【ウェブアプリのデモを一般公開したい場合などに】"
date: 2021-09-25T10:34:37+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","Heroku","デプロイ","cloudinary" ]
---

Herokuにはクレジットカードを登録することで、Cloudinaryというアドオンを利用することができる。これがHerokuのストレージとして運用可能。

一部は[DjangoをDEBUG=FalseでHerokuにデプロイする方法](/post/django-deploy-heroku/)と内容が重複しているため、そちらを読んだ人向けに書く。

アップロードするコードは[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)より流用。テンプレートのsrc属性、href属性の書き方が古いので、[ここ](/post/django-deploy-ec2-rds-s3/)に倣って書き換えた。


## Cloudinaryの料金体制と制限について

[Qiita](https://qiita.com/kanaxx/items/b3366025e6715562d8f9)かCloudinaryのSettingsページに書いてある。

フリープランは毎月25クレジット付与される。1000回の画像の変換、1GBのデータ容量の確保、1GBの転送などで、それぞれ1クレジットずつ消費される。

つまり、毎月5GBのデータ容量の確保(5クレジット)、10GBの転送(10クレジット)、変換なし(0クレジット)であれば、15クレジットで済む。この場合はフリープランの毎月付与される25クレジットで事足りる。

フリープランは他にも制限がある。例えば1回のアップロード上限は動画は100MB、画像は20MB、その他のファイルは20MBとなっている。

ただし、これは後述の`DEFAULT_FILE_STORAGE`の値によるので、RawMedia(その他のファイル)と指定した場合、動画や画像でもその他のファイル扱いになるため、動画のアップロード上限が20MBになる点に注意。

## 流れ

1. Herokuへクレジットカード登録
1. Cloudinaryの設定
1. settings.pyを修正とライブラリインストール
1. デプロイ

### Herokuへクレジットカード登録

Herokuへカードの登録を済ませると、Cloudinary等のカード登録が必要なアドオンが使えるだけでなく、一ヶ月の無料稼働時間が450時間分追加され、合計1000時間になる。AWSと違って、1年間のみというわけではなく永年無料。

登録方法は、Herokuのアカウント作成後、[AccountからBillingタブ](https://dashboard.heroku.com/account/billing)をクリックBillingInformationの欄でカード登録ができるのでカード番号と必要事項(氏名、住所、郵便番号)を書く。

<div class="img-center"><img src="/images/Screenshot from 2021-09-21 21-26-27.png" alt="必要事項を書く"></div>

住所はローマ字で書かなくても日本語でも問題なく登録された。

### Cloudinaryの設定

デプロイ先のアプリのAdd-onからCloudinaryを追加してFreePlanを選択する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-25 12-30-31.png" alt="HerokuのAddonに追加された"></div>

Cloudinaryのリンクから作られたアカウントへ行き着く。ダッシュボードを開くと、APIキーなどが表示される。これをsettings.pyにコピーするため、控えておく。

<div class="img-center"><img src="/images/Screenshot from 2021-09-25 12-32-39.png" alt="APIキーが表示されるダッシュボード"></div>


#### 確認できない場合

HerokuのSettingsから Config Vars (環境変数設定)から、CLOUDINARY_URL が確認できる


```
cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]
```

この構成になっているので、これをコピペして貼り付ける


### settings.pyを修正とライブラリインストール

ストレージとしてCloudinaryを使用するので、その設定を書き込む必要がある。

`settings.py`に下記を追記。


```
#デバッグモードは無効化しておく。
DEBUG = False


# 静的ファイルの読み込み設定がwhitenoiseに影響が及ぶので、デバッグ時にのみ有効にしておく。
if DEBUG:
    STATICFILES_DIRS = [ BASE_DIR / "static" ]


if not DEBUG:

    #INSTALLED_APPSにcloudinaryの追加
    INSTALLED_APPS.append('cloudinary')
    INSTALLED_APPS.append('cloudinary_storage')

    # ALLOWED_HOSTSにホスト名)を入力
    ALLOWED_HOSTS = [ 'hogehoge.herokuapp.com' ]
    
    # 静的ファイル配信ミドルウェア、whitenoiseを使用。※ 順番不一致だと動かないため下記をそのままコピーする。
    MIDDLEWARE = [ 
        'django.middleware.security.SecurityMiddleware',
        'whitenoise.middleware.WhiteNoiseMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        ]

    # 静的ファイル(static)の存在場所を指定する。
    STATIC_ROOT = BASE_DIR / 'static'


    # DBの設定
    DATABASES = { 
            'default': {
                'ENGINE': 'django.db.backends.postgresql_psycopg2',
                'NAME': '',
                'USER': '',
                'PASSWORD': '',
                'HOST': '',
                'PORT': '5432',
                }
            }

    #DBのアクセス設定
    import dj_database_url

    db_from_env = dj_database_url.config(conn_max_age=600, ssl_require=True)
    DATABASES['default'].update(db_from_env)
    

    #cloudinaryの設定
    CLOUDINARY_STORAGE = { 
            'CLOUD_NAME': "", 
            'API_KEY'   : "", 
            'API_SECRET': "",
            "SECURE"    : True,
            }

    #これは画像だけ(上限20MB)
    #DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

    #これは動画だけ(上限100MB)
    #DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.VideoMediaCloudinaryStorage'

    #これで全てのファイルがアップロード可能(上限20MB。ビュー側でアップロードファイル制限するなら基本これでいい)
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.RawMediaCloudinaryStorage'

```


先ほどのCloudinaryのダッシュボードで控えた情報を`CLOUDINARY_STORAGE`にコピペする。

動画と画像もアップロードするのであれば、`DEFAULT_FILE_STORAGE`は`RawMediaCloudinaryStorage`なので、上限20MBになる。`models.py`を書き換えて対処する方法もあるようだが、今回はこのように`settings.py`の書き換えだけで済ませた。


## 必要なライブラリと起動ファイルを作成

仮想環境に`django-cloudinary-storage`もインストールする

    pip install django-heroku dj-database-url gunicorn whitenoise psycopg2 django-cloudinary-storage

`requirements.txt`を更新。

    pip freeze > requirements.txt


gunicorn(ウェブサーバーとDjangoをつなげるライブラリ)の設定を施す。下記コマンドを実行する。

    echo "web: gunicorn config.wsgi:application --log-file -" > Procfile

サーバー起動用のファイルを作る。

    echo "web: python manage.py runserver 0.0.0.0:5000" > Procfile.windows


### デプロイ

Herokuへログイン

    heroku login

ローカルリポジトリを作る。

    git init 
    git add .
    git commit -m "commit"
    heroku git:remote -a [アプリ名]

<!--
Cloudinaryを使用することで、静的ファイルの自動配信を尋ねられるので、下記のように設定する。

    heroku config:set DISABLE_COLLECTSTATIC=1

この設定はwhitenoiseと競合するかも知れないので、検証した後、追記する予定。
-->

プッシュする。

    git push heroku master 

マイグレーションをする

    heroku run python3 manage.py migrate


## 動かすとこうなる。

問題なくアップロードできる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-25 12-51-32.png" alt="画像のアップロード"></div>

ファイルのアップロードも問題ない。

<div class="img-center"><img src="/images/Screenshot from 2021-09-25 12-54-03.png" alt="PDFのアップロード"></div>

CloudinaryのMediaLibraryをみると、アップロードされている事がわかる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-25 12-55-48.png" alt="Cloudinary側からの操作"></div>

大容量の画像ファイルだとサムネイルが作られるのに時間がかかるらしい。


## 結論

永年無料のHerokuサーバーで、永年無料のストレージが使える。リージョンにこだわらない、無料で済ませたいのであればAWSのS3よりもこちらのほうが良いだろう。

体感だが、ローカルネットワーク内のサーバーには劣るが、普通のサイトとして見ればそれほど遅くはない。上限容量(20MB)を超えたファイルをアップロードしようとすると極端にレスポンスが遅くなるので、ビュー側で容量制限を行う等の対策をしておいたほうが良い。

ただ、[アップロード上限の20MBが妥協できない場合は、お金がかかるがストレージだけS3を使う方法](/post/django-deploy-heroku-s3/)もある。


参照元

- https://github.com/klis87/django-cloudinary-storage
- https://qiita.com/koki276/items/4f78ca421bea059d7b7a
- https://qiita.com/kanaxx/items/b3366025e6715562d8f9


