---
title: "【Leaflet.js】地図をクリックしてマーカーを配置した時、古いマーカーを削除する"
date: 2021-12-02T14:43:40+09:00
draft: false
thumbnail: "images/leaflet.jpg"
categories: [ "フロントサイド" ]
tags: [ "leaflet.js","JavaScript" ]
---

以前紹介したLeaflet.js+OSMでマッピングアプリを作る記事

[DjangoでOpenStreetMap(OSM)とleaflet.jsを使ってマッピングアプリを作る](/post/django-osm-leaflet-mapping/)

では、2度以上地図をクリックすると、前にクリックして配置されたマーカーが残ってしまう問題があった。そこで、今回はこの古いマーカーを削除して、新しくクリックされた位置にマーカーを配置させる。

## ソースコード

要するに、マーカーを配置したときのメソッドの返り値をグローバル変数に代入し、その変数があれば、消せば良いのだ。


    //マップの表示位置を指定(緯度・経度)
    var map = L.map('map').setView([34.6217684, -227.2109985], 9);

    //予めグローバル変数として定義しておく
    var marker;

    //マウスクリックで緯度と経度の取得とポイント設置
    function onMapClick(e) {

        //マーカーの指定があれば消す
        if (marker){
            map.removeLayer(marker);
        }

        //マーカーを配置(その時、markerに代入)
        marker = L.marker(e.latlng).addTo(map);

        //テキストエリアに緯度と経度を代入(ここは本記事とは関係ない)
        console.log(e.latlng);
        $("#lat_input").val(Math.round(e.latlng["lat"]*1000000)/1000000);
        $("#lon_input").val(Math.round(e.latlng["lng"]*1000000)/1000000);
    }
    map.on('click', onMapClick);

これで良い。メソッドの`.removeLayer()`の引数にマーカー変数を代入する。ただ、その時、if文でmarkerが空ではないことをチェックする。

これで前に1回でもクリックされた事があれば、そのマーカーを消し、新しく地図にマーカーを配置する。

## 結論

Leaflet.jsは非常に強力なマッピング系JavaScriptライブラリではあるものの、いかんせん情報が英語に限られているため扱いづらい。

本件はstackoverflowからの受け売りである。if文を追加して少し加工した。

参照元:https://stackoverflow.com/questions/9912145/leaflet-how-to-find-existing-markers-and-delete-markers

