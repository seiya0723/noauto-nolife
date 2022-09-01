---
title: "【Django】FontAwesomeで星のアイコンを使ったレビューの投稿と表示"
date: 2022-08-20T17:55:28+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","tips","追記予定" ]
---

最終的にこのようになる。

<div class="img-center"><img src="/images/Screenshot from 2022-08-20 17-57-52.png" alt=""></div>

今回はテンプレートのwithとcenterは不使用とした。

そして、5つ星の内、4つ星でレビューした場合、空の星を1つ描画する仕様に仕立てた。


## 参照

- [【Django】テンプレートで数値を使用したforループを実行する方法【レビューの星のアイコン表示などに有効】](/post/django-template-integer-for-loop/)
- [HTML5とCSS3だけでAmazon風の星レビューのフォームを再現する【ホバーした時、ラジオボタンのチェックされた時に星を表示】【flex-direction:row-reverseで逆順対応可】](/post/css3-star-review-radio/)


## ソースコード

https://github.com/seiya0723/bbs_review




