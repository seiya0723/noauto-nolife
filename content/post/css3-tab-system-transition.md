---
title: "CSS3とHTML5のタブシステムをtransitionでアニメーション表示に仕立てる"
date: 2021-08-14T12:05:55+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "フロントサイド" ]
tags: [ "css3","html5","tips" ]
---

[CSS3とHTML5だけでタブを作り、複数のページを表示させる【JS不要】](/post/css3-tab-system/)で作ったタブシステムは瞬間的に切り替わるので、少し野暮ったい。

他にアニメーションを多用したサイトであれば、タブシステムも同様にアニメーションを実装するべきかと思われる。そこで本記事ではその解説を行う。



## タブシステムの基本形(改修)

従来型は、スマホ表示になると、折り返して表示していたので、横スクロールに仕立てる。


まずHTML。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>タブシステム(改修型)</title>
    
    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <input id="tab_radio_1" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_2" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_3" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_4" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_5" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_6" class="tab_radio" type="radio" name="tab_system">
    
        <div class="tab_label_area">
            <label class="tab_label" for="tab_radio_1">タブ1</label>
            <label class="tab_label" for="tab_radio_2">タブ2</label>
            <label class="tab_label" for="tab_radio_3">タブ3</label>
            <label class="tab_label" for="tab_radio_4">タブ4</label>
            <label class="tab_label" for="tab_radio_5">タブ5</label>
            <label class="tab_label" for="tab_radio_6">タブ6</label>
        </div>
    
        <div id="tab_body_1" class="tab_body">タブ1</div>
        <div id="tab_body_2" class="tab_body">タブ2</div>
        <div id="tab_body_3" class="tab_body">タブ3</div>
        <div id="tab_body_4" class="tab_body">タブ4</div>
        <div id="tab_body_5" class="tab_body">タブ5</div>
        <div id="tab_body_6" class="tab_body">タブ6</div>
    
    </body>
    </html>
    
続いてCSS。

    .tab_radio {
        display:none;
    }
    .tab_label_area {
        overflow-X:auto;
        white-space:nowrap;
    }
    .tab_label {
        display:inline-block;
        border-top:solid 0.2rem black;
        border-left:solid 0.2rem black;
        border-right:solid 0.2rem black;
    
        padding:0 0.2rem;
        background:silver;
        cursor:pointer;
    }
    .tab_body {
        display:none;
        border:solid 0.2rem black;
        padding:0.5rem;
    }
    
    input[type="radio"]#tab_radio_1:checked ~ .tab_label_area > label[for="tab_radio_1"].tab_label { background:white; }
    input[type="radio"]#tab_radio_2:checked ~ .tab_label_area > label[for="tab_radio_2"].tab_label { background:white; }
    input[type="radio"]#tab_radio_3:checked ~ .tab_label_area > label[for="tab_radio_3"].tab_label { background:white; }
    input[type="radio"]#tab_radio_4:checked ~ .tab_label_area > label[for="tab_radio_4"].tab_label { background:white; }
    input[type="radio"]#tab_radio_5:checked ~ .tab_label_area > label[for="tab_radio_5"].tab_label { background:white; }
    input[type="radio"]#tab_radio_6:checked ~ .tab_label_area > label[for="tab_radio_6"].tab_label { background:white; }
    
    
    input[type="radio"]#tab_radio_1:checked ~ #tab_body_1 { display:block; }
    input[type="radio"]#tab_radio_2:checked ~ #tab_body_2 { display:block; }
    input[type="radio"]#tab_radio_3:checked ~ #tab_body_3 { display:block; }
    input[type="radio"]#tab_radio_4:checked ~ #tab_body_4 { display:block; }
    input[type="radio"]#tab_radio_5:checked ~ #tab_body_5 { display:block; }
    input[type="radio"]#tab_radio_6:checked ~ #tab_body_6 { display:block; }


こうすることで、画面幅の狭いスマホでも横スクロールが出て、タブの部分が折り返されない。

<div class="img-center"><img src="/images/Screenshot from 2021-08-14 14-03-57.png" alt="改修型タブシステム"></div>

これを基本形とする。

