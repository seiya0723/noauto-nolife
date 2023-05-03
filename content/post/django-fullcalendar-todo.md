---
title: "Djangoでfullcalendar.jsを使いTodoアプリを作る"
date: 2023-05-03T21:13:16+09:00
lastmod: 2023-05-03T21:13:16+09:00
draft: false
thumbnail: "images/Screenshot from 2023-05-03 21-12-55.png"
categories: [ "サーバーサイド" ]
tags: [ "Django","JavaScript" ]
---


fullcalendar.jsを早速実践運用してみた。

まだまだ足りない箇所は有るかもしれないが、ここから徐々に発展させ、ゆくゆくはReactと組み合わせてSPAを作りたいところだ。

詳細はソースコードを見ていただきたい。これまでのDjangoとほとんど変わりはないので、記事内ではfullcalendar.jsの部分だけまとめる。

## テンプレート

index.html

```
{% load static %}

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Todoリスト</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">


    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>


    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.6/index.global.min.js"></script>

    {# TODO:カレンダーには、やってないデータだけ表示する。#}
    <script>
        const events =
            [
                        // イベントごとに装飾を施す
                        // https://fullcalendar.io/docs/event-object
                        {% for todo in todos %}
                        {
                                    id:"{{ todo.id }}",
                                    title:"{{ todo.content }}",
                                    start:"{{ todo.deadline|date:'Y-m-d' }}",
                                    backgroundColor: {% if not todo.done %}"deepskyblue"{% else %}"gray"{% endif %}, //進捗状況に応じて色分けできる
                                    borderColor: "white"
                        },
                        {% endfor %}
                ]
    </script>


    <script src="{% static 'todolist/js/script.js' %}"></script>

</head>
<body>

    <main class="mx-2">
        {# ここが投稿用フォーム #}

        <div class="row mx-0">
            <div class="col-md-6">
                <div id='calendar' style=""></div>
            </div>
            <div class="col-md-6">
                <form method="POST">
                    {% csrf_token %}
                    <input name="deadline" type="text" readonly>
                    <textarea class="form-control" name="content"></textarea>
                    <input type="submit" value="送信">
                </form>

                {# TODO: ここはタブシステムを使って完了と未完を表示切り替えする。 #}
                {# https://noauto-nolife.com/post/css3-tab-system/ #}
                {% for todo in todos %}
                <div id="todo_{{ todo.id }}" class="border">
                    <div>期限: {{ todo.deadline }}</div>
                    <div>やること: {{ todo.content }}</div>
                    <form class="text-right" action="{% url 'todolist:done' todo.id %}" method="post">
                        {% csrf_token %}
                        {% if todo.done %}
                        <input class="btn btn-primary " type="submit" value="完了">
                        {% else %}
                        <input class="btn btn-outline-primary " type="submit" value="やった">
                        {% endif %}
                    </form>
                </div>
                {% endfor %}
            </div>
        </div>


    </main>
</body>
</html>
```

イベントの背景色と線の色を変えている。


## JavaScript

```
window.addEventListener("load" , function (){
    let today   = new Date();

    let year    = String(today.getFullYear());
    let month   = ("0" + String(today.getMonth() + 1) ).slice(-2);
    let day     = ("0" + String(today.getDate()) ).slice(-2);

    let date    = year + "-" + month + "-" + day;

    let config_date = {
        locale: "ja",
        dateFormat: "Y-m-d",
        defaultDate: date,
    }

    flatpickr("[name='deadline']", config_date);

    console.log(events);

    const calendar_elem = document.getElementById('calendar');
    const calendar      = new FullCalendar.Calendar(calendar_elem, {
                                initialView: 'dayGridMonth',
                                events: events,

                                // イベントをクリックしたとき、その箇所へ移動する。
                                // https://fullcalendar.io/docs/eventClick
                                eventClick: function(info) {
                                    console.log('Event: ' + info.event.id);
                                    const target = document.getElementById("todo_" + info.event.id );
                                    target.scrollIntoView({
                                        behavior: 'smooth',
                                    });
                                }
                        });

    calendar.render();

});
```

クリック時にTodoの箇所までスクロールしている。

何らかの処理を発動させることができるので、モーダルダイアログを表示させ、Todoの詳細を表示させるように仕立てることもできると思う。

## 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2023-05-03 21-12-55.png" alt=""></div>


## 結論

おそらく、新規作成のフォームを表示させる用のボタンもfullcalendar.jsで用意できると思うので、左側のフォームと一覧表示を省いても何ら問題はないのでは？と思えてくる。

そうなると、画面領域の大幅な節約が期待できそう。

空いたスペースで何か表示させるのもありかと思う。自分で作ったカレンダーよりも遥かに高機能で、見た目も申し分ないので、今後はfullcalendar.jsを使っていきたい。



### ソースコード

https://github.com/seiya0723/django-fullcalendar-todo

