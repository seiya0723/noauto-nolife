---
title: "CSS3でiOS風のトグルスイッチを作る方法【transition+checkbox】"
date: 2020-10-29T15:37:36+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "web" ]
tags: [ "css3","tips","初心者向け","ウェブデザイン" ]
---

CSS3で実装されたtransitionと兄弟要素のセレクタを組み合わせることでiOS風のトグルスイッチは簡単に作れる。

何も装飾を施していないinputタグのチェックボックスは小さくて見づらいが、この装飾を施すことで、視覚的にも押すことができるスイッチであると認識できるし、押せる範囲が広がる。


## iOS風のトグルスイッチの作り方

まずはHTML5から。

    <div class="ui_demo_area">
        <input id="ios_chk_01" class="ui20-input_chk" type="checkbox"><label class="ui20-ios_conf" for="ios_chk_01"></label>
    </div>

続いて、CSS3。

    /* ios button */
    .ui20-input_chk {
        display:none;
    }
    .ui20-ios_conf {
        display:inline-block;
        position:relative;
        padding:1rem 2rem;
        margin:0.25rem;
        border-radius:1rem;
        background:darkgray;
        transition:0.2s;
        cursor:pointer;
    }
    .ui20-ios_conf::before {
        content:"";
        position:absolute;
        top:-1px;
        left:0;
        width:50%;
        height:100%;
        border:1px solid gray;
        border-radius:1rem;
        background:white;
        transition:0.2s;
    }
    input[type="checkbox"].ui20-input_chk:checked + label.ui20-ios_conf{ background:lime; }
    input[type="checkbox"].ui20-input_chk:checked + label.ui20-ios_conf::before{ left:50%; }

これを実行するとこんな感じになる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 08-51-10.png" alt="iOS風のトグルスイッチ"></div>

ONにしたときはライム色、OFFにしたときは灰色になる。



## 解説


まず、HTMLのチェックボタンは装飾に邪魔なので、`display:none;`で消す。display:none`で消したとしても、チェックボックスとしては機能するので問題はない。

続いて、チェックボックスに関連付けたラベル要素を装飾する。本体は`position:relative`として、疑似要素を`position:absolute`とする。こうすることで、本体はスイッチ全体を、疑似要素はつまみの部分を表現することができる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 08-55-30.png" alt="疑似要素と本体"></div>


そして、このコードの肝はCSS3最終行の+を使用したセレクタ。

これは、隣接している別のHTML要素を指定するためのセレクタ。つまり、`input[type="checkbox"].ui20-input_chk:checked + label.ui20-ios_conf`の意味は、`.ui20-input_chk`がチェックされている状態の時、隣接するlabelタグで`.ui20-ios_conf`を指定すると言う意味。

すなわち、そのままでは背景灰色でつまみは左、チェックすればつまみを右にして背景をライム色にするということ。

さらに、`transition`を使用することで遅延描画させ、スライドにアニメーションをつける。これで本物のiOSのトグルスイッチに近づけたというわけ。

## 結論

この装飾を応用すれば、回転式のつまみやドアノブなども表現できる。

ウェブアプリ制作との相性は抜群。通常のスマホアプリにありがちなスイッチを真似て表現することで、ユーザビリティの大幅な向上が期待できる。

【関連記事】[CSS3を使用した簡単アニメーションの実装【transitionとtransform】](/post/css3-animation/)


