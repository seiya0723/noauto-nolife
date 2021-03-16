---
title: "laravelでCRUD簡易掲示板を作る【Restful】"
date: 2021-02-01T13:11:30+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","Restful","初心者向け","php" ]
---


リハビリがてらlaravelでCRUDに対応した簡易掲示板を作る。この記事の手順に沿ってやれば、45分もあれば作れる。

本記事ではlaravel 7.X系を使用している。


## 流れ

1. プロジェクトを作る
1. DBはSQliteを読み込むように設定する
1. Restful対応コントローラーを作る
1. ルーティングの設定
1. モデル定義とマイグレーション実行
1. ビューを作る
1. コントローラーの修正
1. タイムゾーンの修正


## プロジェクトを作る

    composer create-project --prefer-dist laravel/laravel laravel_crud_restful

コンポーザーコマンドを実行してプロジェクトを作る。

## DBはSQliteを読み込むように設定する

デフォルトではMySQLが設定されているので、SQLiteを使うようにする。まずは下記コマンドで`database.sqlite`ファイルを作る。このファイル名(database.sqlite)の通りに作らないと動かないので注意。

    touch ./database/database.sqlite

続いて、`.env`ファイルの9行目付近にあるMySQL設定を全てコメントアウト、SQLiteを読み出すよう設定する。

    # DB_CONNECTION=mysql
    # DB_HOST=127.0.0.1
    # DB_PORT=3306
    # DB_DATABASE=laravel
    # DB_USERNAME=root
    # DB_PASSWORD=
    DB_CONNECTION=sqlite

これでDBの準備は完了。

## Restful対応コントローラーを作る

`make:controller`コマンドを使用してコントローラーを作る。今回はRestfulに対応したコントローラーを作るため、`--resource`オプションを指定することを忘れなく。

    php artisan make:controller TopicsController --resource

## ルーティングの設定

`--resource`オプションで作ったコントローラーをルーティング設定する際には、下記一行を追加すれば良いだけ。

    Route::resource('/topics', 'TopicsController');

`resource()`メソッドを使用するだけでアクションとURIの対応付けをまとめてやってくれる。そのため`resource()`メソッドの第二引数に`@index`等のアクション名を指定する必要はない。

## モデル定義とマイグレーション実行

下記コマンドを実行して、`Topic`モデルを作る。`--migration`コマンドでマイグレーションファイルも同時に作る。

    php artisan make:model Topic --migration

まず、モデルの定義から。`apps/Topic.php`を下記のように編集する。

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Topic extends Model
    {
        protected $fillable = [
            "name","content"
        ];
    }


モデルの役割は、コントローラーがクライアントからデータを受け取った後、受け取ったデータをDBに入れてよいかどうかを決めること。上記のコードは`name`と`content`のみクライアントからの編集を許可する。それ以外のデータは受け取った時に全て破棄する。

続いて、マイグレーションファイルを編集する。`database/migrations/[タイムスタンプ]_create_topics_table.php`にテーブルのカラムと挿入するデータを記述する。`[タイムスタンプ]`はマイグレーションファイルを作った日時なので、適宜解釈するように。

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
                $table->string("content",200);
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


上記コードにより、topicsテーブルにオートインクリメント数値型の`id`、10文字までの`name`、200文字までの`content`。`timestamps()`で投稿日を意味する`created_at`、編集日を意味する`updated_at`の5つのカラムが作られる。

コード下の方に書かれてある`down()`メソッドはマイグレーションを元に戻すときのテーブル削除処理。そのままで良い。

定義したマイグレーションファイルに基づき、マイグレーションを実行する。

    php artisan migrate

## ビューを作る

Restful化に対応させるため、作る必要のあるビューが5つある。ただ、今回はテンプレートの継承機能を使うので、1ファイル当たりのコード行数は30行程度。

まず、`resource/views/base.blade.php`を作る。この`base`を継承して、残り4つのファイルを作る。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        @yield("extra_head")
    
    </head>
    <body>
        
        <a href="{{ route('topics.index') }}"><h1 style="background:orange;color:white;text-align:center;">簡易掲示板</h1></a>
        <main class="container">@yield("main")</main>
    
    </body>
    </html>

