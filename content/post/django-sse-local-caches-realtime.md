---
title: "DjangoでServerSentEvents(SSE)とローカルメモリキャッシュを使い、リアルタイムでDB内の情報を表示する"
date: 2024-11-26T17:17:26+09:00
lastmod: 2024-11-26T17:17:26+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","SSE","JavaScript" ]
---

## 【前置き】Djangoでリアルタイム通信する場合

DjangoでDB内の情報をリアルタイムで表示させる場合、

- ポーリング
- Server Sent Events
- Web Socket

この3つが候補に挙がる。

ポーリングはシンプルではあるが、リクエストを送らない限り、情報は得られない。

[【Django】Ajax(jQuery)でロングポーリングを実装させる【チャットサイトの開発に】](/post/django-ajax-long-polling/)

WebSocketは実装難度が高い。

[【Django】channelsを使ってWebSocketを実現させる【チャットサイト開発に】](/post/startup-django-channels-web-socket/)

そこで、サーバー側からレスポンスを送り続ける、Server Sent Eventsを使う。

更に、キャッシュサーバーとしてローカルキャッシュを使い、DBへの負荷を低減させる。

## Server Sent Events(SSE) とは？

SSEは、サーバー側がテキストデータを連続でレスポンスする仕組みのこと。

クライアント側(JavaScript)がテキストデータを元に、ページをレンダリングする。

簡単に言うと、下記記事でリアルタイムでウェブカメラの映像を表示させたが、これがテキストデータのレスポンスに変わり、JavaScriptが加わったようなもの。

[【Django】任意のタイミングでサーバーのカメラでライブ配信する【imutils.video.VideoStreamer】](/post/django-livestreamer-custom/)

## 実装


### settings.py 

キャッシュサーバーの設定をする。

```
CACHES = { 
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }   
}
```

この LocMemCache はDjangoの中に含まれるもので、追加のインストールは不要。

メモリ空間内にキャッシュされたデータを保存する。電源が切れると揮発する。

### views.py


```
from django.shortcuts import render,redirect

from django.views import View
from .models import Topic
from .forms import TopicForm

class IndexView(View):

    def get(self, request, *args, **kwargs):
        return render(request,"bbs/index.html")

    def post(self, request, *args, **kwargs):

        form    = TopicForm(request.POST)

        if form.is_valid():
            form.save()
        else:
            print(form.errors)

        return redirect("bbs:index")

index   = IndexView.as_view()


from django.core.cache import cache
from django.http import StreamingHttpResponse
import json
import time

def generate_sse():
    while True:
    
        # 60秒間キャッシュする。
        topics = cache.get('topics')
        if not topics:
            topics = Topic.objects.all()
            cache.set('topics', topics, timeout=60)

        #topics = Topic.objects.all()

        dic_topics = []

        for topic in topics:
            dic = {}
            dic["id"]       = topic.id
            dic["comment"]  = topic.comment

            dic_topics.append(dic)

        yield f"data: { json.dumps( {'contents': dic_topics} ) }\n\n"

        time.sleep(1)

# ↑ は60秒経つまでキャッシュは更新されない
# そこで、データの保存・削除を検知して即キャッシュをし直すようにする。
# ↓ のようにsignalを使う 

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Topic)
def update_cache_on_save(sender, instance, **kwargs):
    topics = Topic.objects.all()
    cache.set('topics', topics, timeout=60)

@receiver(post_delete, sender=Topic)
def update_cache_on_delete(sender, instance, **kwargs):
    topics = Topic.objects.all()
    cache.set('topics', topics, timeout=60)


class TopicStreamView(View):
    def get(self, request, *args, **kwargs):
        return StreamingHttpResponse(
            generate_sse(), content_type="text/event-stream"
        )

topic_stream = TopicStreamView.as_view()
```


まず、ServerSentEventsのサーバー部分。

```
from django.core.cache import cache
from django.http import StreamingHttpResponse
import json
import time

def generate_sse():
    while True:
    
        # 60秒間キャッシュする。
        topics = cache.get('topics')
        if not topics:
            topics = Topic.objects.all()
            cache.set('topics', topics, timeout=60)

        #topics = Topic.objects.all()

        dic_topics = []

        for topic in topics:
            dic = {}
            dic["id"]       = topic.id
            dic["comment"]  = topic.comment

            dic_topics.append(dic)

        yield f"data: { json.dumps( {'contents': dic_topics} ) }\n\n"

        time.sleep(1)


class TopicStreamView(View):
    def get(self, request, *args, **kwargs):
        return StreamingHttpResponse(
            generate_sse(), content_type="text/event-stream"
        )

topic_stream = TopicStreamView.as_view()

```

