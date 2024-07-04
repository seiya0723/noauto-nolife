---
title: "DjangoMessageFrameworkにJavaScriptとCSSを当てる【ボタンを押して消せるようにする】"
date: 2023-04-26T18:21:16+09:00
lastmod: 2023-04-26T18:21:16+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","JavaScript","CSS","ウェブデザイン" ]
---


DjangoMessageFrameworkは投稿完了した旨やエラーの理由をクライアント側に表示することができるが、表示させっぱなしになるので少々鬱陶しく感じることもある。

そこで5秒経ったら自動的に消すように仕立てたり、バツボタンを押して消せるように仕立てた。

さらに、fontawesomeを使用している。

## ソースコード



### テンプレート

```
<div class="notify_message_area">
    {% for message in messages %}
    <div class="notify_message notify_message_{{ message.tags }}">
        <div class="notify_message_content">{{ message }}</div>
        <div class="notify_message_delete"><i class="fas fa-times"></i></div>
    </div>
    {% endfor %}
</div>
```

### JavaScript(jQuery)


```
//DjangoMessageFrameWorkの削除機能
$(".notify_message_delete").on("click", function(){ $(this).parent(".notify_message").remove(); }); 

//5秒経ったら自動的に消す
setTimeout( function(){ $(".notify_message").remove(); }, "5000");
```
### VanillaJS

```
    //DjangoMessageFrameWorkの削除機能 (素のJavaScriptに書き換え。)
    const notify_deletes    = document.querySelectorAll(".notify_message_delete");
    for (let notify_delete of notify_deletes ){
        // クリックされたとき、その要素の親要素.notify_messageを削除する。
        notify_delete.addEventListener("click", (event) => {
            event.currentTarget.closest(".notify_message").remove();
        });
    }

    //5秒経ったら自動的に消す
    setTimeout( () => {
        const messages  = document.querySelectorAll(".notify_message");
        for (let message of messages){
            message.remove();
        }
    }, 5000);
```


### CSS

```
/* message_area */

.notify_message_area{
    position:fixed;
    width:100%;
    top:0;
    left:0;
}
.notify_message{
    color:white;
    padding:1rem;
    margin:1rem;
    border-radius:0.5rem;

    display:flex;

    background:deepskyblue;
}
.notify_message_success{
    background:forestgreen;
}
.notify_message_error{
    background:crimson;
}
.notify_message_content {
    width:calc(100% - 2rem);
    font-size:1.25rem;
}
.notify_message_delete {
    cursor:pointer;
    width:2rem;
    transition:0.2s;
}
.notify_message_delete i{
    font-size:1.5rem;
}
.notify_message_delete:hover{
    color:black;
    transition:0.2s;
}
```


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-04-26 18-28-31.png" alt=""></div>

