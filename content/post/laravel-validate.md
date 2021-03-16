---
title: "Laravelでリクエストのバリデーションを行う"
date: 2021-02-03T08:14:44+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","初心者向け","php" ]
---


コードは[Laravelで検索とページネーションを両立させる【ANDとOR検索も】](/post/laravel-search-paginate/)から流用している。現状では不適切な値(文字数オーバー、未入力等)をサーバーに送信すると、そのまま例外処理が発生する。バリデーションを実装させ、例外ではなく前のページにリダイレクトさせる。

対象はlaravel 7.x。

方法は主に2種類ある。コントローラー上にバリデーション処理を設置する方法、フォームリクエストを生成してバリデーションを行う方法の2つ。

## 方法1:コントローラー上にバリデーションを実装させる

値が間違っていれば、フォームを送信したページにリダイレクト、正しければDBに保存する処理をしたいのであれば、コントローラー上にバリデーションを実装させれば良い。

    public function store(Request $request)
    {   

        $validated  = $request->validate([
            'name' => 'required|max:15',
            'content' => 'required|max:2000',
        ]);

        \Log::debug("バリデーション結果");
        \Log::debug($validated);

        Topic::create($validated);

        return redirect(route("topics.index"));
    }

`$request->validate()`内に定義した`required`(入力必須)かつ`max`(最長文字数)に合致していれば、以後の処理を行う。合致していない場合、リダイレクトを行う。

ちなみに、バリデーションされたデータは`$validated`に配列として返ってくるので、そのまま`create()`メソッド内に引数として指定すれば良い。

ただし、このバリデーションの方法では、バリデーション項目が増えれば増えるほどコントローラが肥大化してしまう。そこで、フォームリクエストによるバリデーションを実装させる。

## 方法2:フォームリクエストによるバリデーション

まず、下記コマンドを実行し、フォームリクエストを作る。

    php artisan make:request CreateTopicRequest

`app/Http/Requests/CreateTopicRequest.php`が作られるので、これを下記のように編集する。

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
                'name' => 'required|max:15',
                'content' => 'required|max:2000',
            ];
        }   
    }

`authorize()`メソッドは認証状態をチェックし、認証OKであれば`true`を返し、認証NGであれば`false`を返す。初期状態では`false`になっているので、`true`に書き換える。

続いて、`rules()`メソッドの`return`にバリデーション項目と内容を記述する。`name`と`content`いずれも、前項で記述したものを流用している。

続いてコントローラに、上記のフォームリクエストを引数として与える。コントローラ冒頭の`use`文で`CreateTopicRequest`を記述し読み込むのを忘れなく。


    /* 省略 */

    use App\Http\Requests\CreateTopicRequest;

    /* 省略 */

    public function store(CreateTopicRequest $request)
    {

        \Log::debug("バリデーション結果");
        \Log::debug($request->all());

        Topic::create($request->all());

        return redirect(route("topics.index"));
    }

前項に比べコントローラの処理が大幅に軽減された。

さらに、フォームリクエストで定義したバリデーションに沿っていなければコントローラの処理は実行されないので、そのまま`$request->name`等の参照をしてもインデックスエラー等の問題は起こらない。

## エラーメッセージを表示させる

laravelには、バリデーションに失敗した場合、エラーメッセージをフロントに出力することができる。`resource/views/create.blade.php`(フォーム送信のビュー)の任意の場所に下記を追加する。

    @if( count($errors) )
    <ul>
        @foreach($errors->all() as $error)
        <li>{{ $error }}</li>
        @endforeach
    </ul>
    @endif

<div class="img-center"><img src="/images/Screenshot from 2021-02-03 10-44-51.png" alt="エラーメッセージが表示されている。"></div>

デフォルトでは、上記のように英語で表示される。エラーメッセージを日本語でカスタマイズしたい場合は、フォームリクエスト内に`message()`メソッドを記述してオーバーライドする。

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
                'name' => 'required|max:15',
                'content' => 'required|max:2000',
            ];
        }   
        public function messages() {
            return [
                'name.required'     => '名前を入力してください',
                'name.max'          => '名前は15文字でお願いします。',
                'content.required'  => 'コメントを入力してください',
                'content.max'       => 'コメントは2000文字でお願いします。',
            ];
        }
    }

<div class="img-center"><img src="/images/Screenshot from 2021-02-03 10-50-48.png" alt="エラーメッセージをカスタマイズして表示"></div>

カスタマイズされたエラーメッセージが表示された。

## 結論

フォームリクエストを実装させることで、コントローラを短く記述することができるだけでなく、リクエストで送信されたデータを直接参照(`$request->name`等)してもインデックスエラーを発生させること無く処理を行うことができる。

ただ、バリデーションエラーのメッセージ表示はサーバーに送信した後で表示させるよりも、`input`タグなどに`require`属性や`maxlength`属性を追加したりするなど、なるべくサーバーを経由しないでエラーメッセージを表示させるようにしたほうが、無駄リクエストが発生しなくて済むと思われる。

あくまでもフォームリクエストが行うことは、コントローラに繋げるための値のバリデーション。エラーメッセージの表示等はフロントに任せましょう。

使用可能なバリデーションルールなど、詳しいことは公式のドキュメントに書かれているので参考にしたい。

https://readouble.com/laravel/7.x/ja/validation.html




