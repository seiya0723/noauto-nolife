---
title: "CSS3で折りたたみ式のサイドバーを実装させる【checkbox+transition+position】"
date: 2020-10-29T16:15:45+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "フロントサイド" ]
tags: [ "css3","ウェブデザイン","初心者向け" ]
---

モダンなサイトでよく見かける折りたたみ式のサイドバー。これはCSS3の知識さえあればすぐに実装できる。

## HTML5+CSS3を使用した折りたたみ式サイドバー

まず、HTML。headerがページタイトルとサイドバーを兼ねている。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>折りたたみ式右サイドバー</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="onload.js"></script>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <header>
            <div class="header">
                <h1>折りたたみ式右サイドバー</h1>
            </div>
            <input id="r_sidebar" class="r_sidebar_button" type="checkbox">
            <label class="r_sidebar_label" for="r_sidebar"></label>
    
            <div class="r_sidebar_menu">
                ここにサイドバーの内容を書く
            </div>
            <div id="r_sidebar_closer" class="r_sidebar_closer"></div>
        </header>
    
        <main class="container">
            <p>ここがメインエリア</p>
        </main>
    
    </body>
    </html>

`input`タグの`type="checkbox"`を使用することでサイドバーを右から左へスライドさせる。それを`transition`で遅延描画させることで、サイドバーを表示させる。

そのCSS3がこちら。

    html, body {
        overflow-x: hidden;
    }
    .header {
        width:100%;
        height:3rem;
        position:fixed;
        z-index:99;
    
        background:deepskyblue;
        color:white;
        display:flex;
        justify-content:center;
        align-items:center;
    
        overflow:hidden;
    }
    .header h1 {
        font-size:2rem;
        font-weight:bold;
        line-height:normal;
        margin:0;
    }
    
    .r_sidebar_button {
        display:none;
    }
    .r_sidebar_label {
        position:fixed;
        top:0.5rem;
        right:0.5rem;
    
        width:4rem;
        height:2rem;
        border-radius:2rem;
        background:gray;
    
        z-index:100;
        cursor:pointer;
        transition:0.2s;
        box-shadow:0 4px 4px -2px #333 inset;
    }
    .r_sidebar_label:before {
        content:"";
        position:absolute;
        background:white;
        left:50%;
        width:2rem;
        height:2rem;
        border-radius:2rem;
        transition:0.2s;
        box-shadow:4px 0 4px -2px #333;
    }
    input[type="checkbox"]#r_sidebar:checked ~ .r_sidebar_label{
        background:orange;
        transition:0.2s;
    }
    input[type="checkbox"]#r_sidebar:checked ~ .r_sidebar_label:before{
        left:0;
        transition:0.2s;
    }
    
    .r_sidebar_menu {
        position:fixed;
        top:3rem;
        right:-300px;
    
        height:calc( 100vh - 3rem);
        width:300px;
        padding:0.25rem 0.5rem;
        background:#333;
        color:white;
        
        transition:0.2s;
        overflow:auto;
        z-index:99;
    }
    input[type="checkbox"]#r_sidebar:checked ~ .r_sidebar_menu{
        right:0;
        box-shadow:-2px 0 4px #333;
        transition:0.2s;
    }
    .r_sidebar_closer {
        position:fixed;
        top:3rem;
        left:0;
    
        height:calc(100vh - 3rem);
        width:100%;
        background:white;
        opacity:0.6;
        cursor:pointer;
        z-index:98;
    
        display:none;
    }
    input[type="checkbox"]#r_sidebar:checked ~ .r_sidebar_closer{
        display:block;
    }
    main {
       margin-top:3rem;
    }
    
    /* sp mode */
    @media (max-width:768px){
        .header h1 {
            font-size:1.5rem;
            font-weight:bold;
            line-height:normal;
            margin:0;
        }
    
    }

一応、スマホビューでの装飾も記述しておく。

こんなふうになる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 17-00-46.png" alt="サイドバーが開いた状態"></div>

iOS風のトグルスイッチを押せば、右から左へサイドバーが出てくる。

ただ、この折りたたみ式サイドバーは展開している時に範囲外をクリックすると、サイドバーが収納されない。スイッチをもう一度クリックする必要がある。範囲外クリックで折りたたむには、次の項目を参考に追加を施す。


## 【補足】サイドバーの範囲外をクリックしたら折りたたむ仕様にするには？

以下の方法が考えられる。

- 【方法1】JSを使ってチェックボックスの値を書き換える
- 【方法2】labelタグを使ってfor属性にチェックボックスのid名を指定する

### 【方法1】JSを使ってチェックボックスの値を書き換える

先のコードに下記のJSを読ませる。要jQuery。

    $(function () {
        $("#r_sidebar_closer").on("click",function() {
                $("#r_sidebar").prop("checked",false);
        });
    });
    
予めサイドバー範囲外の要素を作っておいたので、それがクリックされた時、チェックボックスのチェックを外している。


### 【方法2】labelタグを使ってfor属性にチェックボックスのid名を指定する

先のコードの下記を

    <div id="r_sidebar_closer" class="r_sidebar_closer"></div>

これをlabelタグに書き換える

    <label class="r_sidebar_closer" for="r_sidebar"></label>

こうすることで、このlabelタグはチェックボックスとつながるので、JavaScript不要で範囲外クリックでの折りたたみが実現できる。

個人的にはこちらのほうが良いと思っている。

## 結論

サイドバーを開くボタンをありふれたハンバーガーボタンにするのもありだけど、個人的にはトグルスイッチのほうが見やすいのであえてそうしてみた。

ハンバーガーボタンが実装したいのであれば、fontawesomeを使えば簡単に実装できますし。

ちなみに、左から右に飛び出るサイドバーを作りたい場合は配置を書き換えれば良い。


### ウェブアプリケーションフレームワーク、Djangoで実装してみる

こちらはハンバーガーボタン仕様にしたものをDjangoで実装させた。

テンプレートの継承が使えるので、多少複雑なサイドバーの仕組みも簡単に再利用ができる。

[【Django】簡易掲示板に折りたたみ式サイドバーを実装させる【extends】](/post/django-templates-extends/)


## ソースコード

https://github.com/seiya0723/chk_sidebar

