---
title: "【Django】逆参照のrelated_nameを使用して1側から多側のデータを取り出す【models.ForeignKey()】"
date: 2023-12-22T21:05:40+09:00
lastmod: 2023-12-22T21:05:40+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","tips" ]
---


## related_nameを指定せずに逆参照をする

逆参照を使うことで、1側から多側のデータを取り出すことができる。


『[Djangoで1対多のリレーションを構築する【カテゴリ指定、コメントの返信などに】【ForeignKey】](/post/django-models-foreignkey/)』から引用した下記モデル。

```
class Category(models.Model):

    name    = models.CharField(verbose_name="カテゴリ名",max_length=20)

    def __str__(self):
        return self.name


class Topic(models.Model):

    category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    def __str__(self):
        return self.comment
```

通常、Topic側(多側)から、Category(1側)を呼び出すには、


```
topics  = Topic.objects.all() 

for topic in topics:
    print(topic.category.name)
```

このようにcategoryフィールド(ForeignKey)を参照すると良い。

しかし、Category(1側)からTopic(多側)を呼び出すには、逆参照を使う

```
categories  = Category.objects.all() 

for category in categories:
    # カテゴリに紐付いている全てのTopicを取り出す。
    print( category.topic_set.all() )
```

この`topic_set`という名前は、`[紐付いているモデルクラスの小文字]_set`という命名規則がある。そのため、TopicDataの場合、`topicdata_set`となる。

また、この `.all()` の挙動は多対多の`.all()` と同様、モデルオブジェクトのリストを返す。

### related_nameを指定することで、逆参照の名前を指定できる。

```
class Category(models.Model):

    name    = models.CharField(verbose_name="カテゴリ名",max_length=20)

    def __str__(self):
        return self.name


class Topic(models.Model):

    category    = models.ForeignKey(Category,verbose_name="カテゴリ",on_delete=models.CASCADE, related_name="topics")
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    def __str__(self):
        return self.comment
```

このように`related_name`を指定した場合、逆参照はこうなる。

```
categories  = Category.objects.all() 

for category in categories:
    # カテゴリに紐付いている全てのTopicを取り出す。
    print( category.topics.all() )
```

`related_name`に指定した名前で逆参照ができる。


## モデルメソッド VS 逆参照の`related_name`

時として、逆参照よりもモデルメソッドのほうが有効な場面もある。

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



