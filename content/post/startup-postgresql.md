---
title: "PostgreSQLインストールから、ユーザーとDBを作る"
date: 2021-04-16T15:14:58+09:00
draft: false
thumbnail: "images/postgresql.jpg"
categories: [ "インフラ" ]
tags: [ "PostgreSQL","データベース","スタートアップシリーズ","初心者向け" ]
---

PostgreSQLのインストールからユーザー作成、そのユーザーが扱うDBの作成を行う。

## インストール

Ubuntuであれば、aptコマンドでインストール可能

    sudo apt install postgresql

下記コマンドを打って、active(running)と表示されればOK。active (exited)でも可

    sudo systemctl status postgresql.service

## ユーザー作成から、権限割り当て、DB作成まで

    sudo -u postgres -i

これでpostgresユーザーのターミナルになる。

    createuser --createdb --username=postgres --pwprompt [任意のユーザー名]

ユーザーを作る。DB作成権限あり。パスワード入力を求められるので、任意のパスワードを入力。

    createdb [任意のDB名] --owner=[任意のユーザー名]

DBを作り、先ほど作ったユーザー名を所有者とする。

postgresユーザーからログアウト(Ctrl+D)して、[任意のユーザー名]の扱う[任意のDB名]にアクセスする。先ほどのユーザー作成で指定したパスワードを入力するとログインできる。

    psql -U [任意のユーザー名] -h localhost -d [任意のDB名]

`\l`コマンドを打って、DBが作られていればOK。

<div class="img-center"><img src="/images/Screenshot from 2021-04-22 08-52-01.png" alt="DBとユーザーが作られている。"></div>

後は、ユーザー名とパスワード、DB名を控えた上で、ウェブアプリの設定等に記述すれば良い。


## DBの削除、ユーザーの削除

作成時と同様にまず、postgresユーザーになる。

    sudo -u postgres -i

続いて、dropdbコマンドでDBを削除する。

    dropdb [任意のDB名]

ユーザーの削除はdropuserコマンド。

    dropuser [任意のユーザー名]

注意しなければならないことは、DBを持っているユーザーを削除する時、先にDBから削除しないとユーザーを削除することはできないという点である。

また、`dropdb`及び`dropuser`はそれぞれ権限が与えられているpostgresユーザーのシェルから行う。

## psqlコマンドのTIPS

PostgreSQLで使えるpsqlコマンドをまとめる。これはシェルではなくpsqlコマンドでログインした時に有効である。

### これまで打ったコマンドを表示させる。

Bashで言う`history`みたいなもの。これは覚えておいたほうが良い。

    \s

過去に打ったコマンドを検索したい場合は、Bashと同じようにCtrl+Rで検索できる。

### ユーザーと権限を表示

    \du

ユーザーと権限の一覧が確認できる。先ほど作ったユーザーもここに載る。

### データベース一覧表示

    \l

DB名とオーナー、エンコード方式などが確認できる。

### テーブル一覧表示

    \dt


## この状況の時、使えるのはシェルコマンド？SQL？psqlコマンド？


### シェルコマンドを使いたい時

`ユーザー名@端末名:~$`が表示されている場合、使えるのはシェルコマンド。下記コマンドでpostgresというユーザーになった時使える。

    sudo -u postgres -i

postgresはPostgreSQLの管理ユーザーなので、ユーザー作成の`createuser`コマンド、DB削除の`dropdb`コマンドが使える。この状態ではSQLと`\`から始まるpsqlコマンドは使えない。

### SQLとpsqlコマンドを使いたい時

SQLとpsqlコマンドが使いたいのであれば、`psql`コマンドを打つ。

上記のpostgresユーザーになった状態であれば、

    psql

postgresが作ったユーザーにログインして、SQLとpsqlコマンドを使いたいのであれば、

    psql -U [任意のユーザー名] -h localhost -d [任意のDB名]

このコマンドを打つ。この状態であればSQLとpsqlコマンドを使うことができる。

## 結論

ひとまずDBとユーザーの作成さえできればウェブアプリからアクセスすることはできるだろう。

PostgreSQLはMySQLとはやや仕組みが違う。予めコマンドの差異を控えておくと良い。

https://qiita.com/aosho235/items/c657e2fcd15fa0647471

