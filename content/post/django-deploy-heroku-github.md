---
title: "【Django】GitHubを使ってHerokuにデプロイをする"
date: 2024-07-03T17:35:45+09:00
lastmod: 2024-07-03T17:35:45+09:00
draft: false
thumbnail: "images/heroku.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","Heroku","デプロイ" ]
---


## settings.pyの内容 

一部省略している。

os モジュールを使って、環境変数を読み込みする。

```
import os 

DEBUG = False

# 中略


# 静的ファイルの読み込み設定がwhitenoiseに影響が及ぶので、デバッグ時にのみ有効にしておく。
if DEBUG:
    STATICFILES_DIRS = [ BASE_DIR / "static" ]


# 中略

if not DEBUG:

    #INSTALLED_APPSにcloudinaryの追加
    INSTALLED_APPS.append('cloudinary')
    INSTALLED_APPS.append('cloudinary_storage')

    # ALLOWED_HOSTSにホスト名)を入力
    ALLOWED_HOSTS = [ os.environ["HOST"] ]

    SECRET_KEY = os.environ["SECRETKEY"]
    
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
                'NAME'    : os.environ["DB_NAME"],
                'USER'    : os.environ["DB_USER"],
                'PASSWORD': os.environ["DB_PASSWORD"],
                'HOST'    : os.environ["DB_HOST"],
                'PORT': '5432',
                }
            }

    #DBのアクセス設定
    import dj_database_url

    db_from_env = dj_database_url.config(conn_max_age=600, ssl_require=True)
    DATABASES['default'].update(db_from_env)
    

    #cloudinaryの設定
    CLOUDINARY_STORAGE = { 
            'CLOUD_NAME': os.environ["CLOUD_NAME"], 
            'API_KEY'   : os.environ["API_KEY"], 
            'API_SECRET': os.environ["API_SECRET"],
            "SECURE"    : True,
            }

    #これは画像だけ(上限20MB)
    #DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

    #これは動画だけ(上限100MB)
    #DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.VideoMediaCloudinaryStorage'

    #これで全てのファイルがアップロード可能(上限20MB。ビュー側でアップロードファイル制限するなら基本これでいい)
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.RawMediaCloudinaryStorage'
```

## HerokuとGitHubの連携

Deployタブで、『Deployment method』 からGitHubを選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2024-07-03 18-02-02.png" alt=""></div>

Authorize heroku をクリックする。

<div class="img-center"><img src="/images/Screenshot from 2024-07-03 18-02-42.png" alt=""></div>


リポジトリを選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2024-07-03 18-03-47.png" alt=""></div>

リポジトリのmainブランチを選んで、設定は完了。

<div class="img-center"><img src="/images/Screenshot from 2024-07-03 18-04-29.png" alt=""></div>

以降は、リポジトリのプッシュがされるたびに、自動的にデプロイがされる。

## 環境変数の設定

https://dashboard.heroku.com/apps/アプリ名/settings の  Config Vars  から設定できる。

<div class="img-center"><img src="/images/Screenshot from 2024-07-16 09-32-26.png" alt=""></div>


### Cloudinary の 環境変数

Cloudinaryを追加することで、最初から`CLOUDINARY_URL`が追加される。

`CLOUDINARY_URL`は
```
CLOUDINARY_URL = cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]
```
この構成になっている。

この3つの環境変数を追加すると、今回のsettings.pyに合わせることができる。

参照: https://pypi.org/project/django-cloudinary-storage/


## デプロイ完了後

以下のコマンドでマイグレーションができる。

```
heroku login 

heroku run python manage.py migrate --app seiya0723-django-fileupload
```


## ソースコード

https://github.com/seiya0723/django_fileupload_hrk
