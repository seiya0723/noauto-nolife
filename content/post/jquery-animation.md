---
title: "【jQuery】.animate()の使い方【アニメーション】"
date: 2023-02-05T17:17:49+09:00
lastmod: 2023-02-05T17:17:49+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "jQuery","JavaScript","アニメーション","ウェブデザイン" ]
---


## .animate() の構文

```
$(要素).animate({ 発動するCSS }, 遅延 );
```

遅延はミリ秒単位で書く


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<style>

.button-more{
    display:inline-block;
    background:orange;
    padding:1rem;

    cursor:pointer;
}

</style>

</head>
<body>

    <span class="button-more">continue ...</span>

<script>
    $('.button-more').on('mouseover', function() {
        console.log("over");

        // このthisはこのイベントが発生した要素自身を意味している。
        $(this).animate({
            opacity: 0.5,
            marginLeft: 20,
        }, 100);
    });
    $('.button-more').on('mouseout', function() {
        console.log("out");

        $(this).animate({
            opacity: 1.0,
            marginLeft: 0,
        }, 100);
    });
</script>

</body>
</html>
```



## 結論

jQueryを使用することで、簡単にアニメーションを再現することができる。

イベントと組み合わせることで、モーダルダイアログの表示や、入力欄のチェックとエラーの表示などをアニメーションで表現できるようになる。


参照元

https://js.studio-kingdom.com/jquery/effects/animate

