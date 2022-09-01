---
title: "【Leaflet.js】オリジナルのアイコン画像を使用して、地図上に表示させる【飲食店のマッピングであれば食べ物の画像を使って視認性UP】"
date: 2021-12-06T06:51:00+09:00
draft: false
thumbnail: "images/Screenshot from 2021-12-06 13-06-48.png"
categories: [ "サーバーサイド" ]
tags: [ "JavaScript","leaflet.js","マッピング","Django" ]
---

`Leaflet.js`をそのまま使うと、配置されるマーカーはどこにでもあるような普通のマーカーになる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-06 13-08-51.png" alt=""></div>

これでは、どれも同じマーカーなので、パッと見でなにを意味しているのかはわからない。

例えば、飲食店のレビューサイトを投稿するウェブアプリとして、寿司屋でも、ラーメン屋でも、カレー屋でも、皆同じ青色の普通のマーカーになってしまう。寿司屋であれば寿司っぽいアイコンを、ラーメン屋であればラーメンっぽいアイコンを使うことで、視覚的に何の店がどこに配置されているのかわかるようになる。

そのためには、アイコンを独自に設定しなければならない。本記事では予め用意しておいたマーカーのアイコンを使用して、オリジナルのマーカーを地図上に表示させる方法を解説する。


## アイコンの準備

まず、記事サムネイルの寿司(玉子)の画像だが、これは下記フリー素材サイトから手に入れている。

https://opengameart.org/content/cc0-food-icons

ゲーム系の画像を提供しているサイトであれば、このような画像アイコンが手に入るので、気に入ったものがあれば使うと良いだろう。

今回はマッピングのアイコンとして使用するので、画像サイズは上記のような32x32ぐらいが妥当だと思われる。

## アイコンの読み込み

下記のようにJavaScriptを書く。コードは『[DjangoでOpenStreetMap(OSM)とleaflet.jsを使ってマッピングアプリを作る](/post/django-osm-leaflet-mapping/)』から。

    //マップの表示位置を指定(緯度・経度)
    var map = L.map('map').setView([34.6217684, -227.2109985], 9);

    //地図データはOSMから読み込み
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //オリジナルのアイコンを作る
    var myIcon = L.icon({
        iconUrl: "{% static 'bbs/img/tamago.png' %}",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, 0],
    });

    //予め定義しておく
    var marker;

    //マウスクリックで緯度と経度の取得とポイント設置
    function onMapClick(e) {

        //マーカーの指定があれば消す
        if (marker){
            map.removeLayer(marker);
        }
        //ここでアイコンを指定
        marker = L.marker(e.latlng , {icon : myIcon}).addTo(map);
    }
    map.on('click', onMapClick);

`.icon()`メソッドを使用し、引数としてアイコンのパスやサイズ等をまとめたオブジェクトを指定。これをmyIconとする。

マーカーを配置する際、第一引数に緯度経度、第二引数にアイコンを指定する。これで独自にアイコンを指定したマーカーが配置される。


## 応用例

このように予めアイコンのオブジェクトを作っておき、マーカーを配置する時にアイコンオブジェクトを指定する。

だから、複数の種類のアイコンを指定するには、[1対多のリレーションを組み](/post/django-models-foreignkey/)、マーカーの一覧をIDをキーとして呼び出しできる形式にすると良いだろう。


    from django.db import models
    
    class Icon(models.Model):
    
        img         = models.ImageField(verbose_name="アイコン",upload_to="icon/")
        name        = models.CharField(verbose_name="アイコンの名前",max_length=20)
    
        def __str__(self):
            return self.name
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        lat         = models.DecimalField(verbose_name="緯度",max_digits=9, decimal_places=6)
        lon         = models.DecimalField(verbose_name="経度",max_digits=9, decimal_places=6)
        icon        = models.ForeignKey(Icon,verbose_name="アイコン",on_delete=models.CASCADE)
    
        def __str__(self):
            return self.comment
    

結果的にこういったマップが出来上がる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-06 14-04-55.png" alt=""></div>

## 結論

アイコンを自由に指定できれば、後は画像とアイデア次第で視認性の向上が期待できる。応用例のように1対多でリレーションを組んでもいいし、乱数を使用してランダムにマーカーを配置しても良いだろう。

ただ、あんまりやりすぎるとかえって見づらくなるので、色や形ぐらいは多少は統一しても良いかと思われる。


## ソースコード

応用編のマーカーアイコンを1対多でリレーションを組んだものを公開する。

https://github.com/seiya0723/mapping_origin_icon

