---
title: "JavaScriptのイベントリスナのアロー関数でthisは使わない【event.currentTargetを使おう】"
date: 2023-02-06T14:16:31+09:00
lastmod: 2023-02-06T14:16:31+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","アンチパターン","tips" ]
---


モダンなJavaScriptに慣れるため、無名関数を書くときにもアロー関数を使い、そしてthisを使おうとすると、意図したとおりにはならない。

アロー関数式とfunction関数ではthisの仕様が異なるからだ。下記ソースコードを元に動作を確かめよう。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>


    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

</head>
<body>

    <button class="button" value="1">ボタン1</button>
    <button class="button" value="2">ボタン2</button>
    <button class="button" value="3">ボタン3</button>
    <button class="button" value="4">ボタン4</button>

<script>

    $(".button").on("click", function(){
        console.log( $(this).val() );
    });


    const buttons   = document.querySelectorAll(".button");

    for (let button of buttons){
        button.addEventListener("click", (event) => {

            // アロー関数ではthisは使えない。
            // console.log( this.value );
            console.log( event.currentTarget.value );
        });
    }
</script>


</body>
</html>
```

## 結論

jQueryでアロー関数を使用するときも同様で、thisは使えない。

`this`ではなく、`event.currentTarget`を使おう。

```
$(".button").on("click", (event) => {
    console.log( $(event.currentTarget).val() );
});
```

アロー関数。短く書けるメリットがあると言われているが、個人的にはミスタイプ多発でfunction関数の方が早く書けたりする。


### 補足

`event.target`の場合、実際にクリックされた場所になる。

つまり、親要素のイベントで発火した場合、`.target`であれば実際にクリックされた子要素を返却することになる。

```
    <div class="button">
        <button value="1">ボタン1</button>
    </div>

<script>

    const buttons   = document.querySelectorAll(".button");

    for (let button of buttons){

        // .buttonがクリックされたとき(実際には子要素のbuttonタグをクリックしたとき)
        button.addEventListener("click", (event) => {
            console.log( event.target ); // .targetで取得できるのはイベントが発火した要素ではなく、子要素のbuttonタグが返却される。
        });
    }
</script>
```

そのため、jQueryのthisとは挙動が異なる点に注意する。


### 参照元

https://rachicom.net/frontend/jquery-this.html
