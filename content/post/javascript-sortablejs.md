---
title: "JavaScriptで並び替えをするならSortable.js【jQuery不要のライブラリ】"
date: 2022-09-11T21:21:48+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","ウェブデザイン","JavaScriptライブラリ" ]
---


## CDN

    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>

## HTML


    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    </head>
    <body>
    
        <div class="sort_area">
            <div class="sort_item" style="background:orange;padding:0.5rem;margin:0.5rem;">1</div>
            <div class="sort_item" style="background:orange;padding:0.5rem;margin:0.5rem;">2</div>
            <div class="sort_item" style="background:orange;padding:0.5rem;margin:0.5rem;">3</div>
            <div class="sort_item" style="background:orange;padding:0.5rem;margin:0.5rem;">4</div>
            <div class="sort_item" style="background:orange;padding:0.5rem;margin:0.5rem;">5</div>
            <div class="sort_item" style="background:orange;padding:0.5rem;margin:0.5rem;">6</div>
        </div>
    
    <script>
    const sort_areas    = document.querySelectorAll(".sort_area");
    
    for (let area of sort_areas ){
        new Sortable(area, {
            animation: 150,
            ghostClass: 'dragging',
            onEnd: function(){ console.log("ソート完了") },
        });
    }
    </script>
    
    </body>
    </html>
    

## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-09-13 15-29-46.png" alt=""></div>



## 結論

ソート終了時、onEndで何か処理を実行する事ができる。例えば、Ajaxとか。

ドラッグ中にクラスを割り当てる事ができるので、色を変えるとか色々できると思う。

詳細は公式にて。

https://sortablejs.github.io/Sortable/





