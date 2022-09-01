---
title: "【Django】django-admin、python、pip、コマンドが動作しない場合の対処法【環境構築問題】"
date: 2022-08-25T13:48:12+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","django","tips" ]
---

いわゆる、PATHが通っていない状態

Pythonのインストーラーでインストールする時、『add Python 3.x to PATH』というチェック項目がある。

そこにチェックを入れることで、pythonコマンドが使えるようになる。

参照元:https://bluebirdofoz.hatenablog.com/entry/2019/01/19/141007


django-adminコマンドが使えない時、

    django-admin startproject config .

pythonからdjangoを呼び出し、実行することで解決できる

    python -m django startproject config .


なお、django-adminコマンドはこのプロジェクトを作るときだけしか使わないので、後者のコマンドで作っても全く問題はない。

参照元:https://stackoverflow.com/questions/23439089/using-django-admin-on-windows-powershell


## 補足

ちなみに、Windowsはpythonコマンド、MacとLinuxはpython3とコマンドを打つ

    #Windows
    python manage.py runserver 127.0.0.1:8000

    # Mac or Linux
    python3 manage.py runserver 127.0.0.1:8000

適宜解釈する。

