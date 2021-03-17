---
title: "CSS3とHTML5だけでタブを作り、複数のページを表示させる【JS不要】"
date: 2021-03-17T08:54:24+09:00
draft: false
thumbnail: "images/Screenshot from 2021-03-17 09-17-26.png"
categories: [ "フロントサイド" ]
tags: [ "css3","html5","tips","初心者向け" ]
---

例えば、こんなふうにタブでページを切り替えて表示させるフロント。

<div class="img-center"><img src="/images/Screenshot from 2021-03-17 09-00-14.png" alt="タブ切り替えのページ"></div>

かつてはJSじゃないと成立しなかったが、今となっては、JS不要でCSS3とHTML5だけで再現できる。

## コード

まず、HTML。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>タブシステム</title>
    
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <input id="tab_radio_1" class="tab_radio" type="radio" name="tab_system"><label class="tab_label" for="tab_radio_1">タブ1</label>
        <input id="tab_radio_2" class="tab_radio" type="radio" name="tab_system"><label class="tab_label" for="tab_radio_2">タブ2</label>
        <input id="tab_radio_3" class="tab_radio" type="radio" name="tab_system"><label class="tab_label" for="tab_radio_3">タブ3</label>
        <input id="tab_radio_4" class="tab_radio" type="radio" name="tab_system"><label class="tab_label" for="tab_radio_4">タブ4</label>
        <input id="tab_radio_5" class="tab_radio" type="radio" name="tab_system"><label class="tab_label" for="tab_radio_5">タブ5</label>
        <input id="tab_radio_6" class="tab_radio" type="radio" name="tab_system"><label class="tab_label" for="tab_radio_6">タブ6</label>
    
        <div id="tab_area_1" class="tab_area">タブ1</div>
        <div id="tab_area_2" class="tab_area">タブ2</div>
        <div id="tab_area_3" class="tab_area">タブ3</div>
        <div id="tab_area_4" class="tab_area">タブ4</div>
        <div id="tab_area_5" class="tab_area">タブ5</div>
        <div id="tab_area_6" class="tab_area">タブ6</div>
    
    </body>
    </html>


非常に簡素な形をしている。つまり、

    <ラジオボタンのインプットタグ><ラベル>
    <切り替え対象>

こんな感じ。

続いて、CSS


    .tab_radio {
        display:none;
    }
    .tab_area {
        display:none;
    
        border:solid 0.2rem black;
        padding:0.5rem;
    }
    .tab_label {
        border:solid 0.2rem black;
        padding:0 0.2rem;
        background:silver;
        cursor:pointer;
    }
    
    input[type="radio"].tab_radio:checked + .tab_label { background:white; }
    
    input[type="radio"]#tab_radio_1:checked ~ #tab_area_1 { display:block; }
    input[type="radio"]#tab_radio_2:checked ~ #tab_area_2 { display:block; }
    input[type="radio"]#tab_radio_3:checked ~ #tab_area_3 { display:block; }
    input[type="radio"]#tab_radio_4:checked ~ #tab_area_4 { display:block; }
    input[type="radio"]#tab_radio_5:checked ~ #tab_area_5 { display:block; }
    input[type="radio"]#tab_radio_6:checked ~ #tab_area_6 { display:block; }

つまり、隣接するラベルはチェックされた時、装飾を施す。ラジオボタンがチェックされた時、該当する兄弟要素のエリアを表示させる。

たったこれだけのコードを動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-03-17 09-17-26.png" alt="タブシステム"></div>

## 結論

HTML側だけで単なる表示非表示の切り替えがしたいだけであれば、JSは不要であると結論付けた。

CSSとHTMLだけでこのタブシステムを再現することができれば、コード量の大幅な削減に期待できる。JSが必要な場合は、ラジオボタンの値を抜き取り、処理をすれば良いだろう。

