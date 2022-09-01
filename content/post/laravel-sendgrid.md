---
title: "LaravelでSendgridを使ってメール送信【認証・通知に、ライブラリのインストールは不要】"
date: 2021-12-08T16:42:22+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","sendgrid","システム管理" ]
---

特別なライブラリなどは必要ない。

## 流れ

1. .envにてAPIキーなどを設定
1. make:mailコマンドでメールの雛形一式を作る
1. メールのモデルを作る
1. メールのテンプレートを作る
1. 送信処理を実行する


## .envにてAPIキーなどを設定

まず、.envにてSendgridで手に入れたAPIキー等の情報を格納

    MAIL_MAILER=smtp
    MAIL_HOST=smtp.sendgrid.net
    MAIL_PORT=587
    MAIL_USERNAME=apikey
    MAIL_PASSWORD=[ここにSendgridで手に入れたAPIキーを記録する]
    MAIL_ENCRYPTION=tls
    MAIL_FROM_ADDRESS=[ここに送信元のメールアドレスを指定する]
    MAIL_FROM_NAME="${APP_NAME}"

APIキーは文字列型ではないので、ダブルクオーテーションなどで囲まないようにする。


## make:mailコマンドでメールの雛形一式を作る

下記コマンドを実行し、メール送信に必要なモデルとテンプレートのファイル一式を生成する。

    php artisan make:mail TestEmail

TestEmailの部分はお好みで。以降はTestEmailを実行したとして、解説を続行する。

## メールのモデルを作る

Sendgrid公式から拝借。一部編集している。

    <?php
    
    namespace App\Mail;
    
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Queue\SerializesModels;
    use Illuminate\Contracts\Queue\ShouldQueue;
    
    class TestEmail extends Mailable
    {
        use Queueable, SerializesModels;
    
        public $data;
    
        public function __construct($data)
        {
            $this->data = $data;
        }
    
        public function build()
        {
            $address = ''; #←ここに送信元のアドレスを書く
            $subject = ''; #←ここに件名を書く
            $name = ''; #←ここに送信元の名前を書く
    
            return $this->view('emails.test')
                        ->from($address, $name)
                        ->cc($address, $name)
                        ->bcc($address, $name)
                        ->replyTo($address, $name)
                        ->subject($subject)
                        ->with([ 'test_message' => $this->data['message'] ]);
        }
    }

これは`resources/views/emails/`の中にある`test.blade.php`をメールのテンプレートとして送信元やCC、BCCを指定している。

メールの本文は`test.blade.php`の中に書かれてあるが、変数を引き渡すことで、内容を実行時に自由に変更する事ができる。

## メールのテンプレートを作る

`resources/views/emails/test.blade.php`を作る。これがメールの本文。

    <!DOCTYPE html>
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <h2>Test Email</h2>
        <p>{{ $test_message }}</p>
      </body>
    </html>

公式から丸ごと流用した。これが送信を実行した時、本文になる。


## 送信処理を実行する

送信処理を実行したいコントローラにて、下記を記入。


    use Illuminate\Support\Facades\Mail;
    use App\Mail\TestEmail;

    /* 省略 */


        $data = ['message' => 'この内容がTest Emailの下のpタグに書かれる'];
        Mail::to('[ここに送信先のメールアドレスを指定]')->send(new TestEmail($data));


例えば、indexなどに送信処理を設置すれば、アクセスしただけでメールが送信される。

公式には掲載されていなかった

    use Illuminate\Support\Facades\Mail;

このファサードのuseをお忘れなく。


## 実際に動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2021-12-08 18-18-53.png" alt=""></div>


## 結論

このようにSendgridを使えば、Laravelでもメール送信ができる。認証や通知等に有効に使いたいところだ。

## 参照元

公式に少し書き加えた。

https://docs.sendgrid.com/for-developers/sending-email/laravel#adding-a-category-or-custom-field


