---
title: "【CSS3】チャットのウェブデザインを作る"
date: 2022-09-06T16:41:44+09:00
draft: false
thumbnail: "images/Screenshot from 2022-09-06 16-44-28.png"
categories: [ "フロントサイド" ]
tags: [ "ウェブデザイン","CSS3" ]
---


## HTML

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main class="container">
        <div class="mine_speech_bubble_area">
            <div class="speech_bubble"></div>
        </div>
        <div class="others_speech_bubble_area">
            <div class="speech_bubble"></div>
        </div>
    </main>
</body>
</html>
```


### Django用のHTML

```
{% for topic in topics %}
<div class="{% if topic.user.id == request.user.id %}mine{% else %}others{% endif %}_speech_bubble_area">
    <div class="speech_bubble">{{ topic.comment|linebreaksbr }}</div>
</div>
{% endfor %}
```


## CSS

```
.mine_speech_bubble_area{
    text-align:right;
}
.others_speech_bubble_area{
    text-align:left;
}
.mine_speech_bubble_area .speech_bubble {
    /* 自分が送った時は右下の角をつける */
    background:lime;
    border-bottom-right-radius:0;
}
.others_speech_bubble_area .speech_bubble {
    /* 相手が送った時は左上の角をつける */
    background:silver;
    border-top-left-radius:0;
}
.speech_bubble{
    text-align:left;
    word-break:break-all;

    display:inline-block;
    max-width:80%;
    padding:0.5rem;
    margin:0.5rem 0;
    border-radius:1rem;
}
```

## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-09-06 16-44-28.png" alt=""></div>
