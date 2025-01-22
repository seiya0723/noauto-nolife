---
title: "DRF(Django REST Framework)+Ajax(jQuery)で画像とファイルをアップロードする方法"
date: 2020-12-01T17:06:20+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","restful","ajax" ]
---


本記事では、DRF(Django REST Framework)とAjaxを使用して画像とファイルを非同期でアップロードする方法をまとめる。

コードは[Djangoで画像及びファイルをアップロードする方法](/post/django-fileupload/)から引用している。外見はほとんど変わっていない。


## テンプレートとJSのコード

まずテンプレート。下記は`image.html`

{% load static %}

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>画像アップロードのテスト</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="{% static 'upload/js/ajax.js' %}"></script>
        <script src="{% static 'upload/js/img_send.js' %}"></script>
    </head>
    <body>
    
        <h1 class="bg-primary text-center text-white">画像アップロードのテスト</h1>
        
        <main class="container">
            
            <p><a href="{% url 'upload:document' %}">ファイルのアップロードはこちら</a></p>
    
            <form id="upload_form" method="POST" enctype="multipart/form-data">
                {% csrf_token %}
                <input type="file" name="photo" required>
                <input id="submit" class="form-control" type="button" value="送信">
            </form>
    
            <div id="content_area">
                {% include "upload/image_content.html" %}
            </div>
          
        </main>
    
    
    </body>
    </html>

`include`する`image_content.html`は下記

    {% for content in data %}
    <div class="my-2">
        <img class="img-fluid" src="{% url 'upload:index' %}media/{{ content.photo }}" alt="投稿された画像">
    </div>
    {% endfor %}


続いて、JS。JSはフォームから抜き取ったデータをviews.pyにAjaxで飛ばしている


    $(function (){
        $("#submit").on("click", function(){ ajax_send(); });
    });
    
    function ajax_send(){
    
        var fd          = new FormData( $("#upload_form").get(0) );
    
        $.ajax({
            url: "",
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            dataType: 'json'
        }).done( function(data, status, xhr ) { 
            $("#content_area").html(data.content);
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        });
    
    }


CSRF対策のため、事前に`{% csrf_token %}`をJSで飛ばしておくことを忘れずに。本コードでは`ajax.js`がそれに当たる。


## ビューとシリアライザのコード

views.pyは送られた画像データを処理する。ファイル保存用のクラスは省略する

    from django.shortcuts import render
    
    from rest_framework import status,views,response
    from django.views import View
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import PhotoList,DocumentList
    from .serializer import PhotoListSerializer,DocumentListSerializer
    
    import magic
    
    ALLOWED_MIME    = [ "application/pdf" ]
    
    
    class PhotoView(views.APIView):
        def get(self, request, *args, **kwargs):
    
            data        = PhotoList.objects.all()
            context     = {"data":data}
    
            return render(request,"upload/image.html",context)
    
        def post(self, request, *args, **kwargs):
    
            serializer      = PhotoListSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
    
            data        = PhotoList.objects.all()
            context     = {"data":data}
            content_data_string     = render_to_string('upload/image_content.html', context ,request)
            json_data               = { "content" : content_data_string }
    
            return JsonResponse(json_data)
    
    index   = PhotoView.as_view()
    
シリアライザを呼び出し、JSONオブジェクトを解析、そこからバリデーションを行った上でデータを保存する。後は、`image_content.html`をレンダリングしてJSON形式でレスポンスを返す。フロントのJSはこれを解析して、投稿された画像を即反映させる。

処理途中で呼び出すシリアライザは下記。

    from rest_framework import serializers 
    
    from .models import PhotoList,DocumentList
    
    class PhotoListSerializer(serializers.ModelSerializer):
    
        class Meta:
            model = PhotoList
            fields  = ["photo"]


ファイル保存のクラスはこちらも省略してある。シリアライザの書き方はforms.pyとほぼ同様なので特筆するべき点はないだろう。既に普通のDRFを実装していればすぐにわかる。



## 結論

~~今回は1つの画像やファイルだけを送信するためJSは上記のようになったが、通常の文字列データ、複数のファイルや画像を同時に送信する際にはこれではうまく行かないのでJSの修正が必要である点に注意。~~

↑普通に複数の画像やファイル、文字列データもまとめて送信できるようです。ただし、まとめて送信するためには送信する要素がformタグ内に無いとダメですが。


いずれにしても、やっていることは通常のDRF+Ajax(jQuery)と変わりはない。シリアライザを経由してJSONデータを解析、メディアファイルを保存し、DBにデータを記録する。

## ソースコード

https://github.com/seiya0723/django-fileupload-restful



