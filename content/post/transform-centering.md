---
title: "position:relativeとabsoluteとtransform:translateを使ったセンタリング【どんな画面幅でも中央に配置する】"
date: 2023-01-07T10:05:00+09:00
lastmod: 2023-01-07T10:05:00+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "フロントサイド" ]
tags: [ "html","css","ウェブデザイン" ]
---

例えば、サイトのタイトルなど、どんな状況でも必ず中央に配置したい場合があるだろう。

そういう時は、`position`と`transform:translate`を使用することで解決できる。

## ソースコード

まずは下記のソースコードを動かしてもらいたい。


```
`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

<style>
body{
    /* ブラウザのデフォルトでmarginが付いているので消しておく。*/
    margin:0;
}
.content_area {
    position:relative;

    /* content_areaの高さをブラウザの縦幅全開まで指定 */
    height:100vh;

    background:deepskyblue;
}

.content{
    position:absolute;

    top:50%;
    left:50%;
    transform:translate(-50%, -50%);

    background:orange;
}
</style>


</head>
<body>

    <div class="content_area">
        <div class="content">HelloWorld</div>
    </div>

</body>
</html>

```

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot 2023-01-07 at 10-23-15 Hello World test!!.png" alt=""></div>


## 説明

まず、親要素の`.content_area`には`height:100vh;`と`position:relative;`を指定しておく。

`position:absolute;`を指定した子要素は`position:relative;`を指定した親要素の左上の位置を起点とすることができる。

子要素は親要素の左上を起点として、左から50%、上から50%の位置に配置される。ちなみに、この50%というのは親要素の50%である。(下記図の緑枠の場所)

しかし、これでは要素の配置が若干右下にずれてしまう。そこで`transform:translate()`で再配置を行う。

`translate`の50%は子要素自身に対しての基準となっている。つまり、子要素のX軸方向、Y軸方向に対してそれぞれ-50%になる。

すると、画面の中央に子要素の中心が配置されるようになる。(下記図のオレンジ枠)

<div class="img-center"><img src="/images/Screenshot from 2023-01-07 10-41-09.png" alt=""></div>


positionに関しては下記も参考にすると良いだろう。

- https://mdstage.com/html-css/css-intermediate/position
- http://www.htmq.com/style/position.shtml

## 参照元

- https://arts-factory.net/position/
- https://cotodama.co/position-absolute-center/



### 余談

ちなみに参照元のサイトを含め、HTMLやCSSの解説をしているサイトのほとんどでは、`-web-kit`などの[ベンダープレフィックス](http://www.htmq.com/csskihon/603.shtml)が使用されている。

しかし、現行のブラウザではほとんどのCSSプロパティにおいて、ベンダープレフィックスは無くても正常に動作する。ベンダープレフィックスの詳細は下記Qiitaを参照すると良いだろう。

https://qiita.com/xrxoxcxox/items/3e0e34003a45d3618b29



