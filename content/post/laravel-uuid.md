---
title: "Laravelで主キーにUUIDを実装させる方法【laravel-eloquent-uuid】"
date: 2021-02-13T13:45:59+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","初心者向け","tips" ]
---


主キーにUUIDを使用することで、デフォルトの連番で数値型のIDと違って予測されることがない。これはセキュリティ上、重要なことなのでなるべく開発初期段階で実装したい。

## 実装方法

UUID実装用のライブラリをcomposerからインストール。

    composer require goldspecdigital/laravel-eloquent-uuid:^7.0

ユーザーモデルを書き換える。`database/migrations/2014_10_12_000000_create_users_table.php`にて、下記のように編集。

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
                $table->uuid("id")->primary(); // ←uuidに
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


次、app/User.phpを編集。

    <?php
    
    namespace App;
    
    use Illuminate\Contracts\Auth\MustVerifyEmail;
    #use Illuminate\Foundation\Auth\User as Authenticatable;
    use GoldSpecDigital\LaravelEloquentUUID\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    
    class User extends Authenticatable
    {
        use Notifiable;
    
        /**
         * The attributes that are mass assignable.
         *
         * @var array
         */
        protected $fillable = [
            'name', 'email', 'password',
        ];
    
        /**
         * The attributes that should be hidden for arrays.
         *
         * @var array
         */
        protected $hidden = [
            'password', 'remember_token',
        ];
    
        /**
         * The attributes that should be cast to native types.
         *
         * @var array
         */
        protected $casts = [
            'email_verified_at' => 'datetime',
        ];
    }

この状態でマイグレーション実行。既にDBにマイグレーションした場合、DBを削除してから実行する。

    php artisan migrate

今後、新しくマイグレーションファイルを作る場合、下記のように記述してUUIDを使用する

    <?php
    
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    
    class CreateMemosTable extends Migration
    {
        public function up()
        {
            Schema::create('memos', function (Blueprint $table) {
                $table->uuid("id")->primary();
                $table->string("body");
                $table->string("color");
                $table->timestamps();
            });
        }
        public function down()
        {
            Schema::dropIfExists('memos');
        }
    }

## 結論

ユーザーモデルにも数値型かつオートインクリメントのIDが指定されているので、UUIDを実装したい場合は、上記手続きを忘れないように実行するべし。

デフォルトの数値型IDでマイグレーションして、ユーザーのデータを追加し、そこからUUIDに切り替えようとするのは大変なので、なるべくプロジェクト開始直後からUUIDの実装を心がけたい。


