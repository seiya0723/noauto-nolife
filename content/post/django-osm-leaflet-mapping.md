---
title: "DjangoでOpenStreetMap(OSM)とleaflet.jsを使ってマッピングアプリを作る"
date: 2021-11-15T17:57:22+09:00
draft: false
thumbnail: "images/Screenshot from 2021-11-16 08-47-12.png"
categories: [ "サーバーサイド" ]
tags: [ "django","マッピング","ウェブデザイン","leaflet.js" ]
---

<span style="color:red;font-size:0.9rem;font-weight:bold;">※この方法はDjangoでなくても実現できる。</span>

Djangoでマッピングを実現する方法としてGeoDjangoがある。だが、GeoDjangoは実装が容易ではなく、以前紹介した方法では実現できない事がわかった。

そこで、GeoDjangoよりも容易にマッピングを実現するため、オープンストリートマップ(以下、OSM)とleaflet.jsを使って対処する。

ソースコードは[40分Django](/post/startup-django/)をベースとしている。

## OSMとLeaflet.jsを実装させる

以下、実装手順を解説する。

### 緯度と経度を記録するモデルを作る

    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        lat         = models.DecimalField(verbose_name="緯度",max_digits=9, decimal_places=6)
        lon         = models.DecimalField(verbose_name="経度",max_digits=9, decimal_places=6)
   
        def __str__(self):
            return self.comment

緯度と経度はデータベースへ負担をかけないよう`DecimalField`を使ったが、JavaScript上で小数点以下の処理が煩雑になるので、`FloatField`でも良いだろう。

これをマイグレーションする。

### フォームクラスを作り、ビューでバリデーションをする

モデルを継承したフォームクラスを作り、ビュー側でそれを使ってバリデーションする。

まず、`forms.py`

    from django import  forms
    from .models import Topic
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "comment","lat","lon" ]
    
続いて`views.py`

    from django.shortcuts import render,redirect
    from django.views import View
    
    from .models import Topic
    from .forms import TopicForm
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("OK")
                form.save()
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()

これは以前解説した、[モデルを継承したフォームクラスを使ったバリデーション](/post/django-forms-validate/)と全く同じである。

### フロント側でJavaScriptを発動させる

`templates/bbs/index.html`を下記のようにする。

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
    
    <script>
        const topics = [
            {% for topic in topics %}
            { "lat":{{ topic.lat }},"lon":{{ topic.lon }},"comment":"{{ topic.comment }}" },
            {% endfor %}
        ]
    </script>
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
                    <form method="POST">
                        {% csrf_token %}
                        <input id="lat_input" type="text" name="lat" placeholder="緯度" required maxlength=9>
                        <input id="lon_input" type="text" name="lon" placeholder="経度" required maxlength=9>
                        <textarea class="form-control" name="comment"></textarea>
                        <input type="submit" value="送信">
                    </form>
                    {% for topic in topics %}
                    <div class="border">
                        <div>{{ topic.comment }}</div>
                    </div>
                    {% endfor %}
                </div>
            </div>
    
        </main>
    
        <script src="http://www.openlayers.org/api/OpenLayers.js"></script>
        <script>
            //マップの表示位置を指定(緯度・経度)
            MAP = L.map('map').setView([34.6217684, -227.2109985], 9);
    
            //地図データはOSMから読み込み
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(MAP);
    
            for (let topic of topics ){
                L.marker([topic["lat"], topic["lon"]]).addTo(MAP).bindPopup(topic["comment"]).openPopup();
            }
    
            //マウスクリックで緯度と経度の取得とポイント設置
            function map_click(e) {
                var marker = L.marker(e.latlng).addTo(MAP);
                console.log(e.latlng);

                $("#lat_input").val(Math.round(e.latlng["lat"]*1000000)/1000000);
                $("#lon_input").val(Math.round(e.latlng["lng"]*1000000)/1000000);
            }
            MAP.on('click', map_click);
        </script>
    
    </body>
    </html>
    
実践では、JavaScriptはHTMLに直接書かず、[staticディレクトリに配置する](/post/django-static-file-settings/)と良いだろう。CDNも同様にDLしてstaticディレクトリに配置したほうが良い。

## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-16 08-47-12.png" alt=""></div>

マップをクリックしてマーカーが表示された後、またクリックするとマーカーが2つになり、クリックのたびにどんどんマーカーが増えていく問題があるが、一応これでマッピングが機能する。

後は地図の検索機能などを入れるとより使いやすくなるだろう。

観光地や飲食店のレビューであれば、[モデルに画像フィールドを追加](/post/django-fileupload/)すればよい。

## 結論

思っていたよりも簡単にマッピング系ウェブアプリが実現できた。

後は地図の見た目や挙動を工夫する必要がある。英語ではあるが、leaflet.jsのドキュメントを読むと良いだろう。

https://leafletjs.com/reference.html

指定した領域を囲んだりすることも、マーカーのデザインを変えることもできるようだ。

ちなみに、現時点ではマーカーをクリックするとその数だけマーカーが増えていく。前にクリックしたマーカーを消したい場合は下記を参照。

[【Leaflet.js】地図をクリックしてマーカーを配置した時、古いマーカーを削除する](/post/leaflet-marker-delete/)



<!--

## ソースコード

https://github.com/seiya0723/map_bbs
-->

