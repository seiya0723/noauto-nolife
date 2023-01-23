---
title: "DjangoとReactを組み合わせる方法論と問題の考察"
date: 2023-01-23T11:27:22+09:00
lastmod: 2023-01-23T11:27:22+09:00
draft: false
thumbnail: "images/django-react.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","React","初心者向け","追記予定" ]
---

DjangoとReactを組み合わせることで、画面遷移の全く無いSPA(シングルページアプリケーション)を作ることができる。

もちろん。jQueryのAjaxを使うことでも簡単に実現はできるが、

- 仮想DOMが使えない
- 手続き型である

などの点から、開発規模が大きくなると、SPAを維持することが難しい。

だからDjangoとReactを組み合わせて効率的にSPAを開発する。

しかし、問題点が多々ある。モダンなやり方なので情報も少ない。

そこで、本記事ではDjangoとReactを組み合わせる際に必要な方法論、問題点に対する解決策をまとめる。


## DjangoとReactの構図

説明すると長くなるので、図で解説。

<div class="img-center"><img src="/images/Screenshot from 2023-01-23 13-03-53.png" alt=""></div>


まとめるとこうなる

- ReactサーバーとDjangoサーバーの2つが立つ
- Reactはリクエスト時、axiosを使う
- Djangoはjsonを扱うためDjangoRestFrameworkを使う
- DjangoとReactは同一オリジンではないため、corsheadersというライブラリを使う


### 同一オリジンとは？

まず、オリジンとは、プロトコル、ドメイン名、ポート番号の3つを組み合わせたもの。

httpやhttpsなどのプロトコル、noauto-nolife.comなどのドメイン、3000や8000などのポート番号を組み合わせた物をオリジンという。

下記サイトでも解説してある。

参照: [【Django】Django4.0以上はsettings.pyにて、CSRF_TRUSTED_ORIGINSにオリジンを指定しないとPOSTリクエスト時に403Forbiddenになる](/post/django-csrf-trusted-origins/)


通常、同一オリジンポリシーというものがあり、同じオリジンではないホストに対して、リクエストを送信することはできないようになっている。

つまり、今回のようにReactサーバーである`127.0.0.1:3000`とDjangoサーバーである`127.0.0.1:8000`は別のオリジンになるため、リクエスト送信はできない。

そこで、この同一オリジンポリシーに対処するためPythonライブラリの`corsheaders`を使う。`127.0.0.1:3000`から`127.0.0.1:8000`へのリクエストの送信を許可する。



## 参照元

https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react


