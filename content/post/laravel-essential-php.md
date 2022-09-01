---
title: "Laravelに必要なPHP構文【if,for,function,class,型変換、配列操作など】"
date: 2021-11-13T17:46:27+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","php","初心者向け" ]
---

Laravelはフレームワークである。すでにコードが書かれており、それを読みながら追記していく必要がある。

そのため、Laravelによく出るPHP構文を知っておくと開発がスムーズに進む。本記事ではLaravelに必要なPHP構文をまとめて解説する。

## if

基本のif文。ブーリアン型の判定が主である。

    <?php
    
    $flag   = True;
    
    if ($flag){
        echo "True!!";
    }
    else{
        echo "False!!";
    }

Laravel実践では、コントローラがクライアントから受け取った値が存在するかチェックしたりする時に使う。

## foreach( $A as $B )

イテラブルな要素を抜き取る。普通のforよりもforeachのほうがよく使うだろう。

    <?php
    
    $messages   = [ "test","aaaa","hello" ];
    $string     = ""; 
    
    foreach( $messages as $m ){
        $string .= " " . $m; 
    }
    
    echo $string;
    

## function

再利用する処理は関数にまとめる。

    <?php
    
    function rect($width,$height){
        return $width*$height;
    }
    
    echo rect(4,5);


## class

    <?php
    
    class Introduction
    {
        public $message = "このmessageが属性。下のfunctionがメソッド。いずれもクラス内ではpublicをつける";
         
        public function hello()
        {   
            return "HELLO!!";
        }   
        public function intro()
        {   
            return "このクラスにはhelloメソッドとintroメソッドがあります。";
        }   
    
    }
    
    class Inheritance extends Introduction
    {
        public function hello()
        {   
            return "hello !! このメソッドは継承元のIntroductionクラスのhelloメソッドを上書きしています。";
        }   
    
        public function say($message)
        {   
            return $message . " !!! ";
        }   
    
    }
    
    
    $obj1 = new Introduction();
    
    echo $obj1->message;
    echo $obj1->hello();
    echo $obj1->intro();
    
    
    $obj2 = new Inheritance();
    
    echo $obj2->hello();
    echo $obj2->say("aaaaa");


属性とメソッドを定義するときはpublicをつける。オブジェクトから属性値、メソッドを参照するときは`->`を使う。


## 型変換と型の確認

型の確認にはgettypeを使う。

    <?php
    
    $string = "test";
    $number = 1;

    echo gettype($string);
    echo gettype($number);

型の変換はこのようにする。

    <?php
    
    $string = (Integer) "2";
    $number = (string) 1;

    echo gettype($string);
    echo gettype($number);

このように()を使い、中に型の指定をすることで変換ができる。


## 配列操作

    $students   = ["Tom","Bob","Mike"];

    echo $students;
    echo $students[1];

添字なしだと全て表示、1を指定すると、Bobが出てくる。

連想配列はこうなる。

    $score["Tom"]   = 69;
    $score["Bob"]   = 89;
    $score["Mike"]  = 62;

    echo $score;
    echo $score["Bob"];

数値ではなく、キーワードで指定をした上で値を手に入れる。

配列の長さはcount()で測る。

    echo count($students);
    echo count($score);

forループを使用して、配列の長さを指定するのではなく、foreachを使う。

    foreach ($score as $value){
        \Log::debug($value);
    }

    foreach ($score as $key => $value){
        \Log::debug($key);
        \Log::debug($value);
    }

キーも表示させたい場合はこのように書く。この方法はオブジェクトに対しても有効である。

## 結論

こうして並べてみると、PHPの構文はRubyやPythonとかと違って独特。

他にも型の違いとかを考慮する必要があると思うが、それは実際にLaravelを触りながらでも遅くはないと思う。

構文を覚えたら、次はLaravelの全体像を確認すると良いだろう。

[Laravelの全体像、ファイル・ディレクトリごとの役割と関係性を俯瞰する](/post/laravel-overview/)

すぐに手を動かして覚えたい場合はこちらを。

[Laravelビギナーが30分で掲示板アプリを作る方法](/post/startup-laravel/)

