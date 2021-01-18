---
title: "【日付入力】flatpickrの実装方法(ロケール日本語化、日時入力対応化)"
date: 2020-12-24T16:37:31+09:00
draft: false
thumbnail: "images/Screenshot from 2021-01-18 10-36-24.png"
categories: [ "web" ]
tags: [ "ウェブデザイン","JavaScript","初心者向け" ]
---


ウェブアプリを開発していると、避けて通ることができない日付もしくは日時入力。HTMLの`SELECT`タグを使用しても良いが、うるう年に対応させないといけないし、何よりユーザビリティに問題がある。

そんな時、flatpickrを実装すれば、日時入力が非常に簡単になる。しかもjQueryに依存していないので、流行のvue.jsなどを使いたい場合にも有効。

## flatpickrの実装方法

まずHTML。flatpickrのCDNを指定する。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
        
        <!--日本語化用JS-->
        <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>
        <script src="script.js"></script>
    
    </head>
    <body>
    
        <input id="date" type="text" readonly>
        <input id="time" type="text" readonly>
    
        <input id="dt" type="text" readonly>
    
    </body>
    </html>


続いて`flatpickr`を発動させるための`script.js`


    window.addEventListener("load" , function (){ 
    
        var config_date = { 
            "locale": "ja"
        }   
        var config_time = { 
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            "locale": "ja"
        }   
        var config_dt = { 
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            "locale": "ja"
        }   
    
    
        flatpickr("#date", config_date);
        flatpickr("#time", config_time);
        
        var config_dt = { 
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            "locale": "ja"
        }
    
        flatpickr("#dt",config_dt)
    
    });


`flatpickr`を読み込むことで、`flatpickr()`関数をJS内で実行させることができる。第一引数は要素名、第二引数は設定。

## 結論

<div class="img-center"><img src="/images/Screenshot from 2021-01-18 10-36-24.png" alt="flatpickrを実装"></div>


