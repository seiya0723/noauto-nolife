---
title: "【django】ManyToManyFieldでフィールドオプションthroughを指定、中間テーブルを詳細に定義する【登録日時など】"
date: 2021-06-21T16:57:08+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


多対多のフィールドは、複数から1つを選ぶ1対多よりも使う機会が多いだろう。

[飲食店が提供するメニューの食品アレルギー指定](/post/django-many-to-many/)、複数のユーザーに対する通知、ユーザーに対するフォローやブロックの機能など。

DjangoではManyToManyFieldを定義した時、中間テーブルは自動的に作られる。そのため、そのままでは中間テーブルにレコードが挿入された時間などが記録できない。

自分で中間テーブルの中身を作りたい場合はthroughフィールドオプションを使ってManyToManyFieldと中間テーブルを紐付ける。



## 多対多のリレーションの中間テーブルを作る

コードは[Django公式から](https://docs.djangoproject.com/ja/3.2/topics/db/models/)拝借して見やすいように加工。

    from django.db import models
    
    class Person(models.Model):

        name            = models.CharField(max_length=128)
    
        def __str__(self):
            return self.name
    
    class Group(models.Model):

        name            = models.CharField(max_length=128)
        members         = models.ManyToManyField(Person, through='Membership')
    
        def __str__(self):
            return self.name
    
    class Membership(models.Model):

        person          = models.ForeignKey(Person, on_delete=models.CASCADE)
        group           = models.ForeignKey(Group, on_delete=models.CASCADE)
        date_joined     = models.DateField()
        invite_reason   = models.CharField(max_length=64)


つまり、PersonクラスとGroupクラスを多対多でつなげる中間テーブルの役割をしているのが、Membershipクラス。

Membershipクラス内ではPersonクラス、Groupクラスを1対多でつなげている。その他に、日付と文字列のフィールドも付与している。

これはただのManyToManyFieldでは実現できない。ただのManyToManyFieldであれば、自動的に作られる中間テーブルのモデルクラスは下記のようになる。

    class Membership(models.Model):

        person          = models.ForeignKey(Person, on_delete=models.CASCADE)
        group           = models.ForeignKey(Group, on_delete=models.CASCADE)



## 中間テーブルを作るときの注意点

中間テーブルに1対多で関連付けられるモデルクラスが2つ以上ある時、ManyToManyField内のフィールドオプションとして`through_fields`内に、関連付けるフィールドを明示的に指定する必要がある。

またまた[公式から](https://docs.djangoproject.com/ja/3.2/ref/models/fields/#django.db.models.ManyToManyField.through_fields)拝借し、改良。

    from django.db import models
    
    class Person(models.Model):

        name            = models.CharField(max_length=50)
    
    class Group(models.Model):

        name            = models.CharField(max_length=128)
        members         = models.ManyToManyField(Person,through='Membership',through_fields=('group', 'person'), )
    
    class Membership(models.Model):

        group           = models.ForeignKey(Group, on_delete=models.CASCADE)
        person          = models.ForeignKey(Person, on_delete=models.CASCADE)
        inviter         = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="membership_invites", )
        invite_reason   = models.CharField(max_length=64)


中間テーブルのモデルクラス、Membershipでは、3つのForeignKeyのフィールドが定義されている。そのうちpersonとinviterの2つのフィールドはPersonモデルクラスを1対多で関連付けている。

先の例と違って、Personを関連付けているフィールドが2つもある。それ故、どちらをGroupのManyToManyFieldのキーで関連付けるか明示的に指定しない限り、エラーを起こしてしまうのだ。

そこで、ManyToManyFieldにて、フィールドオプションの`through_fields`を使い、明示的に関連付ける(Membershipの)フィールド名をリスト型で指定する。これで、inviterはGroupのManyToManyFieldとは関係のない、ただの1対多のフィールドであるということがわかる。

## ManyToManyFieldとthroughフィールドオプションを使わない場合はどうなる？

もちろん、ManyToManyFieldとthroughフィールドオプションを使わず、中間テーブルを作ってしまう方法もある。下記のように仕立てれば、多対多風のモデルが出来上がるだろう。

    from django.db import models
    
    class Person(models.Model):

        name            = models.CharField(max_length=50)
    
    class Group(models.Model):

        name            = models.CharField(max_length=128)
    
    class Membership(models.Model):

        group           = models.ForeignKey(Group, on_delete=models.CASCADE)
        person          = models.ForeignKey(Person, on_delete=models.CASCADE)
        date_joined     = models.DateField()
        invite_reason   = models.CharField(max_length=64)

しかし、GroupからのManyToManyFieldが無いので、当然Groupを使って作られたモデルオブジェクトからMembershipを参照することはできない。


## 結論

ここまでくるとかなりリレーションが複雑になってくる。だからあえてManyToManyFieldを使わないという選択肢も視野に入れるべきでは無いかと思われる。





