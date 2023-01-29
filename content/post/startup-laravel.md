---
title: "Laravelビギナーが30分で掲示板アプリを作る方法"
date: 2021-10-26T15:13:33+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "スタートアップシリーズ","laravel","php","初心者向け","ubuntu" ]
---

laravelはDjangoと違って初っ端から大量のファイルやディレクトリが表示され、気後れしそうになるが、編集する部分さえ分かれば大したことはない見掛け倒し。

PHPを中心に扱う現場ではlaravelのスキルが求められるのでウェブ屋になるのであれば、是非とも習得しておきたい。

対象読者はlaravelを既にPCにインストール済み、Linux系コマンド習得済み、PHP及びHTML/CSS/JSの基本構文を把握済みとします。

## 流れ


1. プロジェクトを作る(3分)
1. DBはSQLiteを読み込むよう設定する(3分)
1. ルーティングを作る(4分)
1. コントローラーを作る(5分)
1. モデルの定義とマイグレーション実行(5分)
1. ビュー(テンプレート)を作る(5分)
1. タイムゾーンを合わせる(2分)
1. 開発サーバー起動(3分)

本記事は初心者向けにつき、認証やAjax、バリデーション、MySQL設定(SQLiteで対応)などは説明していない点に注意。


## プロジェクトを作る(3分)

laravelコマンドを使ってプロジェクトを作る。

    laravel new test_bbs

composerコマンドを使ってもプロジェクトは作れる。laravelコマンドが使えない方はこちら。

    composer create-project --prefer-dist laravel/laravel test_bbs


## DBはSQLiteを読み込むよう設定する(3分)

DBの設定関係をスキップするため、SQLiteを使用する。プロジェクト内の`database`ディレクトリにdatabase.sqliteを作る

    touch ./database/database.sqlite

続いて、デフォルトではMySQLを使っている状況になっている設定をSQLiteであるdb.sqliteを使用するように修正する。プロジェクトディレクトリの中にある`.env`ファイルを編集する。


    # DB_CONNECTION=mysql
    # DB_HOST=127.0.0.1
    # DB_PORT=3306
    # DB_DATABASE=laravel
    # DB_USERNAME=root
    # DB_PASSWORD=
    DB_CONNECTION=sqlite

既に書き込まれているDB設定は#でコメントアウトする。


### 【補足1】マイグレーション時にcould not find driver というエラーが出た場合

後述の`php artisan migrate`実行時に could not find driver というエラーが出た場合、php-sqlite3がインストールされていない

```
sudo apt install php8.1-sqlite3
```

このようにphpのsqlite3ドライバーをインストールしておく。


## ルーティングを作る(4分)

どこのURLにアクセスした時、なんの処理をするかをまとめるためのルーティングを書く。その場所が`routes/web.php`である。

もともとあった、Routeはコメントアウトして新たに2行追加する。

    /*
    Route::get('/', function () {
        return view('index');
    });
     */
    Route::get('/', 'PagesController@index');
    Route::post('/', 'PagesController@save');

## コントローラーを作る(5分)

続いて、コントローラーを作る。下記コマンドを実行、`PagesController`を作成する。スペルミスにご注意。

    php artisan make:controller PagesController

上記コマンドで`app/Http/Controllers/PagesController.php`が作られる。これを編集する。

    <?php
    
    namespace App\Http\Controllers;
    
    use Illuminate\Http\Request;
    use App\Topic;
    
    class PagesController extends Controller
    {
        public function index() {
    
            $topics  = Topic::latest()->get();
    
            return view('index' , [ "topics" => $topics ]); 
        }   
        public function save(Request $request) {
    
            //Topicを受け入れるための箱を作る
            $topic = new Topic();
    
            //nameとcontentが指定されている場合保存する
            if ($request->name && $request->content){
                $topic->name = $request->name;
                $topic->content = $request->content;
                $topic->save();
            }

            return redirect('/');
        }   
    }
    
まだ、モデルとテンプレートが作られていないが、そのまま上記を書き込む。`public function index()`もしくは`public function save()`がルーティングから呼び出される関数名。

ルーティングがコントローラー内の関数(アクション)を呼び出す。コントローラーは呼び出されたアクションを実行する。アクションの内容はDBへのアクセスとレンダリング処理。

レンダリング時にはビューの定義が必要。DBへのアクセスにはDBの取り扱い説明書に当たるモデルの定義が必要。いずれも後述の解説を参照されたし。

## モデルの定義とマイグレーション実行(5分)

モデルを作るため、下記コマンドを実行する。Topicモデルを作る

    php artisan make:model Topic --migration

上記コマンドを実行後、`./database/migrations/`の中に`2020_10_28_034748_create_topics_table.php`などというファイル名が作られる。これを編集する。

