---
title: "EasyTimer.jsを使ってストップウォッチとタイマーを作る"
date: 2022-10-16T20:06:51+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","JavaScriptライブラリ","ウェブデザイン" ]
---


以前、下記記事でストップウォッチとタイマーを作ったが、

[JavaScript(jQuery)でストップウォッチとタイマーを作る【勉強や運動の記録などに】](/post/javascript-stopwatch-and-timer/)

使いにくい。

だから、タイマーとストップウォッチのライブラリを実装する。

かなり軽量で、イベントのセットもできるEasyTimer.jsを使う。



## ストップウォッチの実装


### HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>ストップウォッチ</title>
    
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    
        <script src="https://cdn.jsdelivr.net/npm/easytimer@1.1.1/dist/easytimer.min.js"></script>
        <script src="script.js"></script>
    
    </head>
    <body>
    
        <div>
            <input class="start" type="button" value="開始">
            <input class="pause" type="button" value="一時停止">
            <input class="stop"  type="button" value="停止">
        </div>
    
        <div class="time"></div>
    
    </body>
    </html>
    

### JavaScript
    
    window.addEventListener("load" , function (){ 
    
        let timer   = new Timer();
    
        $(".start").on("click",function(){ timer.start(); }); 
        $(".pause").on("click",function(){ timer.pause(); }); 
        $(".stop" ).on("click",function(){ timer.stop();  }); 
    
        timer.addEventListener('secondsUpdated', function (e) {
            $(".time").html(timer.getTimeValues().toString());
        }); 
    
    
    });
    

## タイマーの実装


### HTML

ストップウォッチと同じ

### JavaScript

    window.addEventListener("load" , function (){
    
        let timer   = new Timer();
    
        $(".start").on("click",function(){ timer.start({countdown: true, startValues: {seconds: 30}}); });
        $(".pause").on("click",function(){ timer.pause(); });
        $(".stop" ).on("click",function(){ timer.stop();  });
    
        timer.addEventListener('secondsUpdated', function (e) {
            $(".time").html(timer.getTimeValues().toString());
        });
    
        timer.addEventListener('targetAchieved', function (e) {
            console.log("時間が経ちました。");
        });
    
    });
    
    
## 結論

驚いたのは、ストップウォッチとタイマーのHTMLを同じにしても問題なく動作するということだ。

HTMLを別々に書く必要が無くなる。

しかも、時間が経った時などのイベントも用意されている。これに音を鳴らすなどの機能を追加すれば、十分実用できる。

公式: https://albert-gonzalez.github.io/easytimer.js/
