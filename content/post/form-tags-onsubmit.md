---
title: "HTMLのformタグで送信(submit)をする際に、確認をとった上で送信を行う【onsubmit属性】"
date: 2021-12-20T15:21:08+09:00
draft: false
thumbnail: "images/html5.jpg"
categories: [ "フロントサイド" ]
tags: [ "html5","JavaScript" ]
---

例えば、下記のような削除ボタンであれば、削除ボタンが押されると同時に削除が実行される。

    <form action="" method="POST">
        <!--CSRF_token-->
        <input class="btn btn-outline-danger" type="submit" value="削除">
    </form>

これでは間違えて押してしまった時に取り返しが付かない。

そこで下記のように`form`タグに`onsubmit`属性を付与する。これで削除の送信前に確認をとった上で送信を行う事ができる。

    <form action="" method="POST" onsubmit="if(confirm('本当に削除しますか？')){ return true } else { return false };">
        <!--CSRF_token-->
        <input class="btn btn-outline-danger" type="submit" value="削除">
    </form>

`onsubmit`属性は`form`タグ内の`type="submit"`が発動する際に発動するJavaScriptを指定する属性。