ディレクティブの`@yield([任意の文字列])`を記述することで、その部分は継承したビューが自由に内容を追加することができる。例えば、上記`base`を継承した`index`が`@yield("main")`の部分にトップページである旨を表示させることが可能になる。

`resource/views/index.blade.php`は下記のように記述する。

    @extends("base")
    
    @section("main")
    
    <a class="btn btn-outline-success"  href="{{ route('topics.create') }}">＋ トピックを作る</a>
    
    @forelse( $topics as $topic )
    <div class="border my-2 p-2">
        <div class="text-secondary">{{ $topic->name }} さん</div>
        <div class="p-2">{!! nl2br(e($topic->content)) !!}</div>
        <div class="text-secondary">投稿日:{{ $topic->created_at }}</div>
        <div class="text-secondary">編集日:{{ $topic->updated_at }}</div>
        <a class="btn btn-outline-primary" href="{{ route('topics.show',$topic->id) }}">詳細</a>
        <a class="btn btn-outline-success" href="{{ route('topics.edit',$topic->id) }}">編集</a>
        <form action="{{ route('topics.destroy',$topic->id) }}/" method="POST" style="display:inline-block;">
            {{ csrf_field() }}
            {{ method_field("delete") }}
            <button class="btn btn-outline-danger" type="submit">削除</button>
        </form>
    </div>
    @empty
    <p>投稿はありません</p>
    @endforelse
    
    @endsection
    
冒頭に、`@extends()`で継承元になる`base`を指定する。続いて、`@section()`に`main`を指定する。`base.blade.php`には`@yield("main")`と指定してある部分に当たる。つまり`main`タグの中に`@section("main")`から`@endsection`までの内容が入るのだ。

ちなみに、`@forelse()`以下はコントローラーが受け取った内容を全て記述している。この処理はまだ書いていないので次項にて解説する。

削除ボタンの`method_field("DELETE")`はフォーム送信時HTTPリクエストのDELETEメソッドを使用してリクエストを送る指定をしている。


続いて、`resource/views/create.blade.php`を作る。こちらも`base`を継承して作っている。

    @extends("base")
    
    @section("main")

    <form class="" action="{{ route('topics.store') }}" method="POST">
        {{ csrf_field() }}
        <input class="form-control" type="text" name="name" placeholder="名前">
        <textarea id="" class="form-control" name="content" rows="4" placeholder="コメント"></textarea>
        <input class="form-control" type="submit" value="送信">
    </form>
    @endsection

`create`は新しいトピックを作るフォーム。`input`タグ等の`name`属性はマイグレーションフィールドで定義したカラムに基づいている。


続いて、`resource/views/show.blade.php`を作る。こちらも`base`を継承して作っている。

    @extends("base")
    
    @section("main")
    
    @forelse($topics as $topic )
    <div class="border my-2 p-2">
        <div class="text-secondary">{{ $topic->name }} さん</div>
        <div class="p-2">{!! nl2br(e($topic->content)) !!}</div>
        <div class="text-secondary">投稿日:{{ $topic->created_at }}</div>
    </div>
    @empty
    <p>ありません。</p>
    @endforelse
    
    @endsection

`show`は個別ページを表示する。

続いて、`resource/views/edit.blade.php`を作る。こちらも`base`を継承して作っている。

    @extends("base")
    
    @section("main")
    
    @forelse($topics as $topic )
    <form action="{{ route('topics.update',$topic->id) }}" method="POST">
        {{ csrf_field() }}
        {{ method_field("put") }}
        <input class="form-control" type="text" name="name" placeholder="名前" value="{{ $topic->name }}">
        <textarea id="" class="form-control" name="content" rows="4" placeholder="コメント">{{ $topic->content }}</textarea>
        <input class="form-control" type="submit" value="送信">
    </form>
    @empty
    <p>ありません。</p>
    @endforelse
    
    @endsection

