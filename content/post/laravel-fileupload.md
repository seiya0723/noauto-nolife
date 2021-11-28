---
title: "Laravelで画像とファイルをアップロードする"
date: 2021-02-01T14:28:58+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","初心者向け","tips" ]
---


タイトルの通り。単にアップロードするだけでなく、MIME属性に基づいたファイルのバリデーションを行い、セキュリティにも配慮する。

なお、本記事は[Laravelで検索とページネーションを両立させる【ANDとOR検索も】](/post/laravel-search-paginate/)からコードを流用している。

## 流れ

1. テーブルに画像パス格納用カラムを追加してマイグレーション
1. モデルに画像パス格納用カラムの名前を追加する
1. バリデーション用のフォームリクエストを定義する
1. コントローラにて値を保存する
1. ビューでフォームと画像を表示させる
1. 公開ディレクトリに画像ディレクトリへのシンボリックリンクを貼り付ける


## テーブルに画像パス格納用カラムを追加してマイグレーション


まず、下記コマンドを実行して、マイグレーションファイルを作る。テーブル名topicsを対象としたマイグレーションファイルである。

    php artisan make:migration add_img_to_topics_table --table=topics

生成されたマイグレーションファイル( `database/migrations/[タイムスタンプ]_add_img_to_topics_table.php` )を下記のように修正。画像のアップロードは必須ではなく、既にデータが格納されている場合、マイグレーション後にNULLになってしまうので、デフォルト値を指定する。デフォルト値は空文字列(`""`)で指定。

    <?php
    
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    
    class AddImgToTopicsTable extends Migration
    {
        /** 
         * Run the migrations.
         *
         * @return void
         */
        public function up()
        {   
            Schema::table('topics', function (Blueprint $table) {
                $table->string("img")->default("");
            });
        }   
    
        /** 
         * Reverse the migrations.
         *
         * @return void
         */
        public function down()
        {   
            Schema::table('topics', function (Blueprint $table) {
                $table->dropColumn('img');
            });
        }   
    }

このように画像保存用のカラムは文字列型(string)で良い。マイグレーション実行。

    php artisan migrate

これでDB側の準備は完了。


## モデルに画像パス格納用カラムの名前を追加する

コントローラがリクエストを参照できるように、先程マイグレーション時に定義した画像パス格納用カラム名(`img`)を追加する。

`app/Topic.php`を編集する。

    <?php
    
    namespace App;
    
    use Illuminate\Database\Eloquent\Model;
    
    class Topic extends Model
    {
         protected $fillable = [ "name","content","img" ];
    }


## バリデーション用のフォームリクエストを定義する

フォームリクエストを生成し、バリデーションを行う。不適切なファイルのアップロードを許さないために行う。

    php artisan make:request CreateTopicRequest

生成されたフォームリクエスト( `app/Http/Requests/CreateTopicRequest.php` )を下記のように編集する。

    <?php
    
    namespace App\Http\Requests;
    
    use Illuminate\Foundation\Http\FormRequest;
    
    class CreateTopicRequest extends FormRequest
    {
        /** 
         * Determine if the user is authorized to make this request.
         *
         * @return bool
         */
        public function authorize()
        {   
            #↓ trueに書き換える
            return true;
        }   
    
        /** 
         * Get the validation rules that apply to the request.
         *
         * @return array
         */
        public function rules()
        {   
            return [
                'name'      => 'required|max:15',
                'content'   => 'required|max:2000',
                'img'       => 'file|image|mimes:jpg,png',
            ];
        }   
    }

`file`はアップロードされたファイルを、`image`は画像を、`mimes`はMIME属性を指定している。拡張子を指定することも可能だが、拡張子を偽造したファイル(`.txt`を`.png`に書き換えて送信など)もあるので、ファイルのMIME属性を参照し、バリデーションを行うほうが安全である。

## コントローラにて値を保存する

先程生成したフォームリクエスト(`CreateTopicRequest`クラス)をメソッドの引数として与え、バリデーションをした上でコントローラの処理を行う。

    /* 省略 */

    use App\Http\Requests\CreateTopicRequest;

    /* 省略 */

    public function store(CreateTopicRequest $request)
    {   
        $topic          = new Topic();
        $topic->name    = $request->name;
        $topic->content = $request->content;

        if ( $request->file("img") !== null ){
            $filename   = $request->file("img")->store("public/topics");
            $topic->img = basename($filename);

            \Log::debug(basename($filename));
            \Log::debug("画像セットOK");
        }
        else{
            $topic->img = ""; 
            \Log::debug("画像はありません");
        }

        \Log::debug($topic);
        $topic->save();

        return redirect(route("topics.index"));
    }

まず、モデルオブジェクト(`$topic`)を作る。`$topic->name`及び`$topic->content`にはバリデーションされた名前とコメントが入る。

続いて、`$request->file("img")`が`null`ではない場合。即ち、画像がアップロードされている場合画像の保存処理をする。`store()`メソッドは指定した引数の場所にファイルを保存することができる。ファイル名は保存する時にランダムな文字列を指定してくれるので重複の心配は無い。画像保存の後、保存先のパスが返ってくるので、`$filename`に入れる。そのファイル名(`basename($filename)`)を`$topic->img`に入れる。

このように、コントローラでは画像を保存するため、これまでのように単に値をDBに記録するだけのモデルのファサード(`Topic::create($request->all())`)を使うことはできない点に注意。

