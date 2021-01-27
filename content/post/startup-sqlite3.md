---
title: "SQLiteの操作方法【テーブル一覧表示、SQLなど】"
date: 2020-10-26T13:51:50+09:00
draft: false
thumbnail: "images/sqlite.jpg"
categories: [ "データベース" ]
tags: [ "スタートアップシリーズ","sqlite","システム管理" ]
---


## インストールと基本操作

Ubuntuであればaptコマンドで簡単にインストールできる。

    sudo apt install sqlite3

ファイルの閲覧は`sqlite3`コマンドで実行できる。対象のsqlite3ファイルを指定するだけ。

    sqlite3 db.sqlite3

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 14-16-14.png" alt="インタラクティブシェルに入る"></div>

## テーブル一覧表示

テーブル一覧表示。
    
    .table

<div class="img-center"><img src="/images/Screenshot from 2020-10-26 14-14-20.png" alt="テーブル一覧表示"></div>


## 基本的なSQL文

SELECT文。指定したテーブルを参照する。

    SELECT カラム名 FROM テーブル名

INSERT文。指定したレコードを追加する。文字列型はダブルクオーテーションでくくる。数値型はそのまま

    INSERT INTO テーブル名 (カラム名, カラム名) values ("データ", "データ");


UPDATE文。条件に一致したレコードを編集する。

    UPDATE テーブル名 SET カラム名 = "データ", カラム名 = "データ" WHERE 条件式


DELETE文。条件に一致したレコードを削除する。

    DELETE FROM テーブル名 WHERE 条件式;



## 結論

ウェブアプリケーションフレームワークを使っていると必ずお世話になるSQLiteの操作方法は覚えておいて損は無いかと。

ただ、コマンド操作が主になるので、GUIで操作したい場合は別途ツールを使うか、ウェブアプリの管理サイトを作ったほうが良いでしょう。

それから、SQLiteはMySQLとかと違ってDBが存在せず、テーブルが直に設置されている点でも異なるので要注意。さらにアクセス時にパスワードやユーザー名が要求されず、権限なども存在しないため本番環境で使用するのは御法度。


