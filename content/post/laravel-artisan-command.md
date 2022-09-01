---
title: "Laravelのartisanコマンドのまとめ【開発用サーバー立ち上げ、コントローラやマイグレーションファイル等の作成、ルーティングの確認などに】"
date: 2021-02-01T08:07:45+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","php","初心者向け" ]
---

laravelのartisanコマンドをよく使うと思われる順にまとめる。

## 開発用サーバーを立ち上げる

    php artisan serve

ホスト名とポート番号の指定もできる。

    php artisan serve --host=[ホスト名] --port=[ポート番号]

## コントローラーを作る

    php artisan make:controller [コントローラー名]

--resourceをつけると、Restful化もできる

    php artisan make:controller [コントローラー名] --resource

## モデルを作る
    
    php artisan make:model [モデル名]

--migrationをつけると、モデルと同時にマイグレーションファイルを作ることができる

    php artisan make:model [モデル名] --migration 

## マイグレーションファイルを作る

新たにモデルと同時にマイグレーションファイルを作る方法。

    php artisan make:model [モデル名] --migration 

既に存在するテーブルを指定してマイグレーションファイルを作る方法(カラムの追加、編集などに)

    php artisan make:migration [マイグレーションファイル名] --table=[テーブル名]

## マイグレーションの実行

マイグレーションファイルに書かれた内容を全てDBに反映させる

    php artisan migrate

## ルーティング情報の確認

    php artisan route:list

こんな感じにルーティング情報が出力される。メソッドとURIに対するアクションが表示される。

    +--------+-----------+---------------------+----------------+-----------------------------------------------+------------+
    | Domain | Method    | URI                 | Name           | Action                                        | Middleware |
    +--------+-----------+---------------------+----------------+-----------------------------------------------+------------+
    |        | GET|HEAD  | api/user            |                | Closure                                       | api        |
    |        |           |                     |                |                                               | auth:api   |
    |        | GET|HEAD  | topics              | topics.index   | App\Http\Controllers\TopicsController@index   | web        |
    |        | POST      | topics              | topics.store   | App\Http\Controllers\TopicsController@store   | web        |
    |        | GET|HEAD  | topics/create       | topics.create  | App\Http\Controllers\TopicsController@create  | web        |
    |        | GET|HEAD  | topics/{topic}      | topics.show    | App\Http\Controllers\TopicsController@show    | web        |
    |        | PUT|PATCH | topics/{topic}      | topics.update  | App\Http\Controllers\TopicsController@update  | web        |
    |        | DELETE    | topics/{topic}      | topics.destroy | App\Http\Controllers\TopicsController@destroy | web        |
    |        | GET|HEAD  | topics/{topic}/edit | topics.edit    | App\Http\Controllers\TopicsController@edit    | web        |
    +--------+-----------+---------------------+----------------+-----------------------------------------------+------------+


## laravelのバージョン確認

    php artisan --version 

バージョン表示。

    Laravel Framework 7.30.4


## artisanコマンド一覧表示

    php artisan list

おそらく、このコマンドを実行すれば、この記事は無くても良いと思われる。


## 結論

laravelの`artisan`コマンドは種類が多く、全てを把握し切るのは難しい。最低限、サーバー立ち上げ、コントローラーの作成、モデルとマイグレーションファイルの作成、マイグレーション。この辺りだけ抑えておけばとりあえずは十分かと。



