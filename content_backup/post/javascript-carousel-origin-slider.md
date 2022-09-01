---
title: "【jQuery】ボタン式の横スライダーを自作する【通販サイト・コンテンツ共有サイトなどに】"
date: 2021-09-26T03:09:45+09:00
draft: false
thumbnail: "/images/Screenshot from 2021-09-27 11-57-15.png"
categories: [ "フロントサイド" ]
tags: [ "javascript","jQuery","HTML5","CSS3","ウェブデザイン","上級者向け" ]
---

通販サイトなどでよくある。横スクロール型のスライダーを作る。slick.jsなどを使えば簡単に実現できるが、かえって複雑なので、自作した。

## ソースコード

HTML。jQueryを読み込み、別途JavaScriptとCSSを読み込む。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Hello World test!!</title>
    
        <!--jquery読み込み-->
    	<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
    	<script src="script.js"></script>
    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
        
        <div class="preview_control_area">
            <div class="data_preview_area">
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー1</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー2</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー3</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー4</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー5</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー6</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー7</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー8</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー9</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー10</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー11</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー12</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー13</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー14</div></div>
            </div>
            <div class="control_button previous_button">Prev</div>
            <div class="control_button next_button">Next</div>
        </div>
    
    </body>
    </html>


