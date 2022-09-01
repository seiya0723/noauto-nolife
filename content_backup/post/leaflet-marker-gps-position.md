---
title: "【OSM+leaflet.js】ブラウザからGPS(位置情報)を取得し、マーカーを配置させる"
date: 2022-04-01T19:24:47+09:00
draft: false
thumbnail: "images/leaflet.jpg"
categories: [ "フロントサイド" ]
tags: [ "マッピング","leaflet.js" ]
---

ブラウザから位置情報を取得し、leaflet.jsでマーカーを配置させる。

## index.html

今回は、leaflet.jsを外部のファイルにまとめた。こうすることでleaflet.jsの追加機能を組みやすくなると思う。

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

## script.js

マップクリック時のマーカー配置はそのままに、位置情報の取得を行い、マーカーを配置させる。

マーカーとマップはグローバル変数として扱う。そのため変数名を大文字にした。


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
    
            console.log(e.latlng["lat"]);
            console.log(e.latlng["lng"]);
            
            set_marker(e.latlng["lat"],e.latlng["lng"]);
    
        }
        MAP.on('click', onMapClick);
    
        $("#set_gps").on("click",function(){ get_location(); });
    
    });
    
    function set_marker(lat,lon){
    
        if (MARKER){
            MAP.removeLayer(MARKER);
        }
    
        MARKER  = L.marker([lat, lon]).addTo(MAP);
    
        $("#lat_input").val(Math.round(lat*1000000)/1000000);
        $("#lon_input").val(Math.round(lon*1000000)/1000000);
    }
    function get_location(){
    
        function setLocation(pos){
            // 緯度・経度を取得
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;
    
            console.log(lat);
            console.log(lon);
    
            //この経度、360度でマイナスする。
            set_marker(lat,lon-360);
        }
    
        // エラー時に呼び出される関数
        function showErr(err){
            switch(err.code){
                case 1 : alert("位置情報の利用が許可されていません"); break;
                case 2 : alert("デバイスの位置が判定できません"); break;
                case 3 : alert("タイムアウトしました"); break;
                default : alert(err.message);
            }
        }
        
        // geolocation に対応しているか否かを確認
        if("geolocation" in navigator){
    
            //ここでGPSにアクセスしている(取得までにタイムラグがある。)
            let opt = {
                "enableHighAccuracy": true,
                "timeout": 10000,
                "maximumAge": 0,
            };
            navigator.geolocation.getCurrentPosition(setLocation, showErr, opt);
        }else{
            alert("ブラウザが位置情報取得に対応していません");
        }
    
    }


## 動かすとこうなる。

こんなふうに位置情報取得のダイアログが出るので、許可を押す。

緯度と経度がテキストボックスに表示され、マーカーが配置される。

<div class="img-center"><img src="/images/Screenshot from 2022-04-01 21-34-02.png" alt=""></div>

## 結論

PCから位置情報を取得しているからか、やや精度が甘いような気がする。

『みちびき』に対応したデバイス(最新のスマホ等)であればピンポイントでマーカーを配置してくれると思う。

これを応用すれば、カーナビ用途に使えるかも知れない。

参照元:https://www.systemexpress.co.jp/htmlcss/geolocation.html

