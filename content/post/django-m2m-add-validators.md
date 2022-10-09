---
title: "【Django】ManyToManyFieldにはフィールドオプションvalidatorsは効果なしなので、フォームクラスに追加のバリデーションを【多対多は特殊】"
date: 2022-10-09T21:22:54+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け" ]
---

ManyToManyFieldにはvalidatorsフィールドオプションは通用しない。

そのため、モデル側から何らかの制約を課すことはできない。

だから、フォームクラスに追加のバリデーションを書き込む。

今回はManyToManyFieldのタグを2個までとするバリデーションを追加する。

## モデル

    from django.db import models
    from django.conf import settings
    
    from django.utils import timezone
    
    
    class Tag(models.Model):
        name        = models.CharField(verbose_name="タグ名",max_length=10)
    
        def __str__(self):
            return self.name
    
    
        def str_id(self):
            return str(self.id)
    
    
    class Topic(models.Model):
    
        title       = models.CharField(verbose_name="タイトル",max_length=100)
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
    
        dt          = models.DateTimeField(verbose_name="投稿日時",default=timezone.now)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="投稿者",on_delete=models.CASCADE)
    
        #TODO:中間テーブルのモデルを独自に作らないやり方
    
        # トピックに割り当てられているタグ(タグの指定は必須ではない(ManyToManyFieldにnullは意味なし))
        #TODO:タグの指定は2つまでとする場合のバリデーション←ManyToManyFieldにvalidatorsは意味なし
        tag         = models.ManyToManyField(Tag,verbose_name="タグ",blank=True,)
    
        # 良いねを押したユーザー(related_nameを付けないとここでエラーが起こる)
        #good        = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="良いねしたユーザー",blank=True)
    
        def __str__(self):
            return self.title
    
    
## フォーム


    from django import forms
    from .models import Topic
    
    from django.core.exceptions import ValidationError
    
    
    class TopicForm(forms.ModelForm):
    
        class Meta:
            model   = Topic
            fields  = [ "title","comment","user","tag", ]
    
    
        def clean(self):
            data    = self.cleaned_data

            #このtagsはTagモデルのオブジェクト(複数)
            tags    = data["tag"]

            #タグは2個まで
            if len(tags) > 2:
                raise ValidationError("タグは2個まで")
    
    

追加のバリデーションは`clean`メソッドに記述する。

Djangoのフォームクラスの`clean`メソッドは`is_valid`メソッド実行時に呼び出されている。



## 結論

やはり、フォームクラスにバリデーションを追加する方法が一番強力と思われる

これなら各フィールド間の値を考慮した上でバリデーションエラーを出すことも可能だ。

参照元: https://stackoverflow.com/questions/7986510/django-manytomany-model-validation

