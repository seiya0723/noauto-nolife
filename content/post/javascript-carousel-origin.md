---
title: "【jQuery】HTML、CSS、JS合わせて100行以内でカルーセルを自作する【自動スライド】"
date: 2021-08-31T14:22:18+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery","ウェブデザイン" ]
---

カルーセルと言えば、slick.js等のライブラリがあるが、たかだか自動的にスライドするだけのシンプルなカルーセルをサイトの一部分に実装させるためだけにライブラリをインストールさせるのはやや大げさだ。

そこで、今回はカルーセルをjQueryを使用した上で自作する。書く必要のあるコードはHTMLが約30行、CSSが約20行、JSが約40行の合計100行足らずで実現できる。

## ソースコードと解説

HTML。CDNのjQueryを読み込む。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>カルーセル</title>
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
        <script src="script.js"></script>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
    
        <!--font-size:0;を使用しない場合、DTLのspacelessのタグを使って改行を除去する。-->
        <div class="news_area">
            <div id="news_slide_area" class="news_slide_area">
                <div class="news">ニュース1</div>
                <div class="news">ニュース2</div>
                <div class="news">ニュース3</div>
                <div class="news">ニュース4</div>
                <div class="news">ニュース5</div>
            </div>
        </div>
    
    </body>
    </html>

続いてCSS。20行もいらない。

    .news_area {
        margin:2rem;
        border:solid 0.25rem black;
        background:orange;
        overflow:hidden;
        white-space:nowrap;

        /* HTML改行時のWhiteSpaceを除去 */
        font-size:0rem;
    }
    .news_slide_area {
        position:relative;
    }
    .news {
        width:100%;
        font-size:2rem;
        display:inline-block;
    }

ニュースの部分を横一列に並べるため、`display:inline-block`を採用。続いて、`white-space:nowrap`で改行せずに親要素をはみ出すように仕立てる。親要素ははみ出したら`overfrow:hidden`に基づき非表示に仕立てる。

また、先ほどのHTMLのように.newsの部分がひとつずつ改行されている場合、white-spaceの分だけスペースが含まれる。故に`font-size:0`として横一列で表示される要素と要素の間にスペースが表示されないようにした。

`.news_slide_area`はニュースを表示させるため、実際に動く部分。ここにJavaScriptを使用して`left`を指定し、ずらしてニュースを表示。`.animate()`はずらす際にゆっくりずらしてあたかも右から左へ流れていくように仕立てる。そのため、`position:relative;`を指定しておいた。もっとも、`left`じゃなくても`transform:translate()`とかでも良いが。


JS(jQuery)。

    window.addEventListener("load" , function (){ 
        news_area();
    });
    
    function news_area(){
    
        //スライド領域、子要素を手に入れる。
        let slide_area  = $("#news_slide_area");
        let children    = slide_area.children();
        
        //1つめの子要素(ニュース)をクローンして最後尾に追加する
        slide_area.append(children.first().clone());
    
        var amount      = children.length + 1;
        var count       = 0;
    
        //1秒おきに100%ずつ追加加算してずらす。
        function slide(){
            count++;
            var slide_range = String(-(count%amount)*100) + "%";
    
            //最後の要素(コピーの要素)になったらすぐに最初に戻す。
            $("#news_slide_area").animate({"left":slide_range}, 500 , function() { endcheck(); } );
        }   
        function endcheck(){
            if (count%amount === amount-1){
                $("#news_slide_area").css({"left":"0"});
                count   = 0;
            }
        }   
    
        setInterval(slide, 5000);
    }

`setInterval()`を使用して、徐々に左へ左へと`.news_slide_area`をずらしていく。

問題は、最後のニュース5を表示して、次にニュース1を表示する時、`left`を0に持っていかないといけないので、一気に左から右へと動くことだ(`left`の値が-1000%などから500ミリ秒かけて一気に0になる)。似たような状況のカルーセルになっているサイトも多々あるので、容認できる人はいいが、私は無理なので、最初の要素(ニュース1)を末尾(ニュース5)の後に追加コピーしている。

コピーされたニュース1をアニメーションで表示した次の瞬間に、アニメーションを使用せずに`left`を0に持っていく。これで、あたかも常に右から左へ流れていく無限カルーセルに仕立てることができる。

## 結論

これを作る前に、意地でもJSを使うまいと思ってCSSだけで実現させようとしたが、子要素の数がデータ量に応じて変化する以上、keyframesとanimationではやや役不足感が否めないと感じ、JSで書いた。

例えばDjangoであれば、headタグに直接カルーセルのCSSを子要素の数に応じてDTLで表現することもできるが、かえって保守が難しくなると思われる。故に、今回はあえてJS(jQuery)を使った。

