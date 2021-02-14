---
title: "LaravelをHerokuにデプロイする【Heroku-postgresql使用】"
date: 2021-02-13T14:01:48+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","Heroku","初心者向け" ]
---

LaravelをHerokuにデプロイする。DBにはHerokuPostgresを使用する。

本記事の対象読者はHerokuCLIはインストール済み、基本的なコマンドは習得済みとする。

## 流れ

1. Herokuからアプリを作る
1. HerokuPostgresを実装
1. 起動用のProcfileを作る
1. ローカルリポジトリとHerokuのリモートリポジトリの関連付け
1. デプロイ
1. 環境変数の設定を施す(多いのでシェルスクリプトを実装するべき)
1. マイグレーション

## Herokuからアプリを作る

ダッシュボードからNewをクリックしてアプリを作る。リージョンはアメリカで。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-08-22.png" alt="新しくアプリを作る。"></div>

## HerokuPostgresを実装

HerokuPostgresを採用する。作ったアプリのページからResourcesタブをクリックして、HerokuPostgresを検索して追加。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-14-42.png" alt="DBの追加"></div>

HerokuPostgresのページからDBの認証情報を全て控えておく。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-19-57.png" alt="DBの認証情報を控える"></div>


## 起動用のProcfileを作る

Laravelのプロジェクトのディレクトリにて、Procfileを作るため、下記コマンドを実行する。

    echo "web: vendor/bin/heroku-php-apache2 public/" > Procfile

ざっくり言うと、これはデプロイ後にプロジェクトを起動させるためのものだ。

## ローカルリポジトリとHerokuのリモートリポジトリの関連付け

デプロイするLaravelのプロジェクトにて、ローカルリポジトリを作り、コミットする。

    git init 
    git add .
    git commit -m "1st commit"

続いて、先程作ったアプリのリモートリポジトリと関連付け。アプリのDeployタブをクリックすると、こんなコマンドの画面が表示されるので、これに倣ってコマンドを打つ

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 14-22-11.png" alt="リモートリポジトリ関連付け"></div>

    heroku git:remote -a [先程作ったアプリ名]

## デプロイ

プッシュする。

    git push heroku master

これでデプロイ自体は完了。ただ、これだけでは正常に動かないので、次項で環境変数(DBの認証情報や秘密鍵、デバッグモード等の設定)を指定する。

## 環境変数の設定を施す(多いのでシェルスクリプトを実装するべき)

環境変数の設定は

    heroku config:set [設定内容]

この構文でできる。そのため、以下のコマンドを順次実行していく。

    heroku config:set APP_DEBUG=false
    heroku config:set APP_URL=[デプロイ先のサイトのURL]
    heroku config:set APP_KEY=[この部分は後述]
    heroku config:set DB_CONNECTION=pgsql
    heroku config:set DB_HOST=[Hostを入れる]
    heroku config:set DB_PORT=5432
    heroku config:set DB_DATABASE=[Databaseを入れる]
    heroku config:set DB_USERNAME=[Userを入れる]
    heroku config:set DB_PASSWORD=[Passwordを入れる]

`APP_KEY`のデータは下記コマンドを実行し、`base64:`から始まる文字列をセットすれば良い

    php artisan key:generate --show

DBの認証情報も含むので、実行するコマンドは非常に多い。面倒な場合はシェルスクリプトを組んで実行してもOK

## マイグレーション

DBの認証情報設定後、マイグレーションを実行する。マイグレーションはHeroku上で実行されるので、`heroku run`が先頭に付く点に注意。

    heroku run php artisan migrate

マイグレーション完了の標準出力が表示されたらデプロイ作業は完了。

## 結論

[DjangoのHerokuデプロイ](/post/django-deploy-heroku/)に比べれば、今回のLaravelはそれほど難しくはない。環境変数の設定のコマンドはやや面倒だが、シェルスクリプトを作って実行すれば良いので、デプロイ作業自体は10分もあれば十分かと。ライブラリもプッシュ時に自動的にインストールしてくれるので実機のUbuntuにデプロイするよりは楽。

後は、デプロイ後にマイグレーションを忘れずに実行すること。HerokuPostgresにマイグレーションファイルの内容を反映させる。


