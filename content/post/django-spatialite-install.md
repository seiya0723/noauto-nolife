---
title: "【Django】SpatiaLiteをインストールさせ、GeoDjangoを使う"
date: 2021-10-28T14:19:01+09:00
draft: true
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "django","sqlite","geodjango","上級者向け" ]
---

PostGIS+PostgreSQLでは、わざわざ開発環境にPostgreSQLをインストールしないといけないので面倒。

だが、SpatiaLite+SQLiteの組み合わせであれば、開発環境にPostgreSQLまでインストールしなくても良い。DBの取扱が一気に楽になるだろう。

## 前提

- インストール対象はUbuntu。バージョンは不問
- SQLite3インストール済み(sqlite3コマンドが打てる状態)
- [GEOSとPROJ](https://docs.djangoproject.com/en/3.2/ref/contrib/gis/install/geolibs/)がインストール済み



## 手順

### SQLiteの対応状況のチェック

まず、sqlite3コマンドを実行し、下記のSQLが動くかどうかチェックする。

    CREATE VIRTUAL TABLE testrtree USING rtree(id,minX,maxX,minY,maxY);

このSQLが動作しなければ、SQLiteのバージョンが古いので、ソースからリコンパイルさせる。[SQLiteのDLページ](https://www.sqlite.org/download.html)を参照の上、下記コマンドを適宜変更。

    wget https://www.sqlite.org/YYYY/sqlite-amalgamation-XXX0000.zip
    unzip sqlite-amalgamation-XXX0000.zip
    cd sqlite-amalgamation-XXX0000
    CFLAGS="-DSQLITE_ENABLE_RTREE=1" ./configure
    make
    sudo make install
    cd ..

### SpatiaLiteのインストール

[SpatiaLiteのDLページ](https://www.gaia-gis.it/gaia-sins/libspatialite-sources/)から最新版のSpatiaLiteを指定してDL、インストールする。

現時点(2021年10月)での最新安定版は5.0.1なのでそれをDLした。[Django公式](https://docs.djangoproject.com/en/3.2/ref/contrib/gis/install/#spatial-database)によると、4.3以上をインストールしなければならないそうだ。

    wget https://www.gaia-gis.it/gaia-sins/libspatialite-sources/libspatialite-5.0.1.tar.gz
    tar xaf libspatialite-5.0.1.tar.gz
    cd libspatialite-5.0.1
    ./configure
    make
    sudo make install

これでインストール完了。

aptコマンドでもインストールはできる。4.3がインストールされるので問題は無い。

    sudo apt install spatialite-bin libspatialite-dev spatialite-gui

インストール完了後`spatialite`コマンドを実行して、4.3以上であればOK

## 動かすとこうなる

まず、`config/settings.py`にて、DATABASESはSQLiteを使うように指定。


## 結論

詳細は参照元を確認。

- 参照元:https://docs.djangoproject.com/en/3.2/ref/contrib/gis/install/geolibs/
- 参照元:https://docs.djangoproject.com/en/3.2/ref/contrib/gis/install/spatialite/