## positionとvisibilityとopacityを使用して、transitionでゆっくり表示

基本形と違って、bodyの枠がなくなっているが、一応これでアニメーション表示できる。

まずHTML。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>タブシステム(改修型)</title>
    
    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <input id="tab_radio_1" class="tab_radio" type="radio" name="tab_system" checked>
        <input id="tab_radio_2" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_3" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_4" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_5" class="tab_radio" type="radio" name="tab_system">
        <input id="tab_radio_6" class="tab_radio" type="radio" name="tab_system">
    
        <div class="tab_label_area">
            <label class="tab_label" for="tab_radio_1">タブ1</label>
            <label class="tab_label" for="tab_radio_2">タブ2</label>
            <label class="tab_label" for="tab_radio_3">タブ3</label>
            <label class="tab_label" for="tab_radio_4">タブ4</label>
            <label class="tab_label" for="tab_radio_5">タブ5</label>
            <label class="tab_label" for="tab_radio_6">タブ6</label>
        </div>
    
        <div class="tab_body_area">
            <div id="tab_body_1" class="tab_body"><div class="tab_body_content">タブ1</div></div>
            <div id="tab_body_2" class="tab_body"><div class="tab_body_content">タブ2</div></div>
            <div id="tab_body_3" class="tab_body"><div class="tab_body_content">タブ3</div></div>
            <div id="tab_body_4" class="tab_body"><div class="tab_body_content">タブ4</div></div>
            <div id="tab_body_5" class="tab_body"><div class="tab_body_content">タブ5</div></div>
            <div id="tab_body_6" class="tab_body"><div class="tab_body_content">タブ6</div></div>
        </div>
    
    </body>
    </html>
    
続いて、CSS。

    .tab_radio {
        display:none;
    }
    .tab_label_area {
        overflow-X:auto;
        white-space:nowrap;
    }
    .tab_label {
        display:inline-block;
        border:solid 0.1rem black;
        padding:0.25rem 1rem;
        cursor:pointer;
    }
    .tab_label:hover {
        background:orange;
        transition:0.5s;
    }
    .tab_body_area {
        position:relative;
    }
    .tab_body {
        position:absolute;
        visibility:hidden;
        opacity:0;
    
        width:100%;
        transition:0.5s;
    }
    .tab_body_content {
        padding:0.5rem;
    }
    
    input[type="radio"]#tab_radio_1:checked ~ .tab_label_area > label[for="tab_radio_1"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_2:checked ~ .tab_label_area > label[for="tab_radio_2"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_3:checked ~ .tab_label_area > label[for="tab_radio_3"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_4:checked ~ .tab_label_area > label[for="tab_radio_4"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_5:checked ~ .tab_label_area > label[for="tab_radio_5"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_6:checked ~ .tab_label_area > label[for="tab_radio_6"].tab_label { background:orange; }
    
    input[type="radio"]#tab_radio_1:checked ~ .tab_body_area > #tab_body_1 { visibility:visible;opacity:1;transition:0.5s; }
    input[type="radio"]#tab_radio_2:checked ~ .tab_body_area > #tab_body_2 { visibility:visible;opacity:1;transition:0.5s; }
    input[type="radio"]#tab_radio_3:checked ~ .tab_body_area > #tab_body_3 { visibility:visible;opacity:1;transition:0.5s; }
    input[type="radio"]#tab_radio_4:checked ~ .tab_body_area > #tab_body_4 { visibility:visible;opacity:1;transition:0.5s; }
    input[type="radio"]#tab_radio_5:checked ~ .tab_body_area > #tab_body_5 { visibility:visible;opacity:1;transition:0.5s; }
    input[type="radio"]#tab_radio_6:checked ~ .tab_body_area > #tab_body_6 { visibility:visible;opacity:1;transition:0.5s; }
    

このように、display:blockに対してtransitionは通用しない。ゆっくり表示する形式に仕立てたいのであれば、visibilityを指定する必要がある。

しかし、visibilityは見えていないだけで要素の領域は確保されているので、position:absoluteを指定して、いずれのタブのbodyも必ず左上に配置する必要がある。その上で、opacitiyの値を指定すれば、ゆっくり表示される。