### 最適解

allメソッドを使用することで、カラムが増えていったとしても対処できる。下記コードは先ほどのコントローラと等価。

    /* 省略 */

    use App\Http\Requests\CreateTopicRequest;

    /* 省略 */

    public function store(CreateTopicRequest $request)
    {   
        #リクエストを使ってバリデーションデータを全て入れる
        $topic          = new Topic($request->all());

        #画像があればストレージへ保存処理を行う。保存したファイルパスも記録する。
        if ( $request->file("img") !== null ){
            $topic->img = basename($request->file("img")->store("public/topics"));
        }

        #DBの保存処理
        \Log::debug($topic);
        $topic->save();

        return redirect(route("topics.index"));
    }

これでモデルのカラムが増えていったとしても対処できる。保存場所は予め定数として定義しておくのが無難と思われる。

## ビューでフォームと画像を表示させる

まずはフォーム側から。`resources/views/create.blade.php`を下記のように編集する。

    @extends("base")
    
    @section("main")
    
    @if( count($errors) )
    <ul>
        @foreach($errors->all() as $error)
        <li>{{ $error }}</li>
        @endforeach
    </ul>
    @endif
    
    <form action="{{ route('topics.store') }}" method="POST" enctype="multipart/form-data">
        {{ csrf_field() }}
        <input class="form-control" type="text" name="name" placeholder="名前">
        <textarea class="form-control" name="content" rows="4" placeholder="コメント"></textarea>
        <input type="file" name="img">
        <input class="form-control" type="submit" value="送信">
    </form>
    @endsection

まず、`form`タグに`enctype="multipart/form-data"`を指定する。これがないとファイルのアップロードができないためだ。続いて、マイグレーションファイルで定義した`img`を`name`属性に指定する

次に、一覧表示にてアップロードした画像を表示させる。`resources/views/index.blade.php`を下記のように編集する。

    @extends("base")
    
    @section("main")
    
    <a class="btn btn-outline-success"  href="{{ route('topics.create') }}">＋ トピックを作る</a>
    
    <form action="">
        @if( request()->query("option") )<input type="checkbox" name="option" checked>
        @else<input type="checkbox" name="option">
        @endif
        <input type="text" name="search" placeholder="ここにキーワードを入れる" value="{{ request()->query('search') }}">
        <input type="submit" value="キーワード検索">
    </form>
    
    
    @forelse( $topics as $topic )
    <div class="border my-2 p-2">
        <div class="text-secondary">{{ $topic->name }} さん</div>
        <div class="p-2">{!! nl2br(e($topic->content)) !!}</div>
        @if( $topic->img )
        <div class="text-center"><img class="img-fluid" src="{{ asset('storage/topics/' . $topic->img) }}" alt="画像"></div>
        @endif
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
    
    {{ $topics->appends(request()->input())->links() }}
    
    @endsection


重要なのは画像を送信するパスの指定。

    @if( $topic->img )
    <div class="text-center"><img class="img-fluid" src="{{ asset('storage/topics/' . $topic->img) }}" alt="画像"></div>
    @endif


前項で画像の保存先は`public/topics`と指定したが、`img`タグの`src`属性をみてみると、`{{ asset('storage/topics/' . $topic->img) }}`と指定されている。つまり、パスは`/storage/topics/[ファイル名]`となる。開発者が用意したデータと、サーバーが保存する画像の保存先を切り分けている。

この画像公開先のパスが違う問題は、次項でシンボリックリンクを貼り付けることで、対処する。

## 公開ディレクトリに画像ディレクトリへのシンボリックリンクを貼り付ける

最後に、画像を保存しているディレクトリと公開ディレクトリを紐付けるため、シンボリックリンク(ショートカットのこと)を作る。下記コマンドを実行する。

    php artisan storage:link

これで画像の送信と表示が実装できた。

<div class="img-center"><img src="/images/Screenshot from 2021-02-04 10-14-52.png" alt="画像の表示ができた"></div>

## 結論

laravelで画像アップロード機能の実装で注意しなければならないのは

1. マイグレーションファイルにデフォルト値(空文字列)を指定する
1. 画像ファイルであることをチェックするバリデーション
1. `enctype="multipart/form-data"`をフォームタグに指定
1. `php artisan storage:link`を実行してのシンボリックリンクの設置

この4つぐらいだろう。特にバリデーションをしないままのデータ保存は危険。きちんと`mimes`を指定して送信できるファイルの種類を狭めておくのが定石である。`enctype="multipart/form-data"`に関しては、ファイルをアップロードするときには、Ajaxでもない限り、どんな言語やフレームワークであっても必ず指定するので覚えておいたほうが良い。

他にも、このコントローラのままだと、トピックが削除された時、編集された時に画像が置き去りになってしまうので、同時に削除される仕組みみたいなものを用意しないと、サーバのストレージが無駄に圧迫されてしまう。

ちなみに、シンボリックリンクは絶対パスで生成されるものなので、プロジェクトのディレクトリを動かした時は、貼り直す必要がある点に注意。(例えば、プロジェクトのディレクトリをコピーして別の場所で画像送信試すと、リンクが正しく読み取れず、画像が表示されないことがある。こういうときはシンボリックリンクを一旦削除して、再度`php artisan storage:link`を実行して貼り直す。)

