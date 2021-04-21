---
title: "Laravelに必要なPHP構文【if,for,function,class】"
date: 2021-04-13T17:46:27+09:00
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


## 結論

こうして並べてみると、PHPの構文はRubyやPythonとかと違って独特。

他にも型の違いとかを考慮する必要があると思うが、それは実際にLaravelを触りながらでも遅くはないと思う。

構文を覚えたら、次はLaravelの全体像を確認すると良いだろう。

[Laravelの全体像、ファイル・ディレクトリごとの役割と関係性を俯瞰する](/post/laravel-overview/)

すぐに手を動かして覚えたい場合はこちらを。

[Laravelビギナーが30分で掲示板アプリを作る方法](/post/startup-laravel/)



