---
title: "【VanillaJS】Djangoで素のJavaScriptのXMLHttpRequest(Ajax)を使ってリクエストを送信【jQuery不使用】"
date: 2022-09-01T09:17:45+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","JavaScript","Ajax" ]
---


<!--
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

-->

## POSTメソッドを送信する

前項で取得したCSRFトークンをリクエストヘッダにセットして送信する。


```
window.addEventListener("load" , () => {

    const submit    = document.querySelector("#submit");
    submit.addEventListener( "click", () => { send(); });

});

const send = () => {

    const form_elem     = "#form_area";
    const form          = document.querySelector(form_elem);

    const data      = new FormData( form );
    const url       = form.getAttribute("action");
    const method    = form.getAttribute("method");

    // formタグ内のデータを確認。
    for (let v of data ){ console.log(v); }

    const request   = new XMLHttpRequest();

    //送信先とメソッドの指定
    request.open(method,url);

    // formタグ内にcsrf_tokenが含まれているため不要。
    //console.log(csrftoken);
    //request.setRequestHeader("X-CSRFToken", csrftoken);

    //送信(内容)
    request.send(data);

    //成功時の処理
    request.onreadystatechange = () => {
        if( request.readyState === 4 && request.status === 200 ) {
            json    = JSON.parse(request.responseText);

            //投稿内容の描画
            const content_area      = document.querySelector("#content_area");
            content_area.innerHTML  = json["content"];

        }
    }

}
```

FormDataの中にCSRFトークンが含まれている場合はセットしなくても問題はないが、状況によっては含まれない場合もあるので、前もってヘッダにCSRFトークンをセットしておく。

下記も参照すると良いだろう。

[FormDataをformタグではなく、オブジェクトにキーと値をセットした上でAjax送信](/post/javascript-formdata-obj-set/)

レスポンスを受け取ったら、投稿内容を描画する。

## サーバーサイド(Django)の処理

ビューはAjaxを使用した場合と全く変わらない。

```
from django.shortcuts import render
from django.views import View

from django.http.response import JsonResponse
from django.template.loader import render_to_string

from .models import Topic
from .forms import TopicForm

class IndexView(View):

    def get(self, request, *args, **kwargs):

        context             = {}
        context["topics"]   = Topic.objects.all()

        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):
        data    = { "error":True }
        context = {}
        
        form    = TopicForm(request.POST)

        if not form.is_valid():
            print("Validation Error")
            print(form.errors)
            return JsonResponse(json)

        form.save()
        data["error"]   = False

        context["topics"]   = Topic.objects.all()
        data["content"]     = render_to_string("bbs/content.html",context,request)

        return JsonResponse(data)

index   = IndexView.as_view()
```


### 結論

昨今では、これよりもより短く書くことができる、fetchAPIなるものが主流になりつつある。

そこで、今回のXMLHttpRequestを使った方法はここまでとしておく。

### ソースコード

https://github.com/seiya0723/django-xmlhttprequest