CSS。

    /* slider system */
    .data_preview_area {
        font-size:0;
        margin:0.5rem 0;
        overflow-x:auto;
        white-space:nowrap;
        word-break: break-all;
    
        /* スクロールバーの除去 Edge,Firefox*/
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    /* スクロールバーの除去 Chrome Safari */
    .data_preview_area::-webkit-scrollbar {
        display:none;
    }
    .data_preview_frame {
        font-size:1rem;
        width:calc(100% / 5); 
        display:inline-block;
        white-space:normal;
        vertical-align:middle;
    }
    .data_preview_content {
        display:block;
        margin:0 0.5rem;
    
        font-weight:bold;
        overflow-y:hidden;
    }
    
    
    /* ボタン装飾 */
    .preview_control_area {
        position:relative;
    }
    .previous_button {
        position:absolute;
        top:50%;
        left:0;
        transform:translateY(-50%);
    }
    .next_button {
        position:absolute;
        top:50%;
        right:0;
        transform:translateY(-50%);
    }
    .control_button {
        background:white;
        border:solid 0.1rem black;
        border-radius:0.25rem;
        padding:0.5rem;
        margin:0 0.25rem;
        cursor:pointer;
    
        opacity:0.25;
        transition:0.2s;
    }
    .control_button:hover {
        background:black;
        color:white;
    
        opacity:0.8;
        transition:0.2s;
    }
    
    /* スマホ・タブレット表示時に*/
    @media (max-width:800px){
        /* 1ページに表示する個数で割る */
        .data_preview_frame {
            width:calc(100% / 3); 
        }   
    
        /* スマホ表示時、ボタンは画面幅を圧迫するので、消す */
        .control_button {
            display:none;
        }
    
        /* スクロールバーをデフォルトに。 */
        .data_preview_area {
            -ms-overflow-style: auto;
            scrollbar-width: auto;
        }
        .data_preview_area::-webkit-scrollbar {
            display:initial;
        }
    }


まず、1ページに表示するコンテンツは`display:inline-block;`を指定。横並びにさせる。はみ出したらスクロールバーを表示している。ただ、後続の`overflow-style`や`scrollbar-width`でスクロールバーを見た目上、非表示にさせる。スクロールの機能はさせているが非表示の状態。これで見栄えが良くなる。

HTML上では改行を行っているので、`.data_preview_frame`間ではスペースが表示される。このスペースはHTMLのフォントサイズに依存しているので、`font-size:0`としている。

ボタンを配置する。親要素に`position:relative;`、子要素のボタンに`position:absolute;`を指定。`top`と`left`と`transition:translateY()`で配置を調整。`opacity`で半透明にしている。


続いて、JavaScript

    window.addEventListener("load" , function (){
    
        //クリックした時、scroll()を実行する。押された要素(this)とブーリアン値(NextとPrevを見分ける)を引数にする。
        $(".previous_button").on("click",function(){ scroll(this,false); });
        $(".next_button").on("click",    function(){ scroll(this,true); });
    });
    //scroll関数
    function scroll(elem,next){
    
        /* クリックされた箇所のスクロールする要素を抜き取る */
        let target  = $(elem).siblings(".data_preview_area");
    
        let all_width       = target.get(0).scrollWidth;
        let single_width    = target.outerWidth();
        let position_width  = target.scrollLeft();
    
        //先頭、末端までスクロールしたら、それぞれ戻る、進むができないように(jQueryアニメーション遅延問題)
        if ( (next) && ( all_width > single_width + position_width ) ){
            target.animate({ scrollLeft:"+=" + String(single_width) } , 300);
        }
        else if ( (!next) && ( 0 < position_width ) ){
            target.animate({ scrollLeft:"-=" + String(single_width) } , 300);
        }
    }

ボタンをクリックした時、左右にスクロールバーが動く。表示はされてないがスクロールの機能はしている状態なので、問題無く動く。

jQueryの`animate`メソッドを使用してゆっくり時間をかけてスクロールバーが動くように仕立てている。ただし、ここでボタンを連打してしまうとスクロールが動かなくなってしまう問題があるので、一定以上のスクロール位置になった場合、それ以上スクロールしない(`animate`メソッドを実行しない)ようにしている。これで、連打されても大丈夫。

スマホ表示時、画面を横表示にされてしまうと、1ページ当たりの横幅が変わる。そのため、ボタンが押された時に、その都度横幅を取得して、ページ移動するようにした。

## 動かすとこうなる。

ボタンを押すことで、左右にスライドする。

<div class="img-center"><img src="/images/Screenshot from 2021-09-27 11-24-46.png" alt="スライダーが表示された"></div>

コンテンツの画像などを表示させると、より通販のそれっぽく見えるだろう。

スクロールバーを消しているので、PCではコンテンツクリックの邪魔にならないし、見栄えも良くなっている。


## 結論

カルーセル使用にしたいのであれば、1ページに表示する個数に応じて冒頭と末尾に追加をする。

ボタンがコンテンツに覆いかぶさって邪魔だと感じる場合は、コンテンツエリア外に配置すると良いだろう。必要に応じてボタンも大きくしたほうが良い。下記を参照


### display:flexで左右にボタン配置させる

HTML。ボタンの記載位置を変えるだけ。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>

        <!--jquery読み込み-->
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>

        <script src="script.js"></script>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        
        <div class="preview_control_area">
            <div class="control_button previous_button">Prev</div>
            <div class="data_preview_area">
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー1</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー2</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー3</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー4</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー5</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー6</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー7</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー8</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー9</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー10</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー11</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー12</div></div>
                <div class="data_preview_frame"><div class="data_preview_content">データのプレビュー13</div></div>
            </div>
            <div class="control_button next_button">Next</div>
        </div>
    </body>
    </html>


CSS。`display:flex`に仕立てる。

    /* slider system */
    
    /* ボタン装飾 */
    .preview_control_area {
        display:flex;
        align-items: stretch;
    }
    .data_preview_area {
    
        /* button_width * 2 */
        width:calc(100% - 3rem*2);
    
        font-size:0;
        margin:0.5rem 0;
        overflow-x:auto;
        white-space:nowrap;
        word-break: break-all;
    
        /* スクロールバーの除去 Edge,Firefox*/
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    /* スクロールバーの除去 Chrome Safari */
    .data_preview_area::-webkit-scrollbar {
        display:none;
    }
    .data_preview_frame {
        font-size:1rem;
        width:calc(100% / 5); 
        height:100%;
        display:inline-block;
        white-space:normal;
        vertical-align:middle;
    }
    .data_preview_content {
        display:block;
        margin:0 0.5rem;
    
        font-weight:bold;
        overflow-y:hidden;
    }
    
    
    /* ボタン装飾 */
    .control_button {
        /* button_width */
        width:3rem;
    
        background:white;
        border:solid 0.1rem black;
        border-radius:0.25rem;
        padding:0.5rem;
        margin:0 0.25rem;
    
        cursor:pointer;
        transition:0.2s;
    
        display:flex;
        justify-content: center;
        align-items: center;
    }
    .control_button:hover {
        background:black;
        color:white;
        transition:0.2s;
    }
    
    /* スマホ・タブレット表示時に*/
    @media (max-width:800px){
        /* 1ページに表示する個数で割る */
        .data_preview_frame {
            width:calc(100% / 3); 
        }   
    
        /* スマホ表示時、ボタンは画面幅を圧迫するので、消す */
        .control_button {
            display:none;
        }
    
        /* スクロールバーをデフォルトに。 */
        .data_preview_area {
            width:100%;
    
            -ms-overflow-style: auto;
            scrollbar-width: auto;
        }
        .data_preview_area::-webkit-scrollbar {
            display:initial;
        }
    }

ボタン領域の`width`を指定して、`calc`で計算。`aling-items:stretch`を使用して高さを調整、height:100%でコンテンツの高さを限界まで広げる。

スマホ表示時はボタンがなくなるので、`width:100%`を指定して調整。

動かすとこうなる。てきとうにBRタグを追加してもボタンは`stretch`で追随するからスライダーの領域がどこまでかすぐにわかる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-27 11-57-15.png" alt="ボタン固定式のスライダー"></div>

[NextとPrevの部分はFontawesomeを使えば](/post/startup-fontawesome/)さらに見栄えが良くなるだろう。

