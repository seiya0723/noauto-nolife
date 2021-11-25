---
title: "Djangoで管理サイトを作り、投稿されたデータの読み・書き・編集・削除を行う【admin.py】"
date: 2021-10-05T07:34:27+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","初心者向け" ]
---

Djangoではデフォルトで管理サイトというものが用意されている。

`admin.py`に少し書き足して、管理ユーザーを作成するコマンドを打つだけで、簡単にデータの読み書きが実現できる。

ソースコードは[40分Django](/post/startup-django/)から流用する。

## admin.pyの編集

`bbs/admin.py`を開いて下記のように編集する。


    from django.contrib import admin
    from .models import Topic
    
    admin.site.register(Topic)

モデルクラス、`Topic`をインポートして、`admin`に登録(register)する。これで、管理サイト上で`Topic`を操作できるようになる。

## 管理ユーザーを作成する。

下記のコマンドを実行する

    python3 manage.py createsuperuser

すると、インタラクティブシェルになり、管理ユーザーのユーザー名とパスワード、メールアドレスの入力を求められる。(現時点ではメールアドレスは未入力OKなので、そのままEnterを押しても問題はない。)

<div class="img-center"><img src="/images/Screenshot from 2021-10-05 07-42-30.png" alt="管理ユーザーの作成"></div>

## 管理サイトへアクセスする。

`config/urls.py`を見ると、adminのパスは`admin/`へアクセスすれば良いことがわかる。

そこで、開発用サーバーを起動し、

    python3 manage.py runserver 127.0.0.1:8000

`http://127.0.0.1:8000/admin/`へアクセスする。

下記のような管理サイトのログインフォームが表示されるので、先ほど管理ユーザーを作ったときのユーザー名とパスワードを入力してログインボタンを押す。

<div class="img-center"><img src="/images/Screenshot from 2021-10-05 07-46-34.png" alt="ログインフォーム"></div>

管理サイトには先ほど追加した、Topicが表示されている。

<div class="img-center"><img src="/images/Screenshot from 2021-10-05 07-47-51.png" alt="Topicモデルクラスのデータが編集、追加等できる"></div>

後は自由に追加や編集、削除、閲覧などができる。

## 結論

このように管理サイトは数行のコードと1回のコマンドで成立する。CRUDが簡単に実現できるので、なるべく早い段階から覚えておけば、入出力作業で困ることは無いだろう。

本番での運用を考えるのであれば、まだまだ使いづらいので、管理サイトをさらにカスタマイズして、目当てのデータを探しやすくする。下記記事を参照。

[Djangoの管理サイトをカスタムする【全件表示、全フィールド表示、並び替え、画像表示、検索など】](/post/django-admin-custom/)

