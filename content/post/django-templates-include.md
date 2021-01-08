---
title: "Djangoでテンプレートをincludeする時、引数を与える方法"
date: 2020-12-24T16:51:03+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "Django","tips","初心者向け" ]
---


Djangoでテンプレートファイルを分離させ、includeするときがある。複数の箇所で同じフォームを表示したりする時がそうだ。

しかし、id属性を指定する必要がある時、そのままincludeしただけでは使い物にならない。そこで、Djangoでテンプレートをincludeする時、引数を与えることでid属性の重複を避けることができる。





