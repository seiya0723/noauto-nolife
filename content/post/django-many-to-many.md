---
title: "Djangoで多対多のリレーションをテンプレートで表示する方法【ManyToManyField】"
date: 2020-11-27T17:20:39+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け" ]
---


多対多のリレーションを作って、いざ表示させようとした時、普通に`{{ content.allergy }}`などと指定してしまうとこうなってしまう。

    
<div class="img-center"><img src="/images/Screenshot from 2020-11-27 17-19-49.png" alt="多対多表示失敗"></div>

表示できていない。正しく指定するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-27 17-19-12.png" alt="多対多表示成功"></div>

## コードの解説

結論から言うと、テンプレートでの表示に問題がある。下記のようにすると表示できる。

    <td>{% for allergy in content.allergy.all %}{{ allergy }} {% endfor %}</td>

`.all`属性を使用しforループで並べる。

## 結論

多対多のリレーションはアレルギー表示や動画等のタグ表示、エンジニアの担当言語やスキルなどの表示にも使用することがあるので、ここで抑えておきたい。

## ソースコード

https://github.com/seiya0723/django-m2mfield