TopicStreamViewが実行されるとき、`generate_sse` 関数が動く。

この`generate_sse`関数は while ループの実行たびに、yeild を使ってその都度データを返す。

TopicStreamView はループのたびに返されるデータを、StreamingHttpResponse を使ってクライアントへレスポンスする。

whileループのたびにDBへアクセスを繰り返しているようではDBに負荷がかかる。そこで、キャッシュを利用する。

```
        # 60秒間キャッシュする。
        topics = cache.get('topics')
        if not topics:
            topics = Topic.objects.all()
            cache.set('topics', topics, timeout=60)
```

このキャッシュにより、ほぼ60秒おきにDBへのアクセスが発生するようになる。

しかし、60秒の間にDBが更新されると、更新が即座に反映されない。

そこでシグナルを使う。

このコードはDBの保存(書き込み・編集)、削除を検知し、キャッシュをし直している。

```
from django.core.cache import cache

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Topic)
def update_cache_on_save(sender, instance, **kwargs):
    topics = Topic.objects.all()
    cache.set('topics', topics, timeout=60)

@receiver(post_delete, sender=Topic)
def update_cache_on_delete(sender, instance, **kwargs):
    topics = Topic.objects.all()
    cache.set('topics', topics, timeout=60)
```

シグナルを使ってキャッシュを更新。更新したキャッシュをレスポンスできるようになった。


### urls.py

```
from django.urls import path
from . import views

app_name    = "bbs"
urlpatterns = [
    path('', views.index, name="index"),
    path('topic_stream/', views.topic_stream, name="topic_stream"),

]
```

### index.html

```
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
        <form method="POST">
            {% csrf_token %}
            <textarea class="form-control" name="comment"></textarea>
            <input type="submit" value="送信">
        </form>

        <div id="topic_area"></div>

    </main>

    <script>
        // サーバーからのSSEストリームを受け取る
        const eventSource = new EventSource("{% url 'bbs:topic_stream' %}");

        // メッセージを受信した際の処理
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data.contents);

            const area          = document.querySelector("#topic_area");
            area.innerHTML  = "";

            for ( topic of data.contents ){
                const div = document.createElement("div");
                div.textContent = `${topic.id} : ${topic.comment}`;
                area.appendChild(div);
            }
        };
        // エラー処理
        eventSource.onerror = () => {
            console.error("Error occurred while connecting to SSE stream.");
        };
    </script>


</body>
</html>
```

このJavaScriptで、View側から StreamingHttpResponse されているデータを受け取っている。

EventSourceのオブジェクトをつくる。引数はURL

```
new EventSource("{% url 'bbs:topic_stream' %}");
```

```
        eventSource.onmessage = (event) => {
            // 受信したときの処理
        }
        eventSource.onerror = () => {
            // エラー処理
        }
```

onmessage は StreamingHttpResponse を受け取ったときに発動する。

JSONで得られるため、オブジェクトに変換し、データをレンダリングしている。

この部分はReactを実装すれば、Stateに与えるだけで済むだろう。


## 実際に動かしてみる。

今回、Ajaxは実装していないので、管理サイトかもう一つ同じページを別タブで開いて投稿する。

するとこのように、更新ボタンを押していないのに投稿内容がほぼリアルタイムで反映されている。

<div class="img-center"><img src="/images/Screenshot from 2024-11-27 10-16-53.png" alt=""></div>


## 結論

今回はあくまでもSSEとキャッシュサーバーの実装を目的として実装した。

実運用をするのであれば、ここにAjax(axiosかfetchAPIか)を加えてデータの書き込みをする必要がある。

更に、レンダリングのHTMLをJavaScriptで作っているため、ここは

- Django側でレンダリングして、render_to_string で返す
- ReactのStateで管理して、レンダリングする

などの対策も必要だ。

更にリアルタイム性を追求するのであれば、負荷を低減させるため、プロセス単位ではなく、サーバー単位でメモリが共有されるRedisの実装も考える。

また、SSEではなく、WebSocketの実装も視野に入れたい。

[DjangoでWebSocketを使って、チャットサイトを作る](/post/django-websocket-chatsite/)


## ソースコード

https://github.com/seiya0723/django-sse-cache


