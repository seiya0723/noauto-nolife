---
title: "【Django】任意の順番で並び替えて表示させる【Sortable.js + FetchAPI 】"
date: 2024-03-30T20:58:10+09:00
lastmod: 2024-03-30T20:58:10+09:00
draft: false
thumbnail: "images/Screenshot from 2024-03-31 10-06-29.png"
categories: [ "サーバーサイド" ]
tags: [ "Django","JavaScript","JavaScriptライブラリ","FetchAPI" ]
---



データを一覧で並べる時、並び順を任意に変更させたいときがある。

そういう時、sortable.jsを使えば良い。

[JavaScriptで並び替えをするならSortable.js【jQuery不要のライブラリ】](/post/javascript-sortablejs/)

しかし、並び替えた順番をDBに記録する場合は、別途対応が必要だ。

- モデルに並び替えの順番を記録するフィールドを追加
- 並び替えた順番を送信する(FetchAPIによるリクエスト)
- 別途ビューを作り、並び替えを記録する


本記事では、いつもの[40分Django](/post/startup-django/)を元に解説をする。

## モデル

IntegerFieldを追加しておく。

```
from django.db import models

class Topic(models.Model):

    comment     = models.CharField(verbose_name="コメント",max_length=2000)
    sort        = models.IntegerField(verbose_name="並び順")
```


## テンプレート

sortable.jsとFetchAPIを用意しておく。


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

        {# ここが投稿されたデータの表示領域 #}
        <table class="table">
            <thead>
                <tr>
                    <th>id</th>
                    <th>コメント</th>
                </tr>
            </thead>
            <tbody class="sort_area">
                {% for topic in topics %}
                <tr>
                    <td class="topic_id">{{ topic.id }}</td>
                    <td>{{ topic.comment }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

        <form action="{% url 'bbs:sort' %}" method="post">
            {% csrf_token %}
            <input class="sort_submit" type="button" value="順番確定">
        </form>

    </main>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script>

// sortable.jsの有効化。
const sort_areas    = document.querySelectorAll(".sort_area");
for (const area of sort_areas ){
    new Sortable(area, {
        animation: 150,
        ghostClass: 'dragging',
        onEnd: () => { console.log("ソート完了"); },
    });
}


// 並び替えのリクエスト送信
const sort_submit   = document.querySelector(".sort_submit");
sort_submit.addEventListener("click", (event) => {

    // 送信ボタンから直近の親要素を取得
    const form      = event.currentTarget.closest("form");
    const body      = new FormData(form);

    // 並び順を取得し、FormDataにappendする(同一のキーに複数の値を与えるため)
    const topic_ids     = document.querySelectorAll(".topic_id");
    for (const topic_id of topic_ids){
        body.append("id", topic_id.textContent);
    }

    const url       = form.getAttribute("action");
    const method    = form.getAttribute("method");

    // fetchAPIを使用してPOSTリクエストを送信
    fetch( url, { method , body } )
    .then( response => {
        // レスポンスのステータスコードが200番代ではないとき、↓を実行。
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then( data => {
        location.reload();
    })
    .catch( error => {
        console.log(error);
    });
});
</script>


</body>
</html>
```

### sortable.js を使う

sortable.jsは並び替えをしたい要素の親要素を指定する。

今回の場合、trタグをまとめているtbodyタグをSortableに指定。


```
const sort_areas    = document.querySelectorAll(".sort_area");
for (const area of sort_areas ){
    new Sortable(area, {
        animation: 150,
        ghostClass: 'dragging',
        onEnd: () => { console.log("ソート完了"); },
    });
}
```

他の要素に対しても同様のSortableを使用する可能性も考慮し、今回はクラス名を使用した。

onEndプロパティに、並び替えを終えた後の処理を追加できるが、今回はここでFetchAPIを呼び出さないようにした。(並び替えするたびにリクエストが発生してしまうため)

もし、並び替えを1回でもやったら、即DBに保存。という体裁を取りたい場合は、onEndで次の項のFetchAPIを呼び出すと良いだろう。

### FetchAPIを使ってリクエストを送信


```
// 並び替えのリクエスト送信
const sort_submit   = document.querySelector(".sort_submit");
sort_submit.addEventListener("click", (event) => {

    // 送信ボタンから直近の親要素を取得
    const form      = event.currentTarget.closest("form");
    const body      = new FormData(form);

    // 並び順を取得し、FormDataにappendする(同一のキーに複数の値を与えるため)
    const topic_ids     = document.querySelectorAll(".topic_id");
    for (const topic_id of topic_ids){
        body.append("id", topic_id.textContent);
    }

    const url       = form.getAttribute("action");
    const method    = form.getAttribute("method");

    // fetchAPIを使用してPOSTリクエストを送信
    fetch( url, { method , body } )
    .then( response => {
        // レスポンスのステータスコードが200番代ではないとき、↓を実行。
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then( data => {
        location.reload();
    })
    .catch( error => {
        console.log(error);
    });
});
```

送信ボタンの直近の親要素から、formタグを取得。(`event.currentTarget.closest("form")`)

formタグ内の`csrf_token`をFormDataにセット、`topic_id`の値を上から順にidをキーにして与える。

formタグのaction属性とmethod属性の値をそれぞれ取得。

FetchAPIを発動。




### ビュー


```
from django.shortcuts import render,redirect
from django.http.response import JsonResponse

from django.views import View
from .models import Topic

class IndexView(View):

    def get(self, request, *args, **kwargs):

        topics  = Topic.objects.order_by("sort")

        context = { "topics":topics }

        return render(request,"bbs/index.html",context)

    def post(self, request, *args, **kwargs):

        posted  = Topic( comment = request.POST["comment"] )
        posted.save()

        return redirect("bbs:index")

index   = IndexView.as_view()



class SortView(View):
    def post(self, request, *args, **kwargs):

        ids = request.POST.getlist("id");

        for index,id in enumerate(ids):
            topic       = Topic.objects.filter(id=id).first()
            topic.sort  = index
            topic.save()

        return JsonResponse({})

sort    = SortView.as_view()
```

`.getlist()`で並び替えたTopicのidのリストを取得。並び順通りに`.filter()`で取得し、sortフィールドに番号をふる。

保存をすると、一番上に表示させたいデータには`0`が、一番下に表示させたいデータには、一番大きい値が与えられる。


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2024-03-31 10-06-29.png" alt=""></div>





## ソースコード

https://github.com/seiya0723/django-sortable


