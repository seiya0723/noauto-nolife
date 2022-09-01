---
title: "【地理空間情報】GeoDjangoの実装方法【PostGIS+PostgreSQL+国土地理院データ】"
date: 2020-10-21T16:46:02+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "スタートアップシリーズ","django","geodjango","マッピング","上級者向け" ]
---


圧倒的に日本語の情報、及びソースコードが不足しているgeodjangoについてまとめています。(勉強してすぐにまとめているので、多少間違いがあるかも。)

Ubuntu 18.04 LTS にて動作確認済み。


## 流れ

1. Djangoのインストール
1. PostgreSQLのインストール
1. GEOS、GDAL、PROJ4、PostGISのインストール
1. プロジェクトの作成
1. アプリの作成
1. settings.pyの書き換え
1. models.pyの書き換え
1. 国土交通省のデータをDL
1. 地理空間情報の読み込み
1. admin.pyの書き換え
1. 開発用サーバーの起動



## Djangoのインストール

    sudo pip3 install django

## PostgreSQLのインストール

<!--

    # PostgreSQL
    sudo apt -y install postgresql-12
    sudo apt -y install postgresql-client-12
    sudo apt -y install postgresql-client-common postgresql-common 
    sudo apt -y install postgresql-contrib
    sudo apt -y install pgadmin3
    sudo apt -y install postgresql-server-dev-12
    # PostgreSQL for Python projects
    #sudo apt install python-psycopg2
    sudo apt -y install python3-psycopg2

-->


    # PostgreSQL
    sudo apt install postgresql-10
    sudo apt install postgresql-client-10
    sudo apt install postgresql-client-common postgresql-common 
    sudo apt install postgresql-contrib
    sudo apt install pgadmin3
    sudo apt install postgresql-server-dev-10
    # PostgreSQL for Python projects
    sudo apt install python-psycopg2
    sudo apt install python3-psycopg2


## GEOS、GDAL、PROJ4、PostGISのインストール

まずGEOSから。

<!--
下記を3.9,1でインストールし直し
-->
    
    cd /usr/local/ 
    sudo mkdir geos 
    sudo chown $USER geos 
    cd geos
    wget http://download.osgeo.org/geos/geos-3.5.1.tar.bz2
    tar -xvjof geos-3.5.1.tar.bz2
    cd geos-3.5.1
    ./configure --enable-python
    make
    sudo make install

次、GDAL。

    sudo apt install gdal-bin 
    sudo apt install libgdal-dev 
    sudo apt install libgdal1-dev
    sudo apt install python-gdal
    sudo apt install python-geopandas
    sudo apt install python3-gdal
    sudo apt install python3-geopandas

PROJ4のインストール。

    cd /usr/local/
    sudo mkdir proj
    sudo chown $USER proj
    cd proj
    wget http://download.osgeo.org/proj/proj-5.1.0.tar.gz
    tar -xzvof proj-5.1.0.tar.gz
    cd proj-5.1.0
    ./configure
    make
    sudo make install


PostGISのインストール。

<!--
    3.0.0でインストールし直し。
-->

    sudo apt install libxml2-dev
    cd /usr/local/
    sudo mkdir postgis
    sudo chown $USER postgis
    cd postgis
    wget http://download.osgeo.org/postgis/source/postgis-2.4.4.tar.gz
    tar -xzvof postgis-2.4.4.tar.gz
    cd postgis-2.4.4
    ./configure --with-projdir=/usr/local/proj/proj-5.1.0 --with-pgconfig=/usr/bin/pg_config --with-xml2config=/usr/bin/xml2-config
    make
    sudo make install


## プロジェクトの作成

    mkdir geodjango
    django-admin startproject config .


## アプリの作成

    python3 manage.py startapp mapping 

## settings.pyの書き換え

INSTALLED_APPSに下記を追加

    'django.contrib.gis',
    'mapping.apps.MappingConfig',

DATABASESを書き換え

    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': '',
            'USER': '',
            'HOST':'',
            'PASSWORD': '',
        },
    }


## models.pyの書き換え

    from django.contrib.gis.db import models
    class Border(models.Model):
        n03_001 = models.CharField(max_length=10,null=True,blank=True)
        n03_002 = models.CharField(max_length=20,null=True,blank=True)
        n03_003 = models.CharField(max_length=20,null=True,blank=True)
        n03_004 = models.CharField(max_length=20,null=True,blank=True)
        n03_007 = models.CharField(max_length=5,null=True,blank=True)
        geom     = models.PolygonField(srid=6668)
    

## 国土交通省のデータをDL

https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v2_3.html#prefecture00 から、N03-190101_GML.zipをDL 

## 地理空間情報の読み込み

アプリの中に読み込み用のスクリプトを作る。`load.py`

    # -*- coding: utf-8 -*-
    import os
    from django.contrib.gis.utils import LayerMapping
    from mapping.models import Border
    # Modelとシェープファイルのカラムのマッピング
    border_mapping = { 
        'n03_001' : 'N03_001',
        'n03_002' : 'N03_002',
        'n03_003' : 'N03_003',
        'n03_004' : 'N03_004',
        'n03_007' : 'N03_007',
        'geom' : 'POLYGON',
    }
    # シェープファイル
    border_shp = os.path.abspath(
        os.path.join(os.path.dirname(__file__), 'data', 'N03-19_190101.shp'),
    )
    def run(verbose=True):
        lm = LayerMapping(Border, border_shp, border_mapping, transform=False, encoding='UTF-8')
        lm.save(strict=True, verbose=verbose)

アプリディレクトリ内にdataディレクトリを作り、その中に先程DLしたシェープファイルを配置する。


`python3 manage.py shell` を実行。下記を入力してload.pyを実行する。


    from data import load
    load.run()

<div class="img-center"><img src="/images/Screenshot from 2020-10-21 15-37-12.png" alt=""></div>
    
## admin.pyの書き換え

admin.pyに下記を記入

    from django.contrib.gis import admin
    from .models import Border
    
    admin.site.register(Border,admin.OSMGeoAdmin)


## 開発用サーバーの起動

    python3 manage.py runserver 127.0.0.1:8000


管理サイトに入り。下記画像が表示されれば成功。

<div class="img-center"><img src="/images/Screenshot from 2020-10-21 15-41-38.png" alt=""></div>


<!--
## ソースコード

以下からDL可能。ただ、管理サイトからしかアクセスできないのでまだまだ改良が必要。それからシェープファイルが重すぎるので上記リンクから別途DL必要。

https://github.com/seiya0723/startup-geodjango
-->
