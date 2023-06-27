---
title: "【JavaScriptカレンダー】fullcalendarを使ってみる【ライブラリ】"
date: 2023-04-22T22:07:54+09:00
lastmod: 2023-04-22T22:07:54+09:00
draft: false
thumbnail: "images/Screenshot from 2023-04-24 15-43-44.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScriptライブラリ","JavaScript","ウェブデザイン","追記予定" ]
---

JavaScriptを使ってカレンダーを表示する。

## 基本のカレンダー表示


```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.6/index.global.min.js"></script>
    <script>

    //ページが読まれたときに下記を実行
    document.addEventListener('DOMContentLoaded', function() {

            //カレンダーの要素を取得
            const calendarEl    = document.getElementById('calendar');

            // オブジェクトを作成 FullCalendar.Calendar() を実行。引数として要素と表示するカレンダーの設定
            const calendar      = new FullCalendar.Calendar(calendarEl, {
                                        initialView: 'dayGridMonth',
                                        events: [
                                                {
                                                        title  : 'イベント1',
                                                        start  : '2023-05-01'
                                                    },
                                                {
                                                        title  : 'イベント2',
                                                        start  : '2023-05-05',
                                                        end    : '2023-05-07'
                                                    },
                                                {
                                                        title  : 'イベント3',
                                                        start  : '2023-04-09T12:30:00',
                                                        allDay : false // will make the time show
                                                    }
                                            ]

                                    });

            //カレンダーのレンダリング
            calendar.render();
      });

    </script>

</head>
<body>

    <!--style属性からサイズを指定できるっぽい。-->
    <div id='calendar' style="max-width:600px;max-height:600px;"></div>

</body>
</html>
```

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-04-24 15-43-44.png" alt=""></div>


### 参照元 

- https://fullcalendar.io/demos
- https://fullcalendar.io/docs

使用した技術

- https://fullcalendar.io/docs/events-array
- https://fullcalendar.io/docs/initialize-globals



