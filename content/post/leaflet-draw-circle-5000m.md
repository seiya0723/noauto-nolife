---
title: "【Leaflet.js】半径5km圏内の領域に円を描画する【circle】"
date: 2022-05-01T19:50:53+09:00
draft: false
thumbnail: "images/leaflet.jpg"
categories: [ "フロントサイド" ]
tags: [ "leaflet.js","JavaScript" ]
---


半径5km圏内に円を描画する。これで指定したポイントからの距離がつかめる。

## HTML

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>コメント付きマップ</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==" crossorigin=""></script>
    
        <script src="script.js"></script>
    
    <style>
    #map {
        height:90vh;
    }
    </style>
    
    </head>
    <body>
    
        <h1 class="bg-success text-white text-center">コメント付きマップ</h1>
    
        <main>
    
            <div class="row mx-0">
                <div class="col-sm-6">
                    <div id="map"></div>
                </div>
                <div class="col-sm-6">
                    <input id="set_gps" type="button" value="GPSを使って入力">
    
                    <form method="POST">
                        {% csrf_token %}
                        <input id="lat_input" type="text" name="lat" placeholder="緯度" required maxlength=9>
                        <input id="lon_input" type="text" name="lon" placeholder="経度" required maxlength=9>
                        <textarea class="form-control" name="comment"></textarea>
                        <input type="submit" value="送信">
                    </form>
                </div>
            </div>
        </main>
    </body>
    </html>
    

## JavaScript

    window.addEventListener("load" , function (){
    
        //マップの表示位置を指定(緯度・経度)
        MAP     = L.map('map').setView([34.6217684, -227.2109985], 9);
        MARKER  = null;
        CIRCLE  = null;
    
        //地図データはOSMから読み込み
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(MAP);
    
        //マウスクリックで緯度と経度の取得とポイント設置
        function onMapClick(e) {
            set_marker(e.latlng["lat"],e.latlng["lng"]);
    
        }
        MAP.on('click', onMapClick);
    
    });
    function set_marker(lat,lon){
    
        if (MARKER){
            MAP.removeLayer(MARKER);
        }
        if (CIRCLE){
            MAP.removeLayer(CIRCLE);
        }
    
        MARKER  = L.marker([lat, lon]).addTo(MAP);
    
        //地図上に画像を配置する。マーカーと同様に初期化しない限り残ってしまう問題がある点に注意。
        //半径5000メートルの領域に円を描画する
        CIRCLE  = L.circle([lat, lon], {radius: 5000}).addTo(MAP);
    
    
        $("#lat_input").val(Math.round(lat*1000000)/1000000);
        $("#lon_input").val(Math.round(lon*1000000)/1000000);
    }



## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-05-01 19-58-06.png" alt=""></div>


