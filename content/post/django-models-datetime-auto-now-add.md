---
title: "【Django】DateTimeFieldに自動的に現在時刻を入れるには、auto_now_addもしくはauto_nowフィールドオプションを指定する【新規作成時・編集時の時刻】"
date: 2022-04-14T17:07:34+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---

## 作成時と編集時の日時を自動的に入れたい場合は、`auto_now`もしくは`auto_now_add`を指定する。

`auto_now`はモデルのsaveメソッドが実行された時、`auto_now_add`はモデルに新規作成された時に、その時の日時が指定したフィールドに格納される。

つまり、モデルを下記のように組むと良いだろう。


    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        create_dt   = models.DateTimeField(verbose_name="作成日時",auto_now_add=True)
        mod_dt      = models.DateTimeField(verbose_name="編集日時",auto_now=True)
    

こうすることで、作成と編集が自動的に記録される。

<div class="img-center"><img src="/images/Screenshot from 2022-04-15 15-11-06.png" alt=""></div>


## 【注意】自動的に作成日時と編集日時が記録されるため、管理サイトから編集できない


この`auto_now_add=True`もしくは`auto_now=True`が指定されたフィールドは管理サイトから編集することはできない。(そのフィールドを指定すると、自動的に`editable=False`が指定されてしまうため)

<div class="img-center"><img src="/images/Screenshot from 2022-04-15 15-11-02.png" alt=""></div>

そのため、日付の再指定等を手動で行いたい場合は、このフィールドオプションは指定するべきではない。

その場合は下記のように`default=timezone.now`を指定すると良いだろう。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="作成日時",default=timezone.now)


- https://www.geeksforgeeks.org/datetimefield-django-models/
- https://docs.djangoproject.com/en/4.0/ref/models/fields/#django.db.models.DateField.auto_now
