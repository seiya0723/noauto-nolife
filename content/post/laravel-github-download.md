---
title: "【Laravel】GitHubからダウンロードしたプロジェクトを動作させるには？"
date: 2023-01-27T11:50:36+09:00
lastmod: 2023-01-27T11:50:36+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","GitHub","tips","Ubuntu" ]
---

GitHubにプッシュされているLaravelプロジェクトをDLして動かすには別途手順を踏む必要がある。


## 前提

Ubuntuを使用している場合、必要なPHPパッケージが既にインストールされているかをチェックする

```
sudo apt install -y php8.1-cli php8.1-common php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-sqlite3
```

もし、これでパッケージが見つからないと表示される場合は、リポジトリの追加がされていない状況である。

下記コマンドを実行して、再度↑のコマンドを実行する。

```
sudo apt-add-repository ppa:ondrej/php
```


## GitHubからDLしたLaravelプロジェクトを動かす流れ

1. git cloneでプロジェクトをダウンロード
1. composer update で必要なパッケージのインストール
1. .env.sampleから.envファイルを作る
1. php artisan key:generate で暗号化処理のキーの生成
1. データベースの作成とマイグレーション
1. プロジェクトを起動する


## git cloneでプロジェクトをダウンロード

    git clone GitHubのURL

でクローンできる。


## composer update で必要なパッケージのインストール

プロジェクトへ移動した上で

    composer update 

で必要なパッケージの再インストールができる。

## .env.sampleから.envファイルを作る

    cp .env.example .env

を実行して.envファイルを作る。

DBとしてSQLite3を使うように書き換える。

```
#DB_CONNECTION=mysql
#DB_HOST=127.0.0.1
#DB_PORT=8889
#DB_DATABASE=
#DB_USERNAME=root
#DB_PASSWORD=root
DB_CONNECTION=sqlite
```

## php artisan key:generate で暗号化処理のキーの生成

```
php artisan key:generate
```

で暗号化処理のキーを生成する。


## データベースの作成とマイグレーション

データベースを作る

```
touch ./database/database.sqlite
```

マイグレーションをする。

```
php artisan migrate 
```


## プロジェクトを起動する

```
php artisan serve 
```



## 結論

`composer update`コマンドで失敗する場合はPHPのパッケージが不足している状況にある。

環境を考慮する必要が有る。


【参照元】

- [Laravelビギナーが30分で掲示板アプリを作る方法](/post/startup-laravel/)
- [【Ubuntu】最新版PHPがインストールできるようにリポジトリを追加する](/post/ubuntu-add-php-repository/)




### すべてをまとめたalias

自分用に。clipcopyはbashでクリップボードにコピーするコマンド

[Linuxでコマンドラインからクリップボードにコピーする【UbuntuもOK】](/post/linux-commandline-clipboard/)



```
alias laravelgithub='composer update && cp .env.example .env && echo "
#DB_CONNECTION=mysql
#DB_HOST=127.0.0.1
#DB_PORT=8889
#DB_DATABASE=
#DB_USERNAME=root
#DB_PASSWORD=root
DB_CONNECTION=sqlite" | clipcopy && vi .env && php artisan key:generate && touch ./database/database.sqlite && php artisan migrate && php artisan serve
'
```


## 問題と対処法

### 【問題1】Vite manifest not found とエラーが表示される

npmが存在しないため、このエラーが出てくる。まず、

```
npm start
```

を実行。その上で

```
npm run build
```
を実行する。これで動く。

vite not found と表示される場合は以下を実行

```
npm install vite

npm run dev 
```



参照元: https://biz.addisteria.com/laravel_vite_errors/https://biz.addisteria.com/laravel_vite_errors/



