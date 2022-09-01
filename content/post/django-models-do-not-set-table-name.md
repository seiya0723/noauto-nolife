---
title: "【Django】複数のアプリを作る場合、models.pyのモデルクラスにテーブル名を指定するべきではない【重複問題】"
date: 2021-11-11T14:14:40+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","アンチパターン" ]
---

## 背景

最近、`models.py`を書く時、`db_table`を指定している現状に違和感が出てきた。

    from django.db import models
    
    class Topic(models.Model):
    
        #↓これは必要なのか？

        class Meta:
            db_table = "topic"

        #↑これは必要なのか？
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment


もしやと思い、`db.sqlite3`を確認する。すると、上記のモデルをマイグレーションしたときのテーブル名は

<div class="img-center"><img src="/images/Screenshot from 2021-11-12 07-19-27.png" alt="モデルクラス名のみを考慮したテーブル名"></div>

`topic`となる。当然だ。では、下記のように`db_table`を消したモデルをマイグレーションした時、

    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment


テーブル名はこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-12 07-20-10.png" alt="アプリ名とモデルクラス名を考慮したテーブル名"></div>

`bbs_topic`。つまり、アプリ名もセットでテーブル名が作られるのだ。


## 想定される問題

例えば、bbsアプリで下記モデルを作って、マイグレーションをする。

    from django.db import models
    
    class Topic(models.Model):

        class Meta:
            db_table = "topic"

        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment

続いて、別のアプリとしてchatというアプリを作る。そのchatに下記モデルを作ってマイグレーションをする。

    from django.db import models
    
    class Topic(models.Model):

        class Meta:
            db_table = "topic"

        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment

こうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-12 07-23-44.png" alt="テーブル名重複につきエラー"></div>

予想通り、マイグレーションエラーが出た。これまで1つのプロジェクト内に複数のアプリで開発し、このようにテーブル名が重複する事は無かったので気が付かなかったが、やはりエラーになってしまった。

## テーブル名の重複問題はこうして解決する

`class Meta`の`db_table`を削除する。

どうしてもこちら側で明示的に指定したい場合は、モデルが所属するアプリ名とセットでテーブル名を決める。

    from django.db import models
    
    class Topic(models.Model):

        class Meta:
            db_table = "bbs_topic"

        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        def __str__(self):
            return self.comment

いずれもテーブル名の書き換えはマイグレーションしても、DBに格納されているデータそのものに影響は及ばない。(テーブル名がリネームされるだけ)

<div class="img-center"><img src="/images/Screenshot from 2021-11-12 07-26-36.png" alt=""></div>

## 初心者に解説するDjangoのモデルはどうあるべきか？

必要最低限のシンプルなモデル書くのであれば、こういうモデルが一番適切だと思う。


    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)


こんなふうに3行で解決する。コードを書くのがめんどくさいとか、理屈とか無視してすぐに作りたいと思う人からしてみれば、こちらが良いのかもしれない。

しかし、これではマイグレーションをした時にテーブル名がどうなるのか。パッと見でわからないのではなかろうか。`class Meta`には重複を禁止する`unique`を指定することもある。

さらに`def __str__(self)`がなくなると、モデルオブジェクトをそのまま`print()`で表示させる時、無骨な数字(id)が出るだけで、余計にわけがわからなくなるのではないだろうか。

とはいえ、この`def __str__(self)`が作用するのは`admin.py`を覚えてからであり、`print()`でモデルオブジェクトを表示させなければ必要のないものだ。何より`admin.py`でクラスを作り、管理サイトをカスタマイズすれば良い話だ。

## 結論

市販の教科書に書いてあったからって、思考停止してそのまま書き写しを繰り返していると、いずれとんでもないことになってしまう。そういう典型例だなと思った。

今回のテーブル名問題は既存のデータには影響を及ぼさないようにマイグレーションをする事ができるが、例えば[ユーザーモデル](/post/django-custom-user-model-allauth-bbs/)などは最初のマイグレーションファイル作成時に作っておかなければ取り返しが付かない。

