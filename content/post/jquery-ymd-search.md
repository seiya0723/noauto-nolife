---
title: "【jQuery】selectタグで年月日検索をする【うるう年対応】"
date: 2022-02-15T16:14:29+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","jQuery" ]
---


年月日検索をする時、年だけ、月だけ指定して検索する場合がある。この場合、年月日全てを指定する[flatpickr](/post/flatpickr-install/)では対応できない。

この場合はselectタグを使用して検索をする。だが、月ごとに日数は異なる。うるう年では2月は29日になる。それに対応させるためには、JavaScriptを書く必要がある。

本記事ではjQueryを使用して、なるべく短く年月日検索を行うselectタグを作る。


## HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Hello World test!!</title>
    
    	<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
    	<script src="script.js"></script>
    </head>
    <body>
    
        <select id="year"  name="year" ></select>
        <select id="month" name="month"></select>
        <select id="day"   name="day"  ></select>
    
    </body>
    </html>

## JavaScript

script.jsにて、


    window.addEventListener("load" , function (){
    
        $("#year" ).on("input", function(){ day_change(); });
        $("#month").on("input", function(){ day_change(); });
    
        $("#year" ).html('<option value="">--</option>');
        $("#month").html('<option value="">--</option>');
        $("#day"  ).html('<option value="">--</option>');
    
        for (let i=2000;i<2030;i++){
            $("#year" ).append('<option value="' + String(i) + '">' + String(i) + '</option>');
        }
        for (let i=1;i<13;i++){
            $("#month").append('<option value="' + String(i) + '">' + String(i) + '</option>');
        }
        for (let i=1;i<=31;i++){
            $("#day"  ).append('<option value="' + String(i) + '">' + String(i) + '</option>');
        }
    
    });
    
    function day_change(){
    
        //うるう年は4の倍数。うるう年の場合は2月は29日に指定
        //月ごとの日数は下記の通り
        let day_list    = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    
        let year        = $("#year" ).val();
        let month       = $("#month").val();
    
        //うるう年かどうか判定。2月を29日に変更
        if ( year%4 == 0 ){
            day_list[1] = 29;
        }
    
        //dayを初期化
        $("#day").html('<option value="">--</option>');
    
        //指定した月の日数分だけ選択肢を作る
        for (let i=1;i<=day_list[month-1];i++){
            $("#day").append("<option value=" + String(i) + ">" + String(i) + "</option>");
        }
    
    }



## 動かすとこうなる。

ちゃんとうるう年の2月は29日になる

<div class="img-center"><img src="/images/Screenshot from 2022-02-15 16-28-37.png" alt=""></div>

## 結論

実践ではidにyearやmonth等をセットするのは避けたほうが良いだろう。

thisで特定して日付をセットしなければ、idが重複してしまい正常に動作しなくなる。

また、Djangoなどのフレームワークを使用している場合、テンプレート言語で選択肢をレンダリングできるため、JavaScriptの冒頭の選択肢の作成部分は不要になる。

