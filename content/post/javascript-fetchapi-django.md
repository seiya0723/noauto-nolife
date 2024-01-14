---
title: "【Django】JavaScriptのfetchAPIでリクエストを送る【XMLHttpRequest、jQuery.Ajax、axiosはもう古い？】"
date: 2024-01-14T21:13:50+09:00
lastmod: 2024-01-14T21:13:50+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "サーバーサイド" ]
tags: [ "JavaScript","Django" ]
---

XMLHttpRequestはAjaxの初期のAPIでちょっとコードが長くて複雑。jQuery.ajaxはjQuery離れが深刻で、そもそもjQueryは重い。axiosはXHRやjQueryよりも優秀であるが、ライブラリなのでインストールが必要。

では、何でAjaxを実装すれば良いか。

FetchAPIである。

軽量で簡潔に書ける上に、CORSに対応しており、なおかつインストールは不要。できればこれからはFetchAPIを使うほうが良いだろう。

本記事では、DjangoでFetchAPIを使ってPOSTメソッドのリクエストを送信してみた。

## テンプレート

```
{% load static %}

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>簡易掲示板</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
</head>
<body>

    <main class="container">
        {# ここが投稿用フォーム #}
        <form id="form" action="" method="POST">
            {% csrf_token %}
            <textarea class="form-control" name="comment"></textarea>
            <input id="submit" type="button" value="送信">
        </form>


        <div id="content_area">
            {% include 'bbs/content.html' %}
        </div>

    </main>

    <script src="{% static 'bbs/js/script.js' %}"></script>
</body>
</html>
```

下記 content.htmlをレンダリングしている。

```
{% for topic in topics %}
<div class="border">{{ topic.comment }}</div>
{% endfor %}
```

## script.js


```
window.addEventListener("load" , function (){

    const submit    = document.querySelector("#submit");
    submit.addEventListener( "click", () => { send(); } );

});
const send  = () => {

    // フォームの要素を取得
    const form      = document.querySelector("#form");

    const body      = new FormData(form);
    const url       = form.getAttribute("action");
    const method    = form.getAttribute("method");

    // fetchを使用してPOSTリクエストを送信
    fetch( url, { method , body } )
    .then( response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then( data => {
        if (!data.error){
            const content_area      = document.querySelector("#content_area");
            content_area.innerHTML  = data.content;
        }
    })
    .catch( error => {
        console.log(error);
    });

}
```


## views.py

JsonResponseが使える。

```
# == This code was created by https://noauto-nolife.com/post/django-auto-create-views/ == #

from django.shortcuts import render,redirect
from django.views import View

from django.http.response import JsonResponse
from django.template.loader import render_to_string

from .models import Topic
from .forms import TopicForm

class IndexView(View):

    def get(self, request, *args, **kwargs):
        context = {}
        context["topics"] = Topic.objects.all()

        return render(request, "bbs/index.html", context)

    def post(self, request, *args, **kwargs):

        data    = { "error": True }
        form    = TopicForm(request.POST)

        if form.is_valid():
            print("保存")
            form.save()
        else:
            print(form.errors)


        context = {}
        context["topics"]   = Topic.objects.all()

        data["content"]     = render_to_string("bbs/content.html", context, request)
        data["error"]       = False

        return JsonResponse(data)

index   = IndexView.as_view()
```

## ソースコード

https://github.com/seiya0723/django-fetchapi