※冒頭の数字は日付であるため、適宜解釈する。

    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    
    class CreateTopicsTable extends Migration
    {
        /** 
         * Run the migrations.
         *
         * @return void
         */
        public function up()
        {   
            Schema::create('topics', function (Blueprint $table) {
                $table->id();
                $table->string("name",10);
                $table->text("content");
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
            Schema::dropIfExists('topics');
        }   
    }
    
続いて、定義したモデルを書き込み可能とさせる。

`./apps/Topic.php`にて下記を記入する。

    <?php
    
    namespace App;
    
    use Illuminate\Database\Eloquent\Model;
    
    class Topic extends Model
    {
        protected $fillable = [
            "name","content"
        ];
    }
    

名前と投稿欄を書き込み可能とさせる。続いて、このモデルの設定をマイグレーションさせ、DBに反映させる。

    php artisan migrate

エラーが出なければOK。続いて、ビューの制作を行う。

## ビュー(テンプレート)を作る(5分)

`./resources/views/`内に、`index.blade.php`を作り、下記を入力する。

    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <header>
            <h1 class="bg-primary text-white text-center">簡易掲示板サイトへようこそ</h1>
        </header>
    
        <main class="container">
    
            <form method="POST">
                {{ csrf_field() }}
                <input class="form-control my-2" type="text" name="name" placeholder="ここに名前を入力">
                <textarea class="form-control my-2" name="content" rows="4" placeholder="ここにコメントを入力"></textarea>
                <input class="form-control my-2" type="submit" value="送信">
            </form>
    
            @forelse ( $topics as $topic )
            <div class="border my-2 p-2">
                <div class="text-secondary">{{ $topic->name }} さん</div>
                <div class="p-2">{!! nl2br(e($topic->content)) !!}</div>
                <div class="text-secondary">投稿日:{{ $topic->created_at }}</div>
            </div>
    
            @empty
            <p>投稿はありません。</p>
            @endforelse
    
        </main>
    </body>
    </html>

POSTメソッドのフォームを作る時、{{ csrf_field() }}を忘れずに。

投稿文を改行するにはnl2brが必要だが、XSSの脆弱性対策のため、ヘルパ関数のe()を使用して無害化させる必要がある。これでほぼ完成だが、投稿日時がおかしなことになるので、タイムゾーンを合わせる。

## タイムゾーンを合わせる(2分)

タイムゾーンを日本に合わせる。`./config/app.php`を編集する。

    'timezone' => 'Asia/Tokyo',

これでOK。


## 開発サーバー起動(3分)

開発サーバーを起動させる。下記コマンドを実行

    php artisan serve 

http://127.0.0.1:8000 にアクセスすると下記のような画面が表示される。

<div class="img-center"><img src="/images/Screenshot from 2020-10-29 11-30-04.png" alt="簡易掲示板サイトが表示される。"></div>

バリデーションを行っていないので、名前とコメントは必ず入力してから送信を押す。

## 結論

簡単にまとめるとlaravelはこんな感じ。

- ルーティングの役割は、URLとメソッドごとにコントローラーを呼び出し
- コントローラーの役割は、DBアクセスとレンダリング指示
- ビューの役割は、コントローラーから受け取った変数などを元にレンダリング
- モデルの役割は、DBの定義とコントローラーの取説

コントローラーがDBにアクセスしているのは斬新。Djangoだったら、それはビューの仕事ですし。役割が同じなのはモデルぐらいだろうか。

Djangoの場合は文字列の改行をBRタグに変換する時、linebreaksbrをフィルタとして指定するだけで良いのだが、laravelのnl2brの場合は下手するとXSSの脆弱性を生み出してしまう点にご注意。

## 今後のロードマップ

本記事でLaravelのチュートリアルを一通り解説した。だが、バリデーションが実装されていないため、文字数を超過した不適切なデータを送ると、思いっきりエラー文がブラウザに表示されてしまう。

他にも機能を追加してみたい人向けに、いくらかの関連記事をロードマップとして紹介する。

### Laravelの全体像を知る

Laravelのコンポーネントごとの役割を知っておけば、どこで何を書くのかがすぐにわかるだろう。

[Laravelの全体像、ファイル・ディレクトリごとの役割と関係性を俯瞰する](/post/laravel-overview/)


### ウェブアプリケーションフレームワークを勉強する上で必要な知識を手に入れる

データベースとは何か、ウェブサーバーとは？という状況の場合、知っておく知識が書かれてある。同時にフレームワーク開発における勉強方法なども掲載している

[ウェブアプリケーションフレームワークを使う前に知っておきたい知識【Django/Laravel/Rails】](/post/startup-web-application-framework/)


### エラーのログを確認する・ログにエラー文を出力させる

Laravelでは`php artisan serve`コマンドを実行してサーバーを立ち上げても、そこにはログは表示されない。これではどこでエラーが発生しているのかわかりにくいため、ログの確認と出力を行う。

[laravelで開発中、ログを表示させる【エラー箇所の確認・デバッグ作業に】](/post/laravel-log/)

### バリデーションを実装する

LaravelではRequestを使うことで投稿されたデータのバリデーションを行うことができる。

[【Request】Laravelでリクエストのバリデーションを行う【不適切なデータのチェックに】](/post/laravel-validate/)

### とりあえず、読み書き削除編集を全部試す

ウェブアプリ作成の基本となる読み書き削除編集(CRUDのこと)を実装して見たい場合は下記を参照。

[laravelでCRUD簡易掲示板を作る【Restful】](/post/laravel-crud-restful/)

### 1対多や多対多のリレーションを組む

トピックにカテゴリを指定したり、リプライを送るために必要な1対多、複数のタグを選ぶ多対多のリレーションの実装方法が書かれてある。

[Laravelで1対多、多対多のリレーションを作る【トピックに対してコメントの投稿、トピックタグの指定】](/post/laravel-m2m-foreignkey/)

### artisanコマンドについて知る

開発用サーバーを起動したり、マイグレーションファイルを作ったりするartisanコマンドは他にも色々できる。ルーティングの確認で全体を俯瞰したりする場合には知っておくと良いだろう。

[Laravelのartisanコマンドのまとめ【開発用サーバー立ち上げ、コントローラやマイグレーションファイル等の作成、ルーティングの確認などに】](/post/laravel-artisan-command/)

## ソースコード

準備中

