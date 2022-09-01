---
title: "【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】"
date: 2021-02-01T18:25:13+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips","システム管理","上級者向け" ]
---


Djangoの`manage.py`にはコマンドを追加することができる。これを利用すれば、アプリディレクトリで定義したモデルをそのまま流用してDBにアクセスしたり、コマンド一発で複雑な処理を終わらせたり、バッチ処理として運用させることも簡単にできる。


## manage.pyにコマンドを追加させる

まず、任意のアプリディレクトリに`management/commands/`ディレクトリを作る。

    mkdir -p [アプリディレクトリ]/management/commands/

作ったディレクトリの配下にコードを書く

    vi [アプリディレクトリ]/management/commands/testcommand.py


`django.core.management.base`から`BaseCommand`をインポートして継承したクラスを作る。

    from django.core.management.base import BaseCommand
    
    class Command(BaseCommand):
    
        def handle(self, *args, **kwargs):
            print("これでコマンドが実行できる。")
    

これで準備は完了。後は下記コマンドを実行すれば、上記のコードが実行される。

    python3 manage.py testcommand

<div class="img-center"><img src="/images/Screenshot from 2021-02-02 15-43-14.png" alt="コマンドが実行できる"></div>

crontabからも実行できるので、定時処理にも有効。

## 結論

`manage.py`コマンド追加による用途は非常に多い。

アプリで定義したモデルを継承してDBにアクセスできる。DjangoのモデルORMも使えるのでDBのアクセスも簡単。そのため、DB内のデータを常にチェックして、値が変わったらメールで送信したり、別の値を書き換えるなどの処理もできる。

公式では追加コマンドを使って質問のクローズを行っているようだ。

https://docs.djangoproject.com/en/3.1/howto/custom-management-commands/

