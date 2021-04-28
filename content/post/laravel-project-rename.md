---
title: "Laravelのプロジェクト名を書き換える"
date: 2021-04-19T08:37:27+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","初心者向け","tips" ]
---

既存のLaravelのプロジェクトを、プロジェクト名だけ書き換えて編集する。

## 環境

- Ubuntu 18.04
- Laravel Framework 7.30.4


## 結論

下記コマンドでプロジェクトを作ったとする。

    composer create-project --prefer-dist laravel/laravel [プロジェクト名]

上記コマンドで生成された`[プロジェクト名]`のディレクトリ名を書き換えれば良いだけの話である。


## 理屈

まず、プロジェクトを作った後、プロジェクトのディレクトリに移動して、下記コマンドを実行してもらいたい。

    grep -rl "[プロジェクト名]" .* *

これは`[プロジェクト名]`がファイル内に書かれてあるファイル(隠しファイルも含める)を再帰的に検索するコマンドである。つまり、プロジェクトを作った時に指定した`[プロジェクト名]`が直接書かれているファイルをあぶり出すのだ。

もし、設定ファイル関係などに`[プロジェクト名]`が直に書かれている場合、適宜書き換えないといけないが、出てくるのは動かすのに影響のないキャッシュやログファイルぐらいだろう。下記画像が実際に過去のプロジェクト名でgrepコマンドをした結果。

<div class="img-center"><img src="/images/Screenshot from 2021-04-19 09-05-23.png" alt="キャッシュとログファイルしか出てこない。"></div>

だから、プロジェクトのディレクトリ名を直接書き換えても問題はない。

## 例外

LaravelのDBを設定する時、SQLiteを指定することがあるが、この時にSQLiteのありかを絶対パスで指定してしまうと、プロジェクト名変えた時に動かなくなる。

sqliteは必ず、`database/database.sqlite`に作る。`.env`の設定も下記のようにする。

    #DB_CONNECTION=mysql
    #DB_HOST=127.0.0.1
    #DB_PORT=3306
    #DB_DATABASE=laravel
    #DB_USERNAME=root
    #DB_PASSWORD=
    DB_CONNECTION=sqlite

この状態であればプロジェクト名書き換えても問題ないプロジェクトが出来上がる。

今後もプロジェクト名を直に指定したファイル等を新たに作らなければ、自由に書き換えることができる。
