---
title: "【Django】FilefieldやImageFieldでファイル名だけを表示させる方法【モデルにメソッドを追加】"
date: 2022-03-07T22:20:05+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


FilefieldやImageFieldにはフィールドオプションとして`upload_to`が指定されている。

そのため、そのままではファイル名だけを取り出すことはできない。

例えば、モデルが下記でファイル名が`test.pdf`だった場合。


    class Document(models.Model):
        file    = models.FileField(verbose_name="ファイル",upload_to="app/document/file/")

出力されるのは`app/document/file/test.pdf`となる。

`test.pdf`を表示させたいのであれば、別途対策が必要である。

## モデルクラスにメソッドを追加する。

    import os

    class Document(models.Model):
        file    = models.FileField(verbose_name="ファイル",upload_to="app/document/file/")

        def file_name(self):
            return os.path.basename(self.file.name)

これでファイル名単体を表示させたい時、この`file_name`メソッドを呼び出せば良い。

テンプレートで下記のように表示させる

    {{ document.file_name }}

これで`test.pdf`と表示される。


参照:https://stackoverflow.com/questions/2683621/django-filefield-how-to-return-filename-only-in-template
