---
title: "Djangoのcreatesuperuserでインタラクティブシェルを省略する。"
date: 2024-10-17T13:12:14+09:00
lastmod: 2024-10-17T13:12:14+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---

`python manage.py createsuperuser`で管理ユーザーをつくることができるが、その後のインタラクティブシェルの入力がめんどくさい。

そこで、環境変数を使ってインタラクティブシェルを省略する。

更に、エイリアスを使ってコマンド入力も簡略化させる。

```
# createsuperuser の自動化

export DJANGO_SUPERUSER_USERNAME="asahina"
export DJANGO_SUPERUSER_EMAIL="asahina@asahina.com"
export DJANGO_SUPERUSER_PASSWORD="seiya0723"

alias django_createsuperuser="python manage.py createsuperuser --noinput"
```




