---
title: "【Django】models.pyにフィールドを追加・削除して、マイグレーションを実行する"
date: 2021-10-05T06:45:55+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","初心者向け" ]
---

models.pyを操作していく上で難しいのが、フィールドの追加とマイグレーション。

特に、追加するフィールドによっては[マイグレーションファイル作成時に警告が出る](/post/django-non-nullable/)ことがある。

本記事では警告が出る理由も含め、フィールドの追加方法も含めて解説する。ソースコードは[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)を元にする。

## デフォルト値ありのフィールドを追加する

まず、安全なデフォルト値ありのフィールドを追加する。簡易掲示板であれば、投稿日時も含めたいので、`DateTimeField()`を追加した。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    
        def __str__(self):
            return self.comment


通常、この投稿日時は、投稿された瞬間の日時を記録する。ユーザーが自由に日時を変更できるようにするならまだしも、投稿された瞬間の日時を記録するのであれば、フィールドオプションの`default`を使用する。

この`default`の値にはタイムゾーンを考慮した現在の時間、即ち、`timezone.now`を指定する。このtimezoneは予め冒頭でimportしなければならない点に注意する。

これでコメント投稿時に自動的に投稿日時がセットされる。

この状態でマイグレーションを実行する。

    python3 manage.py makemigrations
    python3 manage.py migrate

これでdtフィールドの追加が実現された。

後は、テンプレートに`{{ topic.dt }}`を追加する。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>{{ topic.dt }}</div>
                <div>{{ topic.comment }}</div>
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

これで日時が表示されるようになる。ちなみに、dtフィールドを追加する前の投稿の日時はどうなるかと言うと、マイグレーションした瞬間の日時が付与される。

フィールドが追加された後は、投稿された瞬間の日時が随時追加されていく。

<div class="img-center"><img src="/images/Screenshot from 2021-10-04 16-39-51.png" alt="日付が追加された"></div>

ちなみに、ビューのpostメソッドでコメントの保存を行うが、その時に日付を操作する必要はない。`default`があるから。


## デフォルト値なしのフィールドを追加する

続いて、デフォルト値がないフィールドを追加する。これが少々難しい。

簡易掲示板に名前の入力欄が必要になり、nameという名前の`CharField()`を`models.py`に追加する。


    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        name    = models.CharField(verbose_name="投稿者の名前",max_length=100)
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    
        def __str__(self):
            return self.comment

commentと同様に`verbose_name`と`max_length`を指定。ただし、ここではあえて`default`を指定しない。

この状態でマイグレーションを行う。すると、下記のような警告が出る。

    python3 manage.py makemigrations

    You are trying to add a non-nullable field 'name' to topic without a default; we can't do that (the database needs something to populate existing rows).
    Please select a fix:
     1) Provide a one-off default now (will be set on all existing rows with a null value for this column)
     2) Quit, and let me add a default in models.py
    Select an option: 

要するに、topicテーブルに、NULL禁止のnameフィールドを追加する場合、既存のレコードの処遇をどうするか聞いている。

[こちらの記事](/post/django-non-nullable/)でも取り扱ったが、特段の指定がない場合、基本的にフィールドのデータは入力必須(null禁止、blank禁止)である。にもかかわらず、新しくフィールドを追加した時、既存のフィールドの値がどうしてもnullになってしまう。

一言で言うと、nullは値がない状態、blankは空の文字列(`""`)。

この状況で与えられた選択肢は2つ。

- 1) 1度限りのデフォルト値を入れる
- 2) 一旦`makemigrations`を中止して、models.pyに追加したフィールドにdefault属性を指定する

1か2を入力してEnterを押す。

1の場合、Pythonのインタラクティブシェル風になるので、任意の値を指定する

2の場合、追加したnameにフィールドオプションとしてdefaultを指定する。今回は2を指定してmodels.pyを編集する。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        name    = models.CharField(verbose_name="投稿者の名前",max_length=100,default="匿名")
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    
        def __str__(self):
            return self.comment

この`default`を指定することで`makemigrations`が可能になる。既存のレコードは全て匿名として扱われる。

<div class="img-center"><img src="/images/Screenshot from 2021-10-05 07-09-22.png" alt=""></div>

これでフィールドの追加が実現できた。

<!--
## フィールドを削除する
## マイグレーションファイルを確認する
## マイグレーションできない状態に陥った時は
マイグレーションファイル全てとDBのファイルを削除して最初からやり直す。
--> 

## 結論

モデルフィールドの追加はルールをしっかり守れば実現できるものの、これからDjangoを扱う方にはやや難しい。

本件の他に、クライアントからデータを受け取る場合、テンプレートの編集と[forms.pyでバリデーションをする](/post/django-forms-validate/)フィールドの編集も同時に行う必要があるだろう。

