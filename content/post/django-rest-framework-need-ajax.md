---
title: "DjangoRestFrameworkは本当に必要なのか？【Restful化とAjaxでデータを送信するときの問題】"
date: 2022-02-26T08:40:27+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","restful","ajax" ]
---

## 結論

DjangoはデフォルトでRestfulに対応している(Ajaxを使ってPUT,DELETE,PATCHメソッドの送信ができる)。

ただし、PUT,DELETE,PATCHのリクエストボディを参照するのはやや複雑。

そのため、それらのメソッドを使ってリクエストを送信する場合、DRFを使ったほうが良い。

## 素のDjangoはRestfulに対応している

AjaxでPUT,DELETE,PATCHメソッドを送信する。基本、AjaxなしではPUT,DELETE,PATCHメソッドは送信できない。

Laravelなどの場合、formタグ内に特殊なタグをセットすることで、PUT,DELETE,PATCHメソッドを送信することができるが、Djangoはそうなってない。

だからAjaxを使う。

下記は40分簡易掲示板を元にDELETEメソッドを送信している。

### urls.py

    from django.urls import path
    from . import views
    
    app_name    = "bbs"
    urlpatterns = [ 
        path('', views.index, name="index"),
        path('<int:pk>/', views.index, name="single"),
    ]

DELETEメソッドを送信するため、主キーをURL内に含ませている。

### views.py

    from django.shortcuts import render
    
    from django.views import View
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Topic
    from .forms import TopicForm
    
    class IndexView(View):
    
        ## 中略 ##
    
        def delete(self, request, *args, **kwargs):
        
            json    = { "error":True }
    
            if "pk" not in kwargs:
                return JsonResponse(json)
    
            topic   = Topic.objects.filter(id=kwargs["pk"]).first()
    
            if not topic:
                return JsonResponse(json)
    
            topic.delete()
            json["error"]   = False
    
            return JsonResponse(json)
    
    index   = IndexView.as_view()


### JavaScript


    window.addEventListener("load" , function (){
        $(".trash").on("click", function(){ trash(this); });
    });
    
    function trash(elem){
    
        let form_elem   = $(elem).parent("form");
        let url         = $(form_elem).prop("action");
    
        $.ajax({
            url: url,
            type: "DELETE",
            dataType: 'json'
        }).done( function(data, status, xhr ) { 
            console.log(data);
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }); 
    }

URLに主キーを含ませ、DELETEメソッドを送信する。

これにより、DELETEメソッドが実行され、


## 素のDjangoでDELETE,PUT,PATCHメソッドのリクエストボディを参照する。

先のコードのJavaScriptを以下のように書き換える。

    window.addEventListener("load" , function (){
        $(".trash").on("click", function(){ trash(this); });
    });
    
    function trash(elem){
    
        let form_elem   = $(elem).parent("form");
        let url         = $(form_elem).prop("action");
    
        $.ajax({
            url: url,
            type: "DELETE",

            data: { "test":"aaaa" },  //ここを追加

            dataType: 'json'
        }).done( function(data, status, xhr ) { 
            console.log(data);
        }).fail( function(xhr, status, error) {
            console.log(status + ":" + error );
        }); 
    }


ビュー側はこのようにして読み取る。

    def delete(self, request, *args, **kwargs):

        json    = { "error":True }

        if "pk" not in kwargs:
            return JsonResponse(json)

        topic   = Topic.objects.filter(id=kwargs["pk"]).first()

        if not topic:
            return JsonResponse(json)

        topic.delete()
        json["error"]   = False

        #TODO:ここでリクエストボディの読み取り
        print(request.body)

        return JsonResponse(json)


出力される内容は下記。バイト文字列として出力される。

    b'test=aaaa'

複数の場合、こうなる。クエリストリング形式のようだ。

    b'test=aaaa&test2=bbb'

ちなみに、DELETEメソッドだからといって、`request.DELETE`は存在しない。下記のエラーが出る。

        print(request.DELETE)
    AttributeError: 'WSGIRequest' object has no attribute 'DELETE'

どうやらwsgiがDELETE属性を提供してくれていないようだ。

また、このバイト文字列は[FormData](/post/javascript-formdata-obj-set/)形式で送信した場合は更に複雑になる。

### バイト文字列を解析するには？

バイト文字列を解析するには、utf-8でデコードする必要がある。これで普通の文字列型になるので、後はsplitを使ってキーと値に分解していく。

    def delete(self, request, *args, **kwargs):
    
        json    = { "error":True }

        if "pk" not in kwargs:
            return JsonResponse(json)

        topic   = Topic.objects.filter(id=kwargs["pk"]).first()

        if not topic:
            return JsonResponse(json)

        topic.delete()
        json["error"]   = False

        #TODO:ここでリクエストボディの読み取り
        print(request.body)

        raw_data    = request.body.decode("utf-8")
        data_list   = raw_data.split("&")

        for data in data_list:
            data    = data.split("=")
            print("Key:",data[0], "Value:",data[1])

        return JsonResponse(json)

参照元:https://stackoverflow.com/questions/606191/convert-bytes-to-a-string



## 【結論】DjangoRestFramework と バイト文字列を読む方法 どちらが良いか。

このように、DRFなしでもリクエストボディを読むことはできるし、Restfulに対応させることもできる。

ただし、DRFを使った場合、このリクエストボディの読み込みはこうなる。

    def delete(self, request, *args, **kwargs):
    
        json    = { "error":True }

        if "pk" not in kwargs:
            return JsonResponse(json)

        topic   = Topic.objects.filter(id=kwargs["pk"]).first()

        if not topic:
            return JsonResponse(json)

        topic.delete()
        json["error"]   = False

        #ここでリクエストボディの読み取り
        """
        print(request.body)

        raw_data    = request.body.decode("utf-8")
        data_list   = raw_data.split("&")

        for data in data_list:
            data    = data.split("=")
            print("Key:",data[0], "Value:",data[1])
        """

        #DRFを使うと、request.dataから整形されたデータが手に入る。
        print(request.data)

        #バリデーションするときもrequest.POSTと同様に扱える。
        TopicForm(request.data)

        return JsonResponse(json)


このように、requestオブジェクトに属性が整形されたデータの属性が付与される。これにより、バリデーションもスムーズにできる。

もちろん、リクエストボディの読み取り処理の流れは全く同じなので、関数化するなどして、短く書く方法はある。

しかし、FormData形式で送信した場合、処理は全く異なるので、形式が違ってもデータが扱えるDRFのほうが有利ではなかろうか？


## ソースコード

https://github.com/seiya0723/startup_bbs_ajax_restful_not_use_drf

