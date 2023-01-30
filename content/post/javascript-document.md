---
title: "Javascriptで自由にHTMLを操作する、DOMについて"
date: 2023-01-07T09:59:59+09:00
lastmod: 2023-01-07T09:59:59+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","初心者向け" ]
---


## DOMとは？

DOMとはDocumentObjectModelの略で、HTMLドキュメントを自由に操作する仕組みのことを言う。

DOMによりWEBページとプログラミング言語をつなぐことができる。

参照元: https://eng-entrance.com/what-is-dom

早い話、JavaScriptはDOMを使うことで、HTMLを自由に操作することができるというわけだ。

## 特定の要素の内容を書き換えてみよう


    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
    </head>
    <body>
    
    
        <div id="test">これはテストです。</div>
    
    <script>
    const test      = document.getElementById("test");
    test.innerHTML  = "Hello World !!"
    </script>
    
    </body>
    </html>
    
    
通常、JavaScriptが動かなければ、上記HTMLは『これはテストです』と表示されるところが、JavaScriptが動くことで『Hello World !!』と表示される。


## 実践ではどう使うのか？

JavaScriptでは、特定の条件になった時に、処理を行うことができる。これをイベントという。(例えばページが読み込まれた時にアラートを出すなど)

このイベントとDOMを組み合わせることで、特定のHTMLがクリックされた時に何らかの処理を行うことができる。


例えば、以下のコードを動かすと良いだろう。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
    </head>
    <body>
    
        <input id="test" type="button" value="テスト">
    
    <script>
    
    //要素を取得する。
    const test  = document.getElementById("test");
    
    //イベントをセットする。
    test.addEventListener('click', function(){
        alert("テスト");
    });
    
    </script>
    
    </body>
    </html>
    

まずは要素を取得している。その上で、その要素に対して`.addEventListener()`を使ってイベントをセットしている。

イベントの引数として与えるのは2つ、イベントが発火する条件と、その処理内容。

第一引数の`click`は発火条件としてクリックを指定している。第二引数の処理内容として関数が与えられている。


## 結論

JavaScriptでDOMを使うことにより、HTMLの操作をすることができるようになった。

このDOMを使うことで、例えば、

- フォームの入力内容のチェック
- 郵便番号検索
- ストップウォッチやタイマー
- グラフの表示

などができるようになるだろう。

ちなみに、常に、`document.getElementById()`などと書くのが大変な場合は、

    const test = document.querySelector("#test");

    test.addEventListener('click', function(){
        alert("テスト");
    });

としても良いだろう。この場合は、CSSのセレクタと同様の記法になるので、クラス名やタグ名などの取得も容易になる。






