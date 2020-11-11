---
title: "Herokuのデータベース(herokupostgres)の実装と設定方法【Hobby-Plan】"
date: 2020-11-05T12:05:07+09:00
draft: false
thumbnail: "images/heroku.jpg"
categories: [ "web" ]
tags: [ "heroku","postgresql" ]
---

## Heroku postgresの実装方法

プロジェクトのResourcesからHeroku Postgresを指定。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 14-09-31.png" alt="Heroku postgresを指定"></div>

続いて、Submit Order Formを指定する。プランはHobbyを選択。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 14-11-18.png" alt="Hobbyプランで実装"></div>

Add-onsのHerokuPostgresのリンクをクリック、SettingsタブのDatabaseCredentialsのView Credentialsをクリック

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 14-14-43.png" alt="認証情報の照会"></div>

データベース名などの認証情報が表示される。これをプロジェクトの設定ファイルに書き込む。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-19-57.png" alt="認証情報"></div>

## Heroku-CLIからSQLを実行する

先の項目の画像のHeroku CLIのコマンドを、gitで連携したプロジェクト直下のディレクトリで実行する。

    heroku pg:psql postgresql-[文字列]-[数値] --app [アプリ名]

下記画像のようにSQLが実行できる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 14-20-20.png" alt="HerokuCLIからSQL実行"></div>

テーブル削除などの処理もできる。

## データベースのリセットとデストロイ

リセットはテーブルはそのまま、レコードを全て削除する。デストロイはデータベースごと削除する。

場所は、データベースのSettingタブ。

<div class="img-center"><img src="/images/Screenshot from 2020-11-05 14-23-44.png" alt=""></div>

マイグレーション関係でエラーが出た場合は、デストロイした上でマイグレーションを再度実行すればたいてい解決する。

