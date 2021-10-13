---
title: "CSS3とHTML5だけでモーダルダイアログを作る【JS不要】"
date: 2021-10-14T07:15:41+09:00
draft: false
thumbnail: "images/Screenshot 2021-10-14 at 07-46-46.png"
categories: [ "フロントサイド" ]
tags: [ "ウェブデザイン","css3","html5" ]
---

モーダルダイアログもとどのつまり、単なる表示非表示なので、HTMLとCSSだけで再現できる。

checkboxとlabelタグを使えば良いだけの話である。


## ソースコード

まずHTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <label class="modal_label" for="modal_chk">新規作成</label>
    
    
    
        <input id="modal_chk" class="modal_chk" type="checkbox">
        <div class="modal_body">
            <label class="modal_bg" for="modal_chk"></label>
            <div class="modal_content"></div>
        </div>
    
    </body>
    </html>

2つのlabelタグのfor属性はいずれもcheckboxのIDを指定させる。for属性が重複してもHTML的には何の問題も無い。

続いてCSS。これだけで成立する。

    body { margin:0; }
    
    
    .modal_label {
        border:solid 0.1rem black;
        padding:0.25rem;
        cursor:pointer;
    }
    .modal_body { display:none; }
    .modal_chk { display:none; }
    .modal_bg {
        position:fixed;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
        background:rgba(0,0,0,0.8);
        cursor:pointer;
    }
    .modal_content {
        position:absolute;
        top:50%;
        left:50%;
        width:80%;
        height:80%;
        transform:translate(-50%,-50%);
        background:white;
    }
    input[type="checkbox"]#modal_chk:checked + .modal_body { display:block; }


HTMLの構造を工夫すればz-indexはいらない。`.modal_bg`は子要素にfontawesomeのバツアイコンを表示させる可能性を考慮し、opacityではなくrgbaを使用して、子要素に不透明度の影響が及ばないようにしている。

checkboxの仕組みは、[CSS3で折りたたみ式のサイドバーを実装させる【checkbox+transition+position】](/post/css3-sidebar/)や[CSS3でiOS風のトグルスイッチを作る方法【transition+checkbox】](/post/css3-toggle-switch/)を元にしているので、それほど難しくはない。

動かすとこうなる

<div class="img-center"><img src="/images/Screenshot 2021-10-14 at 07-46-46.png" alt=""></div>

## 結論

モーダルダイアログも結局のところ、ただの表示非表示の繰り返し。わざわざJavaScriptを使わなくても再現はできる。

もし、このモーダルダイアログの表示にアニメーションを実装させようとなると、transitionによる遅延描画やtopやleftの配置、opacityによる不透明度の調整によってアニメーションは成立するので、これまたJavaScriptは要らない。


