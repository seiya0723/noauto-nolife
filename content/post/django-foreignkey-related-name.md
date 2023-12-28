---
title: "【Django】逆参照のrelated_nameを使用して1側から多側のデータを取り出す【models.ForeignKey()】"
date: 2023-12-22T21:05:40+09:00
lastmod: 2023-12-22T21:05:40+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django" ]
---











## モデルメソッド VS 逆参照の`related_name`

時として、`related_name`よりもモデルメソッドのほうが有効な場面もある。

一例を下記に記す。


### テンプレートから複雑な条件を指定した逆参照がしたい場合

テンプレートから逆参照をする場合、引数を指定することはできない。

故に、並び替えや複雑な条件を指定しての逆参照がしたい場合、前もってメソッドに処理をまとめておく必要がある。

下記はその例である。

```
from django.db import models
from django.utils import timezone

class Topic(models.Model):

    dt          = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    def images(self):
        return TopicImage.objects.filter(topic=self.id).order_by("dt")   #上から順に 123456

class TopicImage(models.Model):

    dt          = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
    topic       = models.ForeignKey(Topic,verbose_name="トピック",on_delete=models.CASCADE)
    content     = models.ImageField(verbose_name="画像",upload_to="bbs/topic_image/content")
```

[TopicとTopicImageをまとめて投稿している](/post/django-multi-send-img-and-form/)

この、Topicに紐付けられている画像を表示する際、フォームに指定された順(先に保存された順)で画像を並べて表示する場合、`order_by`を使う必要がある。

`related_name`をテンプレートから呼び出す場合、引数は指定できないので、このようにモデルメソッドを使う方法が妥当であると思われる。



