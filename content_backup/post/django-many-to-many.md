---
title: "Djangoで多対多のリレーションの構造と作り方、テンプレートで表示する方法【ManyToManyField】"
date: 2020-11-27T17:20:39+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け" ]
---

## 多対多のリレーションの作り方

多対多のモデルは以下のように作る。


    from django.db import models
    
    class Allergy(models.Model):
        name        = models.CharField(verbose_name="アレルギー名",max_length=10)
    
        def __str__(self):
            return self.name
    
    class Menu(models.Model):
    
        name        = models.CharField(verbose_name="品名",max_length=20)
        breakfast   = models.BooleanField(verbose_name="朝メニュー",default=True)
        lunch       = models.BooleanField(verbose_name="昼メニュー",default=True)
        dinner      = models.BooleanField(verbose_name="夜メニュー",default=True)
        takeout     = models.BooleanField(verbose_name="テイクアウト",default=True)
        price       = models.IntegerField(verbose_name="価格")
    
        #ここでManyToManyFieldを使用する。
        allergy     = models.ManyToManyField(Allergy,verbose_name="含むアレルギー")
    
        def __str__(self):
            return self.name

1対多と指定はほぼ同じ。`on_delete`が不要という点で異なる。

## 多対多のリレーション構造


Djangoでは上記のManyToManyFieldを使用して多対多を表現することができるため、多対多についてやや誤解を招く可能性がある。

実際に、DBでは多対多は下記のような構造になっている。

<div class="img-center"><img src="/images/Screenshot from 2022-06-12 14-39-54.png" alt=""></div>

このように多対多には、中間テーブルが存在する。

この中間テーブルに双方のモデルを紐付けるため、記録が行われている。

もし、この`menu_allergy`テーブルに、登録日時を記録するフィールドを追加したい場合、Djangoでは中間テーブルのモデルを作る必要がある。

[【django】ManyToManyFieldでフィールドオプションthroughを指定、中間テーブルを詳細に定義する【登録日時など】](/post/django-m2m-through/)



## 多対多のリレーションの表示方法


多対多のリレーションを作って、いざ表示させようとした時、普通に`{{ content.allergy }}`などと指定してしまうとこうなってしまう。

    
<div class="img-center"><img src="/images/Screenshot from 2020-11-27 17-19-49.png" alt="多対多表示失敗"></div>

表示できていない。正しく指定するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2020-11-27 17-19-12.png" alt="多対多表示成功"></div>

## コードの解説

結論から言うと、テンプレートでの表示に問題がある。下記のようにすると表示できる。

    <td>{% for allergy in content.allergy.all %}{{ allergy }} {% endfor %}</td>

`.all`属性を使用しforループで並べる。

## 結論

多対多のリレーションはアレルギー表示や動画等のタグ表示、エンジニアの担当言語やスキルなどの表示にも使用することがあるので、ここで抑えておきたい。

## ソースコード

https://github.com/seiya0723/django-m2mfield

