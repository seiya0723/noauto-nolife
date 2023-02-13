---
title: "jQueryのslick.jsでカルーセルを表示する【.slick-dotsのCSS付きでボタンを押しやすく】"
date: 2023-02-12T11:44:38+09:00
lastmod: 2023-02-12T11:44:38+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "jQuery","JavaScript","ウェブデザイン" ]
---

jQueryとslick.jsを使うことでカルーセルを簡単に表現することができる。


## CDNを読み込み

前もって、以下のCSSと

    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>

JSを読み込んでおく。(jQueryもセットで。)

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>

## 使い方

このような形のHTMLに対して

    <div class="slick_area">
        <div class="slick_content">コンテンツ1</div>
        <div class="slick_content">コンテンツ2</div>
        <div class="slick_content">コンテンツ3</div>
    </div>


JavaScriptをこのように発動すれば良い。(slickのCDNを読み込みすることで`.slick()`が使える)

    $(".slick_area").slick({
        // ここにslickの設定用のプロパティを指定(未指定でもOK)
    });

これで`.slick_area`の部分はカルーセルになる。


## 基本のソースコード


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>

<style>
body{
    margin:0;
}
.slick_area{
    width:80%;

    /* 中央寄せ */
    margin:0 auto;
}
.slick_content{
    /* 高さを統一 */
    height:50vh;

    background:orange;
    border:solid 1px black;
}
</style>

</head>
<body>


    <div class="slick_area">
        <div class="slick_content">コンテンツ1</div>
        <div class="slick_content">コンテンツ2</div>
        <div class="slick_content">コンテンツ3</div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>

<script>
    $(document).ready( function(){
        $(".slick_area").slick({
             autoplay: true,        // 自動再生有効
             dots: true,            // ページ移動のドットを表示
             infinite: true,        // 最後のページから最初のページにループする
             autoplaySpeed: 5000,   // 自動再生のスピード(5000ミリ秒)
             arrows: false,         // 次のページと前のページのボタンを非表示
        });
    });
/*
    $(document).ready( function(){ console.log("処理"); });
    // ↑と↓は等価
    $(function() { console.log("処理"); });

    https://arts-factory.net/javascript_load/
*/
</script>

</body>
</html>
```

こちらは`.slick()`実行時にプロパティを指定している。指定できるプロパティは[slick公式のGitHub](https://github.com/kenwheeler/slick/#settings)に公開されている。

### 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2023-02-12 14-02-30.png" alt=""></div>


## ドット部分を押しやすくする

slickのドットの部分を押すことでページ移動ができるが、少々サイズが小さすぎで押しにくい。

デフォルトでドットの部分のクラス名は`.slick-dots`なので、ここに適宜CSSを割り当てておく。

<div class="img-center"><img src="/images/Screenshot from 2023-02-12 14-51-52.png" alt=""></div>


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Add the slick-theme.css if you want default styling -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>
    <!-- Add the slick-theme.css if you want default styling -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>

<style>
body{
    margin:0;
}
.slick_area{
    width:80%;

    /* 中央寄せ */
    margin:0 auto;
}
.slick_content{
    /* 高さを統一 */
    height:50vh;

    background:orange;
    border:solid 1px black;
}


/* li に対してwidth:20px が指定されているのでautoで無効化する */
.slick-dots li {
    width:auto;
}
/* ボタンの幅と高さを指定、基本の色をグレーにする */
.slick-dots li button {
    width:6rem;
    height:2rem;
    background:gray;
}
/* ボタンに対応するカルーセルを表示しているとき、オレンジにする */
.slick-dots .slick-active button{
    background:orange;
}
/* ・(ドット)を非表示にする */
.slick-dots li button::before {
   content:"";
}
</style>

</head>
<body>

    <div class="slick_area">
        <div class="slick_content">コンテンツ1</div>
        <div class="slick_content">コンテンツ2</div>
        <div class="slick_content">コンテンツ3</div>
    </div>

    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>

<script>
    $(document).ready( function(){
        $(".slick_area").slick({
             autoplay: true,        // 自動再生有効
             dots: true,            // ページ移動のドットを表示
             infinite: true,        // 最後のページから最初のページにループする
             autoplaySpeed: 5000,   // 自動再生のスピード(5000ミリ秒)
             arrows: false,         // 次のページと前のページのボタンを非表示
        });
    });
/*
    $(document).ready( function(){ console.log("処理"); });
    // ↑と↓は等価
    $(function() { console.log("処理"); });

    https://arts-factory.net/javascript_load/
*/
</script>


</body>
</html>
```

### 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2023-02-12 14-53-02.png" alt=""></div>

このようにカルーセルのボタンが押しやすくなった。



## 結論

slick.jsはjQueryに依存はしているものの、手軽にカルーセルを実装するには都合が良いだろう。

ボタンの押しづらさなどもCSSを用意すれば簡単に対処できる。