その名の通り、編集用のフォーム。`method_field("PUT")`はフォーム送信時HTTPリクエストのPUTメソッドを使用してリクエストを送る指定をしている。

これで一通りのビューは完成した。後はこのビューに値を入れるコントローラーを修正していく。

## コントローラーの修正

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use App\Topic;

    class TopicsController extends Controller
    {
        public function index()
        {
            $topics     = Topic::latest()->get();
            $context    = [ "topics" => $topics ];

            return view("index",$context);
        }
        public function create()
        {
            return view("create");
        }
        public function store(Request $request)
        {
            Topic::create($request->all());

            return redirect(route("topics.index"));
        }
        public function show($id)
        {
            $topics     = Topic::where("id",$id)->get();
            $context    = [ "topics" => $topics ];

            return view("show",$context);
        }
        public function edit($id)
        {
            $topics     = Topic::where("id",$id)->get();
            $context    = [ "topics" => $topics ];

            return view("edit",$context);
        }
        public function update(Request $request, $id)
        {
            $topic  = Topic::find($id);
            $topic->name    = $request->name;
            $topic->content = $request->content;
            $topic->save();

            return redirect(route("topics.index"));
        }
        public function destroy($id)
        {
            $topic  = Topic::find($id);
            $topic->delete();

            return redirect(route("topics.index"));
        }
    }


長いのでそれぞれの処理内容は省略し、共通するものだけ解説する。

`Topic::latest()->get();`はDBからデータを全て抜き取り、最新が上になるように並び替える。間に`where()`メソッドが入ることで、絞り込みができる。`find()`メソッドに`$id`を指定することで一意に特定もできる。

`Topic::create($request->all());`はリクエストとして受け取ったデータを全て`create()`メソッドに入れる。これで指定した内容でトピックを作ることができる。

モデルのメソッドには、`save()`メソッド、`delete()`メソッドが用意されている。それぞれ、指定した値でデータを保存、削除することができる。


`route("topics.index")`は名前解決によって、`topics`を意味する。`route/web.php`に定義した内容に基づいている。`Route::resource("/topics", "TopicsController");`のみだが、`resource()`メソッドにより、下記の名前とURIが対応付けられているのだ。

    +--------+-----------+---------------------+----------------+-----------------------------------------------+------------+
    | Domain | Method    | URI                 | Name           | Action                                        | Middleware |
    +--------+-----------+---------------------+----------------+-----------------------------------------------+------------+
    |        | GET|HEAD  | /                   |                | Closure                                       | web        |
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

つまり、`Route("topics.index")`は`topics`を返し、`Route("topics.create")`は`topics/create`を返すのだ。`{topic}`は引数になっており、ここには数値が入る。この引数指定により、ビューにて、`{{ route('topics.show',$topic->id) }}`と指定して、idに応じたパスを返すことができる。

## タイムゾーンの修正


最後に、日付の問題を解決するため、`config/app.php`のタイムゾーンを修正する。

    'timezone' => 'Asia/Tokyo',

これで日本に設定できた。



## 実際に動かしてみる

開発用サーバーを起動する。

    php artisan serve

<div class="img-center"><img src="/images/Screenshot from 2021-02-01 15-18-36.png" alt="簡易掲示板"></div>

編集したら編集日時が記録されるようになっている。

## 結論

laravelには『Web職人のためのフレームワーク』というキャッチコピーがあるが、調べれば調べるほど開発メソッドの選択肢が多く存在する。初学者からしてみれば選択肢の多さは、学習進捗に関わるので、ベストプラクティスのようなものがあると良いのだが。

とは言え、Djangoよりも自由度が高く、編集と作成の日時がまとめて指定できる`timestamps()`は良いと思った。

だが、timestamp型はデプロイするときにMySQLを使うと[2038年問題](https://ja.wikipedia.org/wiki/2038%E5%B9%B4%E5%95%8F%E9%A1%8C)を引き起こしてしまう。Laravelのデプロイ時にはDBはMySQLではなく、PostgreSQLを使いましょう。

