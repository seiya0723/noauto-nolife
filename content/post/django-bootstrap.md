---
title: "DjangoでBootstrapを使う【pip install django-bootstrap-form】"
date: 2023-09-18T14:09:28+09:00
lastmod: 2023-09-18T14:09:28+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


DjangoのBootstrap関係のライブラリは混在しているので、仕事で使うものを覚書に記録。

```
pip install django-bootstrap-form
```
をインストールして、INSTALLED_APPSに

```
"bootstrapform"
```
を追加する。


テンプレートで、

```
{% load bootstrap %}


{{ form|bootstrap }}
```

として呼び出す。 


## 結論

もっとも私は、フォームオブジェクトのレンダリングもしないし、BootstrapならCDNを使うので、この方法は常用しない。

