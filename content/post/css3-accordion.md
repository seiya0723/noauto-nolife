---
title: "CSS3だけで実装できるアコーディオン【checkbox+transition】"
date: 2020-10-29T17:12:50+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "フロントサイド" ]
tags: [ "css3","tips","ウェブデザイン" ]
---

また、checkboxとtransitionのコンボネタ。それでyoutubeとかでよくあるアコーディオンを簡単に作ることができる。


## アコーディオンの作り方

まず、HTML5。

    <input id="acd_1" class="chkbox" type="checkbox">
    <label class="acd_n_button" for="acd_1">
        <div class="acd_n_button_title">HTML+CSS</div>
    </label>
    <div class="acd_n_body">
        <ul>
            <li>ここに項目を記述する</li>
            <li>ここに項目を記述する</li>
            <li>ここに項目を記述する</li>
        </ul>

        <p>HTML+CSSの場合は仕組み上帯全体がボタンになっているので、複数のボタンを設置する場合は修正が必要。</p>
        <p>overflow:hiddenが無い場合、閉まる時に中の要素が一瞬はみ出るので要指定。</p>
        <p>縦方向のpadding、marginの指定をしていると、閉まる時一瞬カクつく。対策としてopacityを指定すると良し</p>
    </div>

続いて、CSS3

    .chkbox {
        display:none;
    }
    
    /* type n version */
    
    .acd_n_button {
        width:100%;
        height:3rem;
        background:orange;
    
        margin:0;
        cursor:pointer;
    
        display:flex;
        align-items:center;
        
        position:relative;
    }
    .acd_n_button_title {
        padding-left:0.5rem;
        color:white;
        font-weight:bold;
    }
    
    .acd_n_body {
        visibility:hidden;
        height:0;
        opacity:0;
        background:skyblue;
        transition:0.5s;
        padding:0.5rem;
        overflow:hidden;
    }
    input[type="checkbox"]#acd_1:checked ~ .acd_n_body{
        visibility:visible;
        height:20rem;
        opacity:1;
        transition:0.5s;
    }



これを動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 09-33-18.png" alt="CSS3を使ったアコーディオン"></div>

オレンジの部分はlabelになっているので、クリックすることで本体が開閉する。


## 解説

重要なのは、隣接要素を指定する`+`ではなく、兄弟要素全てを指定できる`~`を指定していること。

`+`を使用した場合、inputタグから見て、となりのとなりにあるdiv要素を指定することはできない。しかし、`~`を使用すれば、となりのとなりになるdiv要素を指定することができる。`~`は兄弟要素の全てを指定することができるからだ。

ちなみに、CSS3はこのように子要素と兄弟要素を指定することはできるが、親要素を指定することはできない。親要素を使用するときは素直にJavaScriptを使おう。


## 結論

正直言ってcheckboxとtransitionを使えば何でも作れる。後は作り手のアイデア次第。とは言え、アコーディオンはユーザビリティ重視だと用途がいまいち思いつかない。項目が増えたときの対策ぐらいだろうか？

当たり前だが、HTMLで`checked="checked"`属性指定すれば、初期状態から展開しておくこともできる。

このコードで重要なのが`overflow:hidden`と`height`指定、`visibility`辺り。height指定で閉まるアニメーションを作り、overflowで中の文字列がはみ出さないようにする。

## ソースコード

https://github.com/seiya0723/simple_accordion

