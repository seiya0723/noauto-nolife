---
title: "Laravelで検索とページネーションを両立させる【ANDとOR検索も】"
date: 2021-02-02T13:48:05+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","tips","初心者向け" ]
---


タイトルの通り。laravelにてAND検索とOR検索を実装させつつ、ページネーションも両立させる。コードは[laravelでCRUD簡易掲示板を作る【Restful】](/post/laravel-crud-restful/)から流用している。

## まずはAND検索とOR検索を実装させる

流れ的には、スペース区切りのキーワードを送信させ、それをコントロール側で区切り、クエリをビルドする。クエリをビルドする時、AND検索指定であれば、`where()`の追加、OR検索指定であれば`orwhere()`の追加を行う。


    public function index(Request $request)
    {   
        $data           = $request->all();
        $query          = Topic::query();
    
        if ( array_key_exists('search',$data) ){

            #TIPS:半角、全角スペース、改行、タブ、ノーブレークスペース等を元に配列化させる。空白のみの場合空配列を返す。
            $search_list    = preg_split('/[\p{Z}\p{Cc}]++/u', $data["search"], -1, PREG_SPLIT_NO_EMPTY);

            //空配列(スペースのみ)の場合はリダイレクト
            if ( $search_list == [] ){
                return redirect(route("topics.index"));
            }

            #option指定なし→ AND検索、あり→ OR検索
            if ( array_key_exists('option',$data) ){
                foreach( $search_list as $search ){
                    $query->orwhere("content","LIKE","%{$search}%");
                }   
            }
            else{
                foreach( $search_list as $search ){
                    $query->where("content", "LIKE","%{$search}%");
                }   
            }
        }

        #TIPS:orderByを使用すればソートをもっと細かくできる。
        $topics     = $query->orderBy("created_at","desc")->get();
        $context    = [ "topics" => $topics ];

        return view("index",$context);
    }

半角スペースの他に全角スペース、その他タブや改行などを正規表現で検知して配列を返すようにしている。これは[qiita記事](https://qiita.com/mpyw/items/a704cb900dfda0fc0331)からの受け売り。


空配列の場合(スペースだけ)はリダイレクトさせる。このようにアーリーリターンを徹底させれば無駄ネストを軽減できる。

optionのチェックボックスの指定がされている場合、OR検索をする。そうでない場合はAND検索。`LIKE`オペレータと`%`を使うことで`$search`を含む文字列を検索できる。これがないと完全一致になってしまうため注意。


続いてビューの処理。

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

`request()`オブジェクトからクエリストリングを抜き取り、検索キーワードを入力する`input`タグの`value`属性に指定している。

    <input type="text" name="search" placeholder="ここにキーワードを入れる" value="{{ request()->query('search') }}">

コントローラーでクエリストリングの値を変数(`$context`)に入れて、ビューでレンダリングすることもできるが、`request()`オブジェクトを参照するほうが手間がかからない。


## ページネーションを実装させる

ページネーションの実装は検索と違ってとても簡単。コントローラーからクエリを実行する時、`->paginate()`を付け加えるだけ。

    $topics     = $query->orderBy("created_at","desc")->paginate(3);

後は、ビューの任意の場所に下記を記述する。

    {{ $topics->links() }}


## 検索とページネーションを両立させる

`link()`メソッドを実行する前、リクエストのパラメータを追加すれば良いだけ。

    {{ $topics->appends(request()->input())->links() }}

たったこれだけで検索とページネーションを両立できる。検索以外の他パラメータもまとめて渡せるのでとても便利。


<div class="img-center"><img src="/images/Screenshot from 2021-02-02 14-18-31.png" alt="検索とページネーションの両立"></div>


## 結論

Djangoと違ってlaravelでは検索とページネーションの両立がとても簡単。Djangoの場合は自前でカスタムテンプレートタグを用意する必要があるが、laravelはする必要はない。

しかもページネーションのメソッドが用意されてあるので、1行でページネーションが実装できる。Bootstrapに対応しているので装飾の必要もない。

さらに、laravelは検索すればかなりの情報が手に入るので、Djangoと違って公式情報が全てとは限らない。構造上簡単なのはDjangoであるが、情報の多さで考えればlaravelに軍配が上がるだろう。


クエリビルダ関係は公式を読めばよくわかる。https://readouble.com/laravel/7.x/ja/queries.html

