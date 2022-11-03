---
title: "【JavaScript】marked.jsでマークダウン記法をHTML上でプレビューしてみる"
date: 2022-11-03T16:48:55+09:00
lastmod: 2022-11-03T16:48:55+09:00
draft: false
thumbnail: "images/Screenshot from 2022-11-03 16-48-37.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","JavaScriptライブラリ","マークダウン","追記予定" ]
---


以前、[Pythonでマークダウンを実現させてDjangoに実装した](/post/django-markdown/)が、最近のサイトは皆、マークダウンを書いたら即時で隣のプレビュー欄に表示させる仕様になっている事が多い。

それはJavaScriptでマークダウンを作っているからで、Pythonでマークダウンを実現させているようでは難しい。

そこで、JavaScriptマークダウンのライブラリとして名高い [marked.js](https://marked.js.org/) を使うことにした。


## とりあえず作ってみたソースコード

後にReactなどのフレームワークとの運用を想定して、敢えてVanillaJSで作った。

### HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <!--marked.js-->
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <!--dompurify.js -->
        <script src="https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js"></script>
    
        <script src="script.js"></script>
    </head>
    <body>
    
        <div class="row mx-0">
            <div class="col">
                <textarea class="form-control"></textarea>
            </div>
            <div class="col border">
                <div class="markdown"></div>
            </div>
        </div>
    
    </body>
    </html>

### JavaScript

    window.addEventListener("load" , function (){
    
        const textarea  = document.querySelector("textarea");
        const markdown  = document.querySelector(".markdown");
    
        textarea.addEventListener("input", function(){ 
            //console.log(this.value);
    
            //素のHTMLを無害化
            let cleaned         = DOMPurify.sanitize(this.value);
    
            console.log(cleaned);
    
            //マークダウンを解釈して、隣のプレビュー欄にレンダリング
            markdown.innerHTML  = marked.parse(cleaned);
    
        });
    });


### 動かすとこうなる

一応、入力したら即時プレビューしてくれる。

ソースコードとして表示してくれと書いたのに、それがサニタイズされて消えている。これでは使えない。

<div class="img-center"><img src="/images/Screenshot from 2022-11-03 16-48-37.png" alt=""></div>

onclick属性の削除は良いが、コード欄のscriptタグまで消すのはダメだ。

## 結論

現時点ではあまり使いこなせないっぽいが、Teratailなどのサイトではプレビューを表示しているわけで、解決策はおそらくあると思われる。

解決策が見つかり次第、追記する予定。
