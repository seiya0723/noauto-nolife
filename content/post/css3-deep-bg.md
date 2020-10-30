---
title: "【CSS3】スクロール時に奥行きを感じる背景(background)の作り方"
date: 2020-10-29T16:39:03+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "web" ]
tags: [ "css3","html5","tips","初心者向け" ]
---

最近流行のスクロールしたら背景がスクロールせず、ページ全体に奥行きを感じることができるモダンデザインの背景を作る。

それほど難しくない。CSS習いたての初心者でも簡単に実装できるので、是非とも試してみたいところ。

## 奥行きのある背景の作り方

まず、HTML。bodyタグ内のみ記述する。

    <main>
        <div class="fixed_bg bg_1">
            <h1>見出し</h1>
        </div> 
     
        <div class="scroll_bg">
            <p>コンテンツ</p>
        </div>
    
        <div class="fixed_bg bg_2">
            <h1>見出し</h1>
        </div> 
     
        <div class="scroll_bg">
            <p>コンテンツ</p>
        </div> 
    
        <div class="fixed_bg bg_3">
            <h1>見出し</h1>
        </div> 
    
        <div class="scroll_bg">
            <p>コンテンツ</p>
        </div> 
    
        <div class="fixed_bg bg_4">
            <h1>見出し</h1>
        </div> 
    
        <div class="scroll_bg">
            <p>コンテンツ</p>
        </div> 
    
    </main>

次、CSS3

    body, html, main {
        /* important */
        height: 100%;
    }
    
    /* 画像を表示する背景 */
    .fixed_bg {
        min-height: 100%;
    
        /* 画面いっぱいに画像を拡大表示させる */
        background-size: cover;
    
        /* fixed指定をして、奥行きを感じさせる */
        background-attachment: fixed;
    
        /* no-repeatで小さい画像を敷き詰めない */
        background-repeat: no-repeat;
    
        /* 背景の配置はXY共に中央揃え */
        background-position: center center;
    }
    
    .fixed_bg.bg_1 {
      background-image: url("img/1.jpg");
    }
    .fixed_bg.bg_2 {
      background-image: url("img/2.jpg");
    }
    .fixed_bg.bg_3 {
      background-image: url("img/3.jpg");
    }
    .fixed_bg.bg_4 {
      background-image: url("img/4.jpg");
    }
    
    .scroll_bg {
        min-height: 100%;
    }
    h1 {
        color:white;
    }

後は、imgディレクトリに画像を保管しておく。

起動するとこうなる。こんなふうに、背景が固まったままスクロールしても動かない。見る人に奥行きを感じることができる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 10-07-23.png" alt="奥行きのある背景"></div>

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 10-07-12.png" alt="奥行きのある背景"></div>


## 解説

このソースの要はbackground系のプロパティ指定。`.fixed_bg`で指定した内容と`height:100%`で作れる。

`cover`で画面いっぱいに拡大表示させ、`fixed`で配置を固定させる(スクロールしたら置いて行かれる)。

`no-repeat`で画像が小さい場合は敷き詰めず、はみ出す大きさの画像の場合は`center`で中央揃えに持っていく。

後は、`background-image`で背景画像を指定すればOK。


## 結論

思っていたよりも仕組みは単純。大手のサイトであれば皆採用しているぐらいメジャーなものなので、デザインにこだわりたいのであれば実装したいところ。

後は、疑似要素を`transform:rotate`で境界線を斜めに仕立てれば、デザイン的にさらに良くなるでしょう。




ちなみにウェブアプリケーションフレームワークで同じことをやる時、画像のファイルパスはcssファイルではなく、テンプレート部に当たるhtmlにstyle属性で書いたほうが良い。環境で画像のファイルパスが動くから。

## ソースコード

https://github.com/seiya0723/depth_scroll


