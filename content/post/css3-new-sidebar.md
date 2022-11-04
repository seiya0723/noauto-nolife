---
title: "【CSS3】checkboxとlabelを使ってサイドバーを作る【コンパクト】"
date: 2022-11-02T13:18:10+09:00
lastmod: 2022-11-02T13:18:10+09:00
draft: false
thumbnail: "images/Screenshot from 2022-11-02 13-31-10.png"
categories: [ "フロントサイド" ]
tags: [ "ウェブデザイン","html5","css3" ]
---



以前作成した[HTMLとCSSのサイドバー](/post/css3-sidebar/)は、見た目は非常にわかりやすいが、場所を取る上に見た目がイマイチ。

そこで、HTMLとCSSだけでサイドバーを作るギミックは踏襲し、デザインだけ変更することにした。


## ソースコード

### HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
    
    
        <input id="sidebar_chk" class="sidebar_chk" type="checkbox">
        <div class="sidebar_area">
    
            <div class="sidebar_content">
                <div>サイドバー</div>
                <div>サイドバー</div>
                <div>サイドバー</div>
                <div>サイドバー</div>
            </div>
            <label class="sidebar_label" for="sidebar_chk">メニュー</label>
    
        </div>
    
        <label class="sidebar_out_area" for="sidebar_chk"></label>
    
    </body>
    </html>
    
    
### CSS

    body{
        margin:0;
    }
    .sidebar_chk{
        display:none;
    }
    .sidebar_area{
        position:fixed;
        top:0;
        left:-300px;
        transition:0.2s;
    }
    .sidebar_content{
        color:white;
        background:rgba(0,0,0,0.7);
    
        width:300px;
        height:100vh;
    }
    .sidebar_label {
        position:absolute;
        top:0;
        left:300px; /* ←ここのleft:300pxは .sidebar_areaの左上を起点とした300pxなので、 sidebar_areaが動くと、同時に動いてくれる。 */
    
        /* 縦書きにする */
        /* 英字は90度回転する*/
        writing-mode:vertical-rl;
    
        padding:2rem 0.25rem;
        cursor:pointer;
        border:solid 1px black;
    }
    /* サイドバーのラベルがクリックされた時、サイドバーを展開する */
    .sidebar_chk[type="checkbox"]:checked + .sidebar_area {
        left:0;
        transition:0.2s;
    }
    
    
    
    /* サイドバー展開中、範囲外をクリックすると閉じる */
    .sidebar_out_area{
        display:none;
        position:fixed;
        top:0;
        left:300px;
    
        width:100%;
        height:100vh;
    
        z-index:-1;
        opacity:0.8;
    }
    .sidebar_chk[type="checkbox"]:checked ~ .sidebar_out_area {
        display:block;
    }


CSSで縦書きをする`writing-mode:vertical-rl`を使うことにした。

これで折りたたみのラベルを、あまり邪魔にならないように仕立てることができる。

## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-11-02 13-31-10.png" alt=""></div>

## 結論

後はfontawesomeを使用したり色を付けてもう少し装飾を加えると見た目が良くなるだろう。
