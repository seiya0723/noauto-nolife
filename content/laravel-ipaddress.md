---
title: "【Laravel】IPアドレスを取得して、DBへ記録する【犯罪・不正利用の抑止、荒らし対策などに】"
date: 2021-11-24T07:08:50+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","セキュリティ","システム管理" ]
---

クライアントのIPアドレスを記録できれば、認証が無くても犯罪行為の抑止につながるし、事案が発生してもすぐに対応できるだろう。

本記事ではLaravelにクライアントのIPアドレスを記録する方法を解説する。

コードは『[初心者でもlaravelを使い、45分でCRUD簡易掲示板を作る【Restful対応】](/post/laravel-crud-restful/)』から流用している。

## IPアドレスのカラムを追加(モデル編集とマイグレーションファイル作成)

まずマイグレーションファイルを追加する。

    php artisan make:migration add_ipaddress --table=topics

生成されるマイグレーションファイル(`database/migrations/XXXX_XX_XX_XXXXXX_add_ipaddress.php`)に下記を記入。

    <?php
    
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    
    class AddIpaddress extends Migration
    {
        /**
         * Run the migrations.
         *
         * @return void
         */
        public function up()
        {
            Schema::table('topics', function (Blueprint $table) {
                $table->ipAddress("ip")->default("0.0.0.0");
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
                //
            });
        }
    }

IPアドレスを記録するので、`ipAddress()`を指定。後から追加するカラムなので、デフォルトを指定しておく。

これをマイグレーションする。

    php artisan migrate 

モデル(`/app/Topic.php`)も書き換える。これを忘れてしまうとIPアドレスは記録されず、常にバリデーションエラーになってしまう。

    <?php
    
    namespace App;
    
    use Illuminate\Database\Eloquent\Model;
    
    class Topic extends Model
    {
        protected $fillable = [
            "name","content","ip"
        ];
    }

これでDB側は準備OK、続いて投稿する時にIPアドレスをセットする機能部を書く。

## Requestで事前にIPアドレスをセットした上でバリデーションをする

投稿されたコメントをバリデーションする前に、サーバーが取得したクライアントのIPアドレスをセットし、コメントと一緒にバリデーションさせる必要がある。

そこで、出てくるのが、`Request`の`prepareForValidation()`バリデーションをする前に、指定したクライアントから送られたデータを書き換えたり、追加したりする事ができる。


    <?php
    
    namespace App\Http\Requests;
    
    use Illuminate\Foundation\Http\FormRequest;
    
    class CreateTopicRequest extends FormRequest
    {
        public function authorize()
        {
            return true;
        }
    
        public function rules()
        {
            return [
                'name'      => 'required|max:15',
                'content'   => 'required|max:2000',
                'ip'        => 'required',
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
    
    
    
        public function getIp(){
            foreach (array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR') as $key){
                if (array_key_exists($key, $_SERVER) === true){
                    foreach (explode(',', $_SERVER[$key]) as $ip){
                        $ip = trim($ip); // just to be safe
                        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false){
                            return $ip;
                        }
                    }
                }
            }
            return request()->ip(); // it will return server ip when no client ip found
        }
    
        #IPアドレスを入れる
        protected function prepareForValidation()
        {
            $this->merge([
                "ip" => $this->getIp(),
            ]);
        }
    
    
    
    }






IPアドレスの取得に関しては、[Stackoverflowからそのままコードを流用](https://stackoverflow.com/questions/33268683/how-to-get-client-ip-address-in-laravel-5)させていただいた。Laravel 5.x系以降であれば問題なく動作する模様。

デプロイ先のサーバーがプロキシサーバーなどを使っていたとしても、クライアントのIPアドレスを取得する事ができるので、どんな環境であってもこれでOK。

後は、取得したIPアドレスを`prepareForValidation()`でバリデーション前にセットし、バリデーションさせ、コントローラで保存する。

## 動かすとこうなる

ビューで表示するように仕立てておけば、こんなふうになる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-25 11-52-08.png" alt=""></div>

黒塗りしているが、確認くんで出てきたIPアドレスと同じものが表示されている。成功だ。

Herokuにデプロイしたが、これで問題なくIPアドレスが取得できる。

## 結論

このIPアドレスの記録と表示によって、犯罪行為や迷惑行為の抑止につながるだろう。そもそも事案が起きにくくなるので、法的手続きなどの管理の手間の削減も期待できる。

バリデーション前に何らかのデータをセットする事はよくあることなので、覚えておくと何かと役に立つだろう。

参照元:https://stackoverflow.com/questions/33268683/how-to-get-client-ip-address-in-laravel-5

