---
title: "【Django】Ajaxを使ってOSMとLeaflet.jsでマーカーを配置させる"
date: 2021-11-23T08:12:55+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","ajax","マッピング","ウェブデザイン" ]
---


Ajaxを使うことで、ページ全体を再レンダリングしなくてもデータの投稿ができるようになる。これをOSMとLeaflet.jsを使ったマッピングに使うことで、データの投稿がとてもスムーズになる。

Ajaxに関しては[DjangoでAjax(jQuery)を実装、送信と同時に投稿内容を確認する【Django Rest Framework不使用版】](/post/django-ajax/)を、OSMとLeaflet.jsは[DjangoでOpenStreetMap(OSM)とleaflet.jsを使ってマッピングアプリを作る](/post/django-osm-leaflet-mapping/)を使用し、それぞれを組み合わせて実現させる。

今回は、よりシンプルに仕立てるため、GET文のみAjax化させる。


## settings.pyの設定で静的ファイルを読み込みする

[【Django】テンプレートからstaticディレクトリに格納したCSSやJSを読み込む【静的ファイル】](/post/django-static-file-settings/)に書いてあるとおり、AjaxのためのJavaScript関係のファイルを読み込むため、settings.pyに以下を追記

    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/3.1/howto/static-files/
    
    STATIC_URL = '/static/'
    
    #↓追加
    STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]

続いて、`mkdir`コマンドでディレクトリを作る。

    mkdir -p static/bbs/js/

これで準備完了。

## index.html

Ajaxを使用するために、jQueryとCSRFトークンを送信するajax.js(今回はPOST文のAjaxを使用しないので、無くても良い)、script.jsを読み込んでいる。

    {% load static %}
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
    
    
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="{% static 'bbs/js/ajax.js' %}"></script>
        <script src="{% static 'bbs/js/script.js' %}"></script>
    
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
                    <form id="form_area" action="{% url 'bbs:mapping' %}" method="POST">
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
            var map = L.map('map').setView([34.6217684, -227.2109985], 9);
    
            //地図データはOSMから読み込み
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
    
            //マウスクリックで緯度と経度の取得とポイント設置
            function onMapClick(e) {
                var marker = L.marker(e.latlng).addTo(map);
                //console.log(e.latlng);
                $("#lat_input").val(Math.round(e.latlng["lat"]*1000000)/1000000);
                $("#lon_input").val(Math.round(e.latlng["lng"]*1000000)/1000000);
            }
            map.on('click', onMapClick);
        </script>
    
    </body>
    </html>

[以前のOSMとLeaflet.jsを使用したコード](/post/django-osm-leaflet-mapping/)では、scriptタグ内に直接DTLを書いていたが、Ajaxを使用してGET文を送信、レスポンスとして得られるjsonのデータを使用してマーカーを配置する。

マーカーを書く処理はscript.js内に書いた。


## script.js


    window.addEventListener("load" , function (){
        map_load();
    });
    
    
    //マップのデータをGET文で手に入れる
    function map_load(){
    
        let form_elem   = "#form_area";
    
        let url     = $(form_elem).prop("action");
        let method  = "GET";
    
        $.ajax({
            url: url,
            type: method,
            processData: false,
            contentType: false,
            dataType: 'json'
        }).done( function(data, status, xhr ) {
    
            console.log(data.topics);
            map_draw(data.topics);
    
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        });
    }
    
    //マップにマーカーを描画
    function map_draw(topics){
    
        console.log("マップドロー")
    
        for (let topic of topics ){
            L.marker([topic["lat"], topic["lon"]]).addTo(map).bindPopup(topic["comment"]).openPopup();
        }
    
    }

ページが読み込みされると同時にAjaxでGET文を送信。受け取ったjsonデータをmapdrawに引き渡して、マーカーを配置する。


## views.py

2つのビュークラスがある。

ひとつは、ページを表示するBbsView、もう一つはマップの読み込みと書き込みをするMappingView

    from django.shortcuts import render,redirect
    from django.views import View
    
    from .models import Topic
    from .forms import TopicForm
    
    from django.http.response import JsonResponse
    
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
    index   = BbsView.as_view()
    
    class MappingView(View):
    
        def get(self, request, *args, **kwargs):
    
            #辞書型のリスト型に仕立てる。
            topics  = list(Topic.objects.all().values())
        
            #contextと同じように辞書型にさせる
            json    = { "topics":topics }
            return JsonResponse(json)
    
        def post(self, request, *args, **kwargs):
    
            form    = TopicForm(request.POST)
    
            if form.is_valid():
                print("OK")
                form.save()
    
            return redirect("bbs:index")
    
    mapping = MappingView.as_view()


ajaxを動作させるためには、JsonResponseを実行して辞書型を返却しなければならない。モデルオブジェクトをそのまま返却するとJsonResponseは失敗してしまう。だから

    #辞書型のリスト型に仕立てる。
    topics  = list(Topic.objects.all().values())

このように辞書型のリスト型に仕立てることで、JsonResponseを実行できるようにさせる。

マップデータの保存は、もともとBbsViewにあったpostメソッドをMappingViewに移動しただけ。

## bbs/urls.py

最後にurls.py。MappingViewとBbsViewの2つを登録している。

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [
        path('', views.index, name="index"),
        path('mapping/', views.mapping, name="mapping"),
    ]

これで完成。

イメージとしては、ビューとテンプレートとJavaScriptを行き来して地図を表示させている。


## 動かすとこうなる。

挙動は以前のものと変わらないが、環境によってはscriptタグ内にDTLを入れても発動しない問題があるので、これで解決できる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 09-48-56.png" alt="動く"></div>


## 結論

環境が許せば、[前回のコード](/post/django-osm-leaflet-mapping/)のほうが容易に実装できるだろう。ただ、今回でAjaxを実装したので、投稿時にもAjaxを実装させよりスムーズな表示が期待できる。


## ソースコード



