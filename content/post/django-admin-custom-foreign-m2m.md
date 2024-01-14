---
title: "【Django】管理サイトで1対多(ForeignKey)、多対多(ManyToManyField)のフォームを扱いやすくする【admin】"
date: 2024-01-14T10:54:34+09:00
lastmod: 2024-01-14T10:54:34+09:00
draft: false
thumbnail: "images/Screenshot from 2024-01-14 11-23-06.png"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---


1対多、多対多を管理サイトで扱うには、デフォルトのフォームではとても使いづらい。

<div class="img-center"><img src="/images/Screenshot from 2024-01-14 11-10-11.png" alt=""></div>

そこで、更に管理サイトをカスタムして、フォームを扱いやすくさせる。

モデルは下記記事から引用し、一部編集した。


- [【Django】ManyToManyFieldで検索をする方法、追加・削除を行う方法【多対多はクエリビルダの検索は通用しない】](/post/django-m2m-search-and-add/)
- [【Django】デフォルトの認証機能を網羅し、カスタムユーザーモデルとメール認証も実装させる【脱allauth】](/post/django-auth-not-allauth-add-custom-user-model/)


## モデル


```
from django.db import models
from django.utils import timezone

from django.contrib.auth import get_user_model
User = get_user_model()


class Tag(models.Model):
    name        = models.CharField(verbose_name="タグ名",max_length=10)

    def __str__(self):
        return self.name

    def str_id(self):
        return str(self.id)

class Category(models.Model):
    name        = models.CharField(verbose_name="カテゴリ名",max_length=10)

    def __str__(self):
        return self.name

class Topic(models.Model):

    dt          = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)

    category    = models.ForeignKey(Category, verbose_name="カテゴリ", on_delete=models.CASCADE)
    tag         = models.ManyToManyField(Tag,verbose_name="タグ",blank=True)

    title       = models.CharField(verbose_name="タイトル",max_length=100)
    comment     = models.CharField(verbose_name="コメント",max_length=2000)

    user        = models.ForeignKey(User,verbose_name="投稿者",on_delete=models.CASCADE)

    def __str__(self):
        return self.title
```


タグは多対多、カテゴリは1対多、ユーザーは1対多としている。



## admin.py



```
# == This code was created by https://noauto-nolife.com/post/django-auto-create-models-forms-admin/ == #
from django.contrib import admin
from .models import Tag,Category,Topic

class TagAdmin(admin.ModelAdmin):
    list_display	= [ "id", "name" ]

class CategoryAdmin(admin.ModelAdmin):
    list_display	= [ "id", "name" ]
    
    # この指定がないと、TopicAdminの `autocomplete_fields = [ "category" ]` は動かない
    search_fields   = [ "name" ]


class TopicAdmin(admin.ModelAdmin):
    list_display	= [ "id", "dt", "category", "format_tag", "title", "comment", "user" ]


    # list_displayに多対多のフィールドを表示する際、多対多のすべてを文字列で返す。
    def format_tag(self,obj):
        tags    = ""

        if obj.tag:
            for tag in obj.tag.all():
                tags += f"{tag.name} "

        return tags

    format_tag.short_description        = Topic.tag.field.verbose_name
    format_tag.empty_value_display      = "タグ未指定"


    # 多対多を扱いやすくするフォーム。
    filter_horizontal       = [ "tag" ]


    # 1対多で検索を扱うフォーム。(ただし、紐付いているモデルのAdminクラスで、search_fields を指定する必要がある)
    autocomplete_fields     = [ "category" ]


admin.site.register(Tag,TagAdmin)
admin.site.register(Category,CategoryAdmin)
admin.site.register(Topic,TopicAdmin)
```


## 動かすとこうなる

カテゴリ(1対多)は検索ができる。

<div class="img-center"><img src="/images/Screenshot from 2024-01-14 11-23-06.png" alt=""></div>


多対多はこのように検索と複数選択が簡単にできる。

<div class="img-center"><img src="/images/Screenshot from 2024-01-14 11-22-54.png" alt=""></div>









