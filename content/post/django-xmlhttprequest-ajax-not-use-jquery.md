---
title: "【VanillaJS】素のJavaScriptのXMLHttpRequest(Ajax)で通信する【jQuery不使用】"
date: 2022-09-01T09:17:45+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","JavaScript","Ajax" ]
---

## CSRFトークンを取得する

POSTメソッドを送信する時必要になるCSRFトークン。

前もって取得しておく。下記コードをページロードと同時に実行する。

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }   
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');


ちなみに、このコードはDjango公式からの受け売りである。

https://docs.djangoproject.com/en/4.0/ref/csrf/

## POSTメソッドを送信する

前項で取得したCSRFトークンをリクエストヘッダにセットして送信する。

    window.addEventListener("load" , function (){
    
        let submit  = document.querySelector("#submit");
        submit.addEventListener( "click", function(){ send(); } );
    
    });
    
    function send(){
    
        let form_elem   = "#form_area";
        let form        = document.querySelector(form_elem);
    
        let data    = new FormData( form );
        let url     = form.getAttribute("action");
        let method  = form.getAttribute("method");
    
        for (let v of data ){ console.log(v); }
    
        const request = new XMLHttpRequest();
        console.log(csrftoken);
    
        //送信先とメソッドの指定
        request.open(method,url);
    
        //ヘッダにCSRFトークンをセットする。
        request.setRequestHeader("X-CSRFToken", csrftoken);
    
        //送信(内容)
        request.send(data);
    
        //成功時の処理
        request.onreadystatechange = function() {
            if( request.readyState === 4 && request.status === 200 ) {
                json    = JSON.parse(request.responseText);
    
                //投稿内容の描画
                let content_area        = document.querySelector("#content_area");
                content_area.innerHTML  = json["content"];
    
            }
        }
    }


FormDataの中にCSRFトークンが含まれている場合はセットしなくても問題はないが、状況によっては含まれない場合もあるので、前もってヘッダにCSRFトークンをセットしておく。

下記も参照すると良いだろう。

[FormDataをformタグではなく、オブジェクトにキーと値をセットした上でAjax送信](/post/javascript-formdata-obj-set/)

レスポンスを受け取ったら、投稿内容を描画する。

## サーバーサイド(Django)の処理

ビューはAjaxを使用した場合と全く変わらない。

    from django.shortcuts import render
    from django.views import View
    
    from django.http.response import JsonResponse
    from django.template.loader import render_to_string
    
    from .models import Topic
    from .forms import TopicForm
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            json    = { "error":True }
            form    = TopicForm(request.POST)
    
            print(request.POST)
    
            if not form.is_valid():
                print("Validation Error")
                print(form.errors)
                return JsonResponse(json)
    
            form.save()
            json["error"]   = False
    
            topics          = Topic.objects.all()
            context         = { "topics":topics }
            content         = render_to_string("bbs/content.html",context,request)
    
            json["content"] = content
    
            return JsonResponse(json)
    
    index   = IndexView.as_view()



