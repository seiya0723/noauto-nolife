---
title: "laravelでAjax(jQuery)を送信する【POST+DELETE】"
date: 2021-02-04T12:29:32+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","ajax","jQuery","上級者向け" ]
---


タイトルの通り。laravelにAjax(jQuery)を送信する。コードは[Laravelでリクエストのバリデーションを行う](/post/laravel-validate/)を元に作られている。


## jQueryを読み込みCSRFトークンをAjax送信時に付せて送信させる

まずAjax送信用にjQueryを読み込ませる。それからPOSTリクエストの場合、CSRF対策用のトークンもセットで送信しなければならない。故に、`resources/views/base.blade.php`を編集する。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="csrf_token" content="{{ csrf_token() }}">
    	<title>@yield("page_subtitle")簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="{{ asset('/js/script.js') }}"></script>
    
        @yield("extra_head")
    
    </head>
    <body>
    
        <a href="{{ route('topics.index') }}"><h1 style="background:orange;color:white;text-align:center;">簡易掲示板</h1></a>
        <main class="container">@yield("main")</main>
    
    </body>
    </html>


下記は`script.js`がAjax送信時にCSRFトークンを送信させるためのものである。

    <meta name="csrf_token" content="{{ csrf_token() }}">

このCSRFトークンをAjax送信時に合わせて送信させるため、下記をscript.jsに含めている。

    //CSRFトークンをAjax送信時にセットで送信させる
    $.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf_token"]').attr('content') } });


## 投稿フォームをAjax仕様に、コンテンツを分離

`resources/views/index.blade.php`を下記のように編集する。

    @extends("base")
    
    @section("main")
    
    <form id="main_form" action="{{ route('topics.store') }}" method="POST" enctype="multipart/form-data">
        {{ csrf_field() }}
        <input class="form-control" type="text" name="name" placeholder="名前">
        <textarea id="" class="form-control" name="content" rows="4" placeholder="コメント"></textarea>
        <input type="file" name="img">
        <input class="form-control store" type="button" value="送信">
    </form>
    
    <form>
        @if( request()->query("option") )<input type="checkbox" name="option" checked>
        @else<input type="checkbox" name="option">
        @endif
        <input type="text" name="search" placeholder="ここにキーワードを入れる" value="{{ request()->query('search') }}">
        <input type="submit" value="キーワード検索">
    </form>
    
    <div id="main_content">
        @include("content")
    </div>
    
    @endsection


まず、送信ボタンの`type`属性を`submit`にしてしまうと、通常のHTTPリクエストが送信されてしまうため、`type="button"`に書き換える。JSのイベントハンドラを設定するため、ボタンに`.store`を新たに指定した。


分離した`content.blade.php`は下記。JSのイベントハンドラが動くように`.destroy`を指定。

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
            <button class="btn btn-outline-danger destroy" type="button" value="{{ $topic->id }}">削除</button>
        </form>
    </div>
    @empty
    <p>投稿はありません</p>
    @endforelse
    
    {{ $topics->appends(request()->input())->links() }}


## Ajaxをコントローラが受け取り、レスポンスを返す


`store`メソッドと`destroy`メソッドを書き換える。

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

        $query      = Topic::query();
        $topics     = $query->orderBy("created_at","desc")->paginate(3);
        $context    = [ "topics" => $topics ];

        $test       = view("content",$context);

        return view("content",$context);

    }

書き込み処理を行った上で、リダイレクトを返すのではなく、`content`のレンダリング結果を返している。このレンダリング結果を受け取ったJSがコンテンツの部分を書き換えすることで、部分的に再描画を行うことができているのだ。


続いてdestroyメソッドは下記。こちらも同様に削除処理を行った上で、`content`のレンダリング結果を返す。

    public function destroy(Request $request, $id)
    {

        \Log::debug($request);
        \Log::debug("削除処理をする。");

        $topic  = Topic::find($id);
        $topic->delete();

        $query      = Topic::query();
        $topics     = $query->orderBy("created_at","desc")->paginate(3);
        $context    = [ "topics" => $topics ];

        return view("content",$context);
    }


## レスポンス受け取り後の処理を書く

冒頭で説明した、CSRFトークンのセットの他に、イベントハンドラとAjax送信処理を記述している。

    window.addEventListener("load" , function (){
    
        $(document).on("click",".destroy", function() { destroy($(this).val()); });
        $(".store").on("click", function() { store(); });
    
        //CSRFトークンをAjax送信時にセットで送信させる
        $.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf_token"]').attr('content') } });
    
    });
    
    //削除処理
    function destroy(id){
    
        if (confirm("この投稿を削除しますか?")){
    
            $.ajax({
                url         : "/topics/" + id,
                type        : "POST",
                contentType : 'application/json; charset=utf-8',
                enctype     : "multipart/form-data",
                data        : JSON.stringify( { "id":id,"_method" : "DELETE" }) ,
            }).done( function(data, status, xhr ) { 
    
                $("#main_content").html(data);
    
            }).fail( function(xhr, status, error) {
                console.log(status + ":" + error );
            });
        }
    
    }
    //投稿処理
    function store(){
    
        var data = new FormData( $("#main_form").get(0) );
        
        $.ajax({
            url: "/topics",
            type: "POST",
            data: data,
            processData: false,
            contentType: false,
        }).done( function(data, status, xhr ) { 
    
            $("#main_content").html(data);
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        });
    
    }

`var data = new FormData( $("#main_form").get(0) );`とすれば、Ajaxで画像送信も問題なくできる。

## 結論

このコードを書いていて気になったのが、JSONで送信したAjaxリクエストを、なんの手続きも無しにそのままバリデーションを通し、コントローラでボディの参照ができる点である。laravelは裏で自動的にJSONを解析しているのだろうか？

それから、コントローラがviewメソッドを使用してレスポンスを返して問題なくJSが受け取れているこの状況はやや理解しがたいものがある。ページネーションのリンクにも問題があるので、このコードは修正が必要になるかも知れない。laravelは資料が限られているので、もう少し調査が必要である。

とは言え、ウェブアプリでAjaxの実装ができるだけで、リクエストレスポンスの処理がスムーズになり、部分的にページをレンダリングし直す形になるので、サーバーとクライアントを行き来するデータ量を大幅に削減できる。これは昨今のスマホ通信量制限などにも対応できるため、不特定多数のユーザーへサービスを展開する際には不可欠になるだろう。

