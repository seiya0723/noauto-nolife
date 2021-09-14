---
title: "Laravelで1対多、多対多のリレーションを作る"
date: 2021-04-13T18:14:38+09:00
draft: true
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","上級者向け" ]
---

1対多、多対多のリレーションのウェブアプリのサンプルを作りつつ、方法を解説する。

## 状況

元にして作るアプリの状況を解説する

## 1対多のリレーションを作る

Topicに対して、Commentを投稿できるようにする。まずは、Commentのモデルとマイグレーションファイルを作る

    php artisan make:model Comment --migration

`app/Topic.php`、Topicのモデルを書き換える。

    <?php
    
    namespace App;
    
    #use Illuminate\Database\Eloquent\Model;
    use GoldSpecDigital\LaravelEloquentUUID\Database\Eloquent\Model;
    
    class Topic extends Model
    {
         protected $fillable = [ "name","content" ];
    
         public function comments()
         {
             return $this->hasMany("App\Comment");
         }
    
    }

つまり、TopicはCommentを複数持つ関係にある。

`app/Comment.php`、Commentのモデルを書き換える。

    <?php
    
    namespace App;
    
    #use Illuminate\Database\Eloquent\Model;
    use GoldSpecDigital\LaravelEloquentUUID\Database\Eloquent\Model;
    
    
    class Comment extends Model
    {
         protected $fillable = [ "name","content","topic_id" ];
    
         public function topic()
         {
             return $this->belongsTo("App\Topic");
         }
    }

つまり、CommentはひとつのTopicに所属する。これで1対多の関係になった。


`XXXX_XX_XX_XXXXXX_create_comments_table.php`、Commentのマイグレーションファイルを書き換える。

    <?php
    
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    
    class CreateCommentsTable extends Migration
    {
        /** 
         * Run the migrations.
         *
         * @return void
         */
        public function up()
        {   
            Schema::create('comments', function (Blueprint $table) {
                $table->uuid("id")->primary();
                $table->string("name",15);
                $table->string("content",2000);
                $table->uuid("topic_id");
                $table->foreign("topic_id")->references("id")->on("topics")->onDelete("cascade")->onUpdate("cascade");
    
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
            Schema::dropIfExists('comments');
        }   
    }

注意するべきは、`uuid("topic_id")`に対して、外部キー制約の`foreign("topic_id")`とすること。外部キー制約の`foreign()`が無い場合、トピックが削除された時、そのトピックに投稿されたコメントがDBに置き去りになる。結果、どこからも参照されないコメントのレコードが溜まっていき、DBがパンクする。

トピックが削除された時、コメントも同時に削除してほしいのであれば、外部キー制約の`foreign()`に`onDelete("cascade")`とする。これで、トピックが削除された時、同時にコメントまで削除される。

この外部キー制約とは`topics`テーブルと`comments`テーブルが外部キー(`topic_id`)で紐付いている事をDB構築時に設定するものである。


この状態でマイグレーション実行。

    php artisan migrate

`app/Http/Controller/TopicsController.php`を編集。showアクションにComment一覧の参照処理を追加、Commentへの投稿を受け入れる`comment`アクションを用意する。ルーティングにもアクションのパスを通す。


    public function show($id)
    {
        #TODO:ここ単数で返すべきでは？
        $topic      = Topic::where("id",$id)->first();

        #ここでコメントされている内容を抜き取る
        $comments   = Comment::where("topic_id",$id)->orderBy("created_at","desc")->get();

        $context    = [ "topic" => $topic,
                        "comments" => $comments
                     ];

        return view("show",$context);
    }
    public function comment(CreateTopicRequest $request, $id)
    {

        $comment  = new Comment;

        $comment->name      = $request->name;
        $comment->content   = $request->content;
        $comment->topic_id  = $id;
        $comment->save();

        \Log::debug("投稿完了");

        return redirect(route("topics.show",$id));

    }

`resources/views/show.blade.php`にフォームと表示欄を作る。

    @extends("base")
    
    @section("main")
    
    <div class="border my-2 p-2">
        <div class="text-secondary">{{ $topic->name }} さん</div>
        <div class="p-2">{!! nl2br(e($topic->content)) !!}</div>
        <div class="text-secondary">投稿日:{{ $topic->created_at }}</div>
    </div>
    
    <h2>コメント投稿</h2>
    
    <form action="" method="POST">
    {{ csrf_field() }}
    <input type="text" name="name" placeholder="名前">
    <textarea class="form-control" name="content" placeholder="コメント"></textarea>
    <input class="form-control" type="submit" value="送信">
    </form>
    
    <h2>投稿されたコメント</h2>
    
    @forelse($comments as $comment )
    <div class="border my-2 p-2">
        <div class="text-secondary">{{ $comment->name }} さん</div>
        <div class="p-2">{!! nl2br(e($comment->content)) !!}</div>
        <div class="text-secondary">投稿日:{{ $comment->created_at }}</div>
    </div>
    @empty
    <p>まだコメントはありません</p>
    @endforelse
    
    @endsection

これで、1対多のリレーションを作ることができた。

<div class="img-center"><img src="/images/Screenshot from 2021-04-21 08-07-14.png" alt="コメントの投稿ができている"></div>

## 多対多のリレーションを作る







## 結論

投稿するコンテンツにカテゴリを指定したり、タグを追加したりするなど、1対多もしくは多対多のリレーションのウェブアプリは割と多い。

本格的に開発を始めたいのであれば覚えておきたいところだ。


## ソースコード

- 1対多:
- 多対多:



