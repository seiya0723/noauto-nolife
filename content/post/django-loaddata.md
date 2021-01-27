---
title: "Djangoで開発中、データベースへ初期データを入力する【loaddata】"
date: 2020-10-24T18:12:29+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","json" ]
---


Djangoで開発中にテストしたい時、デプロイ後に初期データを突っ込んで即公開したい時、どうしてもデータの入力作業が出てくる。

Seleniumで入力作業を自動化する方法もあるが、わざわざそんなことをしなくても初期データを突っ込む方法がある。それが

    python3 manage.py loaddata fixture/data.json


## models.pyに基づいたjsonファイルを作る

まず、`bbs/models.py`が下記のような状態だとする。

    from django.db import models
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        name        = models.CharField(verbose_name="名前",max_length=20)
        comment     = models.CharField(verbose_name="コメント",max_length=200)
    
        def __str__(self):
            return self.comment


`bbs/fixture/data.json`に下記を記入。`fixture`ディレクトリは存在しないので作る。

    [
        {"model":"bbs.Topic","pk":1,"fields":{ "name":"タロウ","comment":"こんにちは" }}, 
        {"model":"bbs.Topic","pk":2,"fields":{ "name":"Mike","comment":"Hi" }}, 
        {"model":"bbs.Topic","pk":3,"fields":{ "name":"hanako","comment":"どうも" }}
    ]

数値型はダブルクオーテーション不要な点に注意。続いて、下記コマンドを実行する


    python3 manage.py loaddata data.json

もしくは

    python3 manage.py loaddata ./bbs/fixture/data.json


models.pyに基づいたデータを入力することになるので、事前にマイグレーションをしておかないと上記コマンドは失敗するので注意。

## 結論

DBが変わるたびに格納しているデータが消える。このように事前にfixtureをまとめておけば、開発中もデプロイ後もデータの扱いがとても楽になる。

ただ、JSONファイルはカンマが1つ抜けてたり、全角スペースが入ったり、数値型なのにダブルクオーテーションで囲ったりするだけでもすぐエラーが出る仕様なので、集中して作らないとハマることもある。

[公式ドキュメント](https://docs.djangoproject.com/en/3.1/howto/initial-data/)によると、JSONよりもYAMLの方が書きやすそう。


とは言えYAMLはインデントで記述しなければならない点から、矩形選択からの一括入力ができない点は要注意。


一応、DjangoではDBに格納されているデータをダンプ(バックアップ)することができる。それがこれ。

【関連記事】[DjangoでDBに格納したデータをダンプ(バックアップ)させる【dumpdata】](/post/django-dumpdata/)


