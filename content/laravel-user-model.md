---
title: "Laravelのユーザーモデルをカスタムする"
date: 2021-12-06T18:28:16+09:00
draft: true
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","認証" ]
---

Laravelにはマイグレーション時、予め公式が作っておいたユーザーのマイグレーションファイルも一緒にマイグレーションされるため、何も考えなくてもユーザーモデルも作られるが、その内容は必要最低限で、ウェブアプリによってはカスタムしなければ使い物にならない場合もある。

例えば、住所や生年月日などをセットで記録する場合、フィールドを追加しなければならない。ユーザーが所属している部署を記録しなければならない場合、1対多でリレーションを組む必要がある。

本記事ではユーザーモデルのカスタムから、ユーザーの新規作成画面までを作る。

## デフォルトのユーザーモデル(マイグレーションファイル)の中身

デフォルトのLaravelのユーザーモデル(ユーザーテーブルを作るマイグレーションファイル)はこんな感じ。

    <?php
    
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    
    class CreateUsersTable extends Migration
    {
        /** 
         * Run the migrations.
         *
         * @return void
         */
        public function up()
        {   
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->timestamps();
            });
        }   
    
        /** 
         * Reverse the migrations.
         *
         * @return void
         */
        public function down()
        {   
            Schema::dropIfExists('users');
        }   
    }

上から順に

- 主キーとして機能する`id`
- ユーザーネームである`name`
- メールアドレスを記録する`email`
- メールの認証済み日時を記録する`email_verified_at`
- パスワードを記録する`password`
- リメンバートークン
- タイムスタンプ

となっている。今回は、このフィールドを下記のように書き換える。

- ユーザーの本名(名前)を入力する`first_name`の追加
- ユーザーの本名(名字)を入力する`last_name`の追加
- ウェブアプリの管理ユーザーであるかを(ブーリアン値で)判定する`is_staff`の追加

本名の記録は実名登録を基本としたウェブアプリで効果を発揮するだろう。管理ユーザーであるかどうかのチェックは、投稿されたデータの編集や削除をする管理ページを別途作る際、アクセス権の有無を判定する際に有効だ。



## ユーザーモデルをカスタムするには？

一番手っ取り早いのが、database/database.sqliteを新しく作り直しで、マイグレーションファイルを編集し、マイグレーションのコマンドを実行する。もし、本番環境にデプロイした場合は、[既存のテーブルに対するのマイグレーションファイルの作成コマンドを実行する。](/post/laravel-artisan-command/)





