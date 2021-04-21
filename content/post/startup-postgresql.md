---
title: "PostgreSQLインストールから、ロール(ユーザー)とDBを作る"
date: 2021-04-16T15:14:58+09:00
draft: true
thumbnail: "images/postgresql.jpg"
categories: [ "インフラ" ]
tags: [ "PostgreSQL","データベース","スタートアップシリーズ","初心者向け" ]
---


PostgreSQLのインストールからロール(ユーザー)作成、そのロールが扱うDBの作成を行う。

## インストール

Ubuntuであれば、aptコマンドでインストール可能

    sudo apt install postgresql

下記コマンドを打って、active(running)と表示されればOK

    sudo systemctl status postgresql.service


## ロール作成から、DB作成、権限割り当てまで


sudo -u postgres -i

これでpostgresユーザーのターミナルになる。

createuser --createdb --username=postgres --pwprompt djangouser

ロールを作る。DB作成権限あり。パスワード入力を求められるので、任意のパスワードを入力。



## ロール削除、DB削除






## TIPS


### これまで打ったコマンドを表示させる。

Bashで言うhistoryみたいなもの。これは覚えておいたほうが良い。

    \s

過去に打ったコマンドを検索したい場合は、Bashと同じようにCtrl+Rで検索できる。

### ロール(ユーザー)と権限を表示

    \du

### データベース一覧表示

    \l

### テーブル一覧表示

    \dt






