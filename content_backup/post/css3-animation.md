---
title: "CSS3を使用した簡単アニメーションの実装【transitionとtransform】"
date: 2020-10-29T15:37:51+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "フロントサイド" ]
tags: [ "css3","tips","初心者向け","ウェブデザイン" ]
---


CSS3のアニメーション関係の描画は`animation`プロパティを使用しなくても`transition`プロパティを使用すれば簡単に実装できる。

さらに、`transform`と組み合わせることで、傾きや回転まで自由自在。本記事ではレベルごとにアニメーションの作り方を解説していく。

対象読者はある程度のHTMLとCSSの基礎を身に着けている方、CSSにおける疑似要素(::beforeと::after)、擬似クラス(:hover)等の用語及び使い方を理解している方。

## 【レベル1】transitionを使用したゆっくり背景アニメーション

`transition`は指定するだけで簡単にアニメーションの表現ができる。まずは:hoverで試す。

    <div class="py-2 border change_bg">ここをホバーすると色がゆっくり変わる</div>

次、CSS3はこれだけ。

    .change_bg {
        background:white;
        transition:0.5s;
    }
    .change_bg:hover {
        background:forestgreen;
        transition:0.5s;
    }

`transition:0.5s`で0.5秒遅れてCSSプロパティを描画する。たったこれだけで、ホバーしたらゆっくりと背景色が変わる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 15-10-59.png" alt="背景がゆっくり変わる"></div>


## 【レベル2】transitionとpositionを使用したHPゲージ風アニメーション

擬似要素とposition、z-indexを使うことで、HPゲージ風のアニメーションも作ることができる。

HTML5はレベル1と変わらない。

    <div class="py-2 border ltor">ここをホバーすると左から右にゆっくり変わる</div>

CSS3は一気に増えた。

    .ltor {
        position:relative;
    }
    .ltor::before {
        content:"";
        position:absolute;
        left:0;
        top:0;
        height:100%;
        width:0;
        background:orange;
        z-index:-1;
        transition:0.5s;
    }
    .ltor:hover::before {
        width:100%;
        transition:0.5s;
    }

動かすとこんな感じ。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 15-23-40.png" alt="左から右に動く背景"></div>

このコードの問題は親要素に`z-index:auto`などが指定されていると正常に動作しないこと。動かないときは`z-index`指定が誤っていないかをチェックする必要がある。


## 【レベル3】transitionとtransformを使用した回転アニメーション

`transform`を使用したアニメーション。`transform`には`rotate`、`translate`、`skew`、`scale`の4つの関数が用意されている。回転、移動、ねじれ、拡大の4つである。

レベル3ではこの内の`rotate`(回転)を採用。


HTML5は前と変わらず。

    <div class="py-2 border rotate">ここをホバーすると若干傾く</div>

CSS3もややシンプル。

    .rotate {
        background:crimson;
        transition:0.2s;
    }
    .rotate:hover {
        transform:rotate(-5deg);
        transition:0.2s;
    }

こうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 15-40-59.png" alt=""></div>

ちょっと画像をホバーした時に回転させると良いかも。サイドバーのオウムガイの画像みたいにできる。

`input`タグの`checkbox`で使うとFalseのときは+、Trueのときはxと、メニューのアイコンを回転させて使いまわすことができる。

ちなみに、`transform`プロパティで複数の関数を使用する場合、下記のように記述する

    transform:rotate(-5deg) skew(10deg);


## 【レベル4】transitionとtransformを使用した拡大アニメーション


拡大させるだけであれば、先の項目に倣って`scale`を指定すれば良いだけなので簡単だが、実用重視で枠内からはみ出ないように拡大するように仕立てた。

HTML5はこちら。オウムガイの画像は適当に用意して欲しい。

    <div class="text-center py-2">
        <div class="scale_area">
            <img class="scale" src="static/nautilus.jpg" alt="オウムガイ">
        </div>
    </div>

CSS3はこちら。

    .scale_area {
        display:inline-block;
        overflow:hidden;
        border:solid 0.25rem orange;
    }
    .scale {
        transition:0.2s;
    }
    .scale:hover {
        transform:scale(1.2,1.2);
        transition:0.2s;
    }


動かすとこんな感じ。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 16-01-50.png" alt="マウスホバーで拡大する。"></div>

このコードの注意点は、`overflow:hidden`である。これがないと、子要素が親要素をはみ出して見栄えが悪くなる。親要素の枠内(オレンジの枠内)で拡大させるために、`overflow:hidden`を使用する。


## 結論

transitionプロパティを使用することで初心者でも簡単にCSS3のアニメーションを実装させることができる。

単純なアニメーションをJavaScriptで表現する時代はもう終わりました。

ちなみに、このCSS3のアニメーションを応用することで、iOS風のトグルスイッチを作ったりすることができる。

【関連記事】[CSS3でiOS風のトグルスイッチを作る方法【transition+checkbox】](/post/css3-toggle-switch/)

アコーディオンも作れる。

【関連記事】[CSS3だけで実装できるアコーディオン【checkbox+transition】](/post/css3-accordion/)

## ソースコード

https://github.com/seiya0723/transition_4type