ただ、position:absoluteであれば、親要素(`.tab_body_area`)のwidthとheightを子要素はみ出してしまう。そのためborderを指定することはできない。

`.tab_body_content`に対して、`border`や`background`などを追加しても良いが、そうするとアニメーションの統一感がなくなり、返ってみすぼらしくなるので、あえてpaddingのみにした上で、枠と背景色を指定しないようにした。

<div class="img-center"><img src="/images/Screenshot from 2021-08-14 15-56-22.png" alt=""></div>


## タブを切り替えた時、左から右へゆっくり動いて表示

前項を元に、左から右へゆっくり動いて表示している。ついでに、ラベルの部分をホバーした時、左から右に背景色を塗りつぶしている。(参照:[CSS3を使用した簡単アニメーションの実装【transitionとtransform】](/post/css3-animation/))

HTMLは前項のそのままなので、CSSだけ載せる。


    .tab_radio {
        display:none;
    }
    .tab_label_area {
        overflow-X:auto;
        white-space:nowrap;
    }
    .tab_label {
        display:inline-block;
        border:solid 0.1rem black;
        padding:0.25rem 1rem;
        cursor:pointer;
        
        position:relative;
    }
    .tab_label::before{
        content:"";
        position:absolute;
        left:0;
        top:0;
        width:0;
        height:100%;
        background:orange;
        z-index:-1;
    }
    .tab_label:hover::before {
        width:100%;
        transition:0.5s;
    }
    .tab_body_area {
        position:relative;
    }
    .tab_body {
        position:absolute;
        left:-10rem;
    
        visibility:hidden;
        opacity:0;
    
        width:100%;
        transition:0.5s;
    }
    .tab_body_content {
        padding:0.5rem;
    }
    
    input[type="radio"]#tab_radio_1:checked ~ .tab_label_area > label[for="tab_radio_1"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_2:checked ~ .tab_label_area > label[for="tab_radio_2"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_3:checked ~ .tab_label_area > label[for="tab_radio_3"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_4:checked ~ .tab_label_area > label[for="tab_radio_4"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_5:checked ~ .tab_label_area > label[for="tab_radio_5"].tab_label { background:orange; }
    input[type="radio"]#tab_radio_6:checked ~ .tab_label_area > label[for="tab_radio_6"].tab_label { background:orange; }
    
    input[type="radio"]#tab_radio_1:checked ~ .tab_body_area > #tab_body_1 { visibility:visible;opacity:1;left:0;transition:0.5s; }
    input[type="radio"]#tab_radio_2:checked ~ .tab_body_area > #tab_body_2 { visibility:visible;opacity:1;left:0;transition:0.5s; }
    input[type="radio"]#tab_radio_3:checked ~ .tab_body_area > #tab_body_3 { visibility:visible;opacity:1;left:0;transition:0.5s; }
    input[type="radio"]#tab_radio_4:checked ~ .tab_body_area > #tab_body_4 { visibility:visible;opacity:1;left:0;transition:0.5s; }
    input[type="radio"]#tab_radio_5:checked ~ .tab_body_area > #tab_body_5 { visibility:visible;opacity:1;left:0;transition:0.5s; }
    input[type="radio"]#tab_radio_6:checked ~ .tab_body_area > #tab_body_6 { visibility:visible;opacity:1;left:0;transition:0.5s; }


もし、左側のコンテンツに表示が重なってしまうなどの場合は、`z-index`を指定するか、あるいは`left`の値を調整する。


## 結論

displayとtransitionではアニメーションは実現できない。そこで、visibilityとopacitiyとtransitionを使うことで対処している。

ただ、それだけではタブのボディは配置が思い通りになってくれないので、position:relativeとabsoluteを指定する。

それからのボーダーや背景色を指定しなければ、アニメーションらしくなる。

たかだかアニメーションを実装するだけでかなり大げさなコードになってしまったが、これ以外にタブシステムでアニメーションを実現する術がないようだ。JavaScriptを使うとさらに回りくどくなるので、アニメーションが本当に必要な場合に限って使うことで、なるべく保守を行いやすくしたほうが良いだろう。



