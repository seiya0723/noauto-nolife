---
title: "【Leaflet.js】クリックした地図上に画像を配置する【overlays】"
date: 2022-05-01T18:49:01+09:00
draft: false
thumbnail: "images/leaflet.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","leaflet.js" ]
---


用途がいまいち思いつかないが、leaflet.jsでは地図上に画像を描画する事ができる。

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
    
        MARKER  = L.marker([lat, lon]).addTo(MAP);
    
    
        //地図上に画像を配置する。マーカーと同様に初期化しない限り残ってしまう問題がある点に注意。
        let url            = 'nautilus.png';
        let bound          = [[lat+0.2,lon+0.2], [lat, lon]];
        let overlay        = L.imageOverlay(url, bound);
        overlay.addTo(MAP);
    
    
        $("#lat_input").val(Math.round(lat*1000000)/1000000);
        $("#lon_input").val(Math.round(lon*1000000)/1000000);
    }


boundに表示する領域を指定する。あまり大きすぎる値を指定すると、表示される画像も大きくなってしまう点に注意。


## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2022-05-01 19-01-19.png" alt=""></div>

マーカーと同様に配置した画像はそのまま配置されっぱなしなので、削除する必要がある。

## 結論

地図に何かしらマーキングする時に使うぐらいだろう。

leaflet.jsにはダイアログのような物を表示させる仕組みはないので、投稿画像を表示するのであれば、投稿されている箇所までスクロールするよう、JSで調整をしたほうが良いかもしれない。


