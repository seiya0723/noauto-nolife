---
title: "FontAwesomeや画像を選択できるプルダウンメニュー【JS不使用】"
date: 2021-04-25T17:41:49+09:00
draft: false
thumbnail: "images/Screenshot from 2021-04-25 17-34-56.png"
categories: [ "フロントサイド" ]
tags: [ "ウェブデザイン","css3","html5" ]
---


普通の`select`タグの場合、画像やアイコンを表示させようとしてもうまく行かない。他にも、複数選択しないといけないとき、`select`タグに`multiple`属性を指定するだけでは操作が難しい。

そこで、画像とFontAwesomeが表示できて、なおかつ複数選択可能なプルダウンメニューを作ってみた。

## ソースコード

html5、いつもの`input`タグに、`checkbox`と`radio`を使っている。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Fontawesome の プルダウンメニュー</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">

    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <div>多対多のリレーションを選択させる時に有効。overflow-y:scrollとさせ、適当にheightを指定すれば、複数選択式のプルダウンメニューが作れる。inputタグをradioにすれば1対多が、checkboxにすれば多対多のフォームが作れる。</div>
    
        <div>
            <input id="menu" class="hidden_input" type="checkbox"><label class="menu_label" for="menu">アイコンを選択</label><br>
            <div class="menu_content_area">
                <input id="menu_1" class="hidden_input menu_content_input" type="radio" name="menu_content" value="fas fa-angle-double-right"><label class="menu_content_label" for="menu_1"><i class="fas fa-angle-double-right"></i> fas fa-angle-double-right</label>
                <input id="menu_2" class="hidden_input menu_content_input" type="radio" name="menu_content" value="fas fa-angle-double-right"><label class="menu_content_label" for="menu_2"><i class="fas fa-angle-double-right"></i> fas fa-angle-double-right</label>
                <input id="menu_3" class="hidden_input menu_content_input" type="radio" name="menu_content" value="fas fa-angle-double-right"><label class="menu_content_label" for="menu_3"><i class="fas fa-angle-double-right"></i> fas fa-angle-double-right</label>
                <input id="menu_4" class="hidden_input menu_content_input" type="radio" name="menu_content" value="fas fa-angle-double-right"><label class="menu_content_label" for="menu_4"><i class="fas fa-angle-double-right"></i> fas fa-angle-double-right</label>
                <input id="menu_5" class="hidden_input menu_content_input" type="radio" name="menu_content" value="fas fa-angle-double-right"><label class="menu_content_label" for="menu_5"><i class="fas fa-angle-double-right"></i> fas fa-angle-double-right</label>
                <input id="menu_6" class="hidden_input menu_content_input" type="radio" name="menu_content" value="fas fa-angle-double-right"><label class="menu_content_label" for="menu_6"><i class="fas fa-angle-double-right"></i> fas fa-angle-double-right</label>
                <input id="menu_7" class="hidden_input menu_content_input" type="radio" name="menu_content" value="fas fa-angle-double-right"><label class="menu_content_label" for="menu_7"><i class="fas fa-angle-double-right"></i> fas fa-angle-double-right</label>
            </div>
        </div>
    
    </body>
    </html>

`inline-block`が2つ並んでいるので、横に表示されてしまう。これを防ぐためにあえてプルダウンメニューのボタンのすぐ後に`br`タグを設置した。これで2つの`inline-block`をタテに表示している。

続いて、css3。重要なのはチェックがついたら色反転、もしくは表示非表示を切り替えている点。

    .hidden_input {
        display:none;
    }
    .menu_label {
        position:relative;
        font-size:1.25rem;
        padding:0.25rem 2rem 0.25rem 0.5rem;
        margin:0;
    
        color:white;
        background:#131417;
        border:solid 0.2rem orange;
    
        cursor:pointer;
        transition:0.2s;
    }
    
    .menu_label::before {
        content:"";
        position:absolute;
        top:50%;
        right:0.5rem;
        transform:translate(0%,-50%);
    
        width:0;
        height:0;
    	border-left: 0.5rem solid transparent;
    	border-right: 0.5rem solid transparent;
    	border-top: 0.5rem solid orange;
    
        pointer-events: none;
    }
    
    .menu_content_area {
        display:none;
        padding:0.25rem;
        border:solid 0.1rem gray;
        color:white;
        background:#131417;
    
        /* 高さを任意に決める。*/
        height:15rem;
        overflow-y:scroll;
    
    }
    .menu_content_label {
        display:block;
        padding:0.25rem;
        margin:0;
        border:solid 0.1rem gray;
        cursor:pointer;
        vertical-align:middle;
    }
    .menu_content_label i {
        font-size:1.75rem;
    
    }
    .menu_content_label:hover {
        color:white;
        background:orange;
    }
    input[type="checkbox"]#menu:checked ~ .menu_content_area { display:inline-block; }
    input[type="radio"].menu_content_input:checked + .menu_content_label { color:white;background:orange; }


はみ出した時、スクロールさせるために高さを指定しているが、これは画面幅に合わせたほうが良いだろう。

## 実際に動かしてみる

<div class="img-center"><img src="/images/Screenshot from 2021-04-25 17-34-56.png" alt="プルダウンメニュー"></div>

このコードの問題点は、選択した内容がプルダウンメニューの開閉箇所に反映されないこと、それから範囲外をクリックしてもメニューが閉じないことだ。

`select`タグとは違って、この2つの問題点はJSに頼るしか無いのが現状である。範囲外クリックで閉じる動作はHTMLとCSSでも実現できそうだが、かえって煩雑になりそうなのでやめておく。


## 結論

もし、複数選択がしたいのであれば、`.menu_content_input`の`type`を`checkbox`にすれば済む。その時は、cssの修正も合わせてやっておく。

これで1対多、多対多のリレーションのデータを入力することができる。特に多対多のときに強力で、下記リンクのように、ラベルをひたすら横に並べるよりもコンパクトに仕立てることができると思われる。

[【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示](/post/django-m2m-form/)

