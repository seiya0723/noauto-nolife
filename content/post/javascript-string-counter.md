---
title: "JavaScriptで文字数をカウントする【サロゲートペアに注意】"
date: 2022-10-16T20:32:18+09:00
draft: false
thumbnail: "images/Screenshot from 2022-10-16 20-45-41.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","tips","ウェブデザイン" ]
---

JavaScriptで文字数をカウントするシーンはよくある。

例えば、テキストエリアに入力した時、入力された文字数を表示させたりする。

これで、最大文字数まであとどれだけ入力できるのかわかる。


## ソースコード

### HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="script.js"></script>
    </head>
    <body>
        <textarea id="textarea"></textarea>
        <div><span id="counter"></span>文字入力</div>
    </body>
    </html>
    
### JavaScript

    window.addEventListener("load" , function (){
    
        $("#textarea").on("input", function(){
            //改行は1文字に含まない
            $("#counter").html([...this.value.replace(/\n/g,"")].length);
        });
    
    });
    
    
## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-16 20-45-41.png" alt=""></div>

## 結論

一部の漢字(`𩸽`など)が2文字で判定されてしまう問題はこのようにして対処する。

ただ、これでも不完全らしい。一部の絵文字も正確に文字数計測するには、`Intl.Segmenter`を使う。

ただ、Firefoxでは正常に動作しない上に絵文字を使う機会は限られるので無くても良いかも。詳細は下記。

参照元: https://qiita.com/suin/items/3da4fb016728c024eaca

