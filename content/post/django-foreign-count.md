---
title: "【Django】外部キーに対応したデータの個数をカウントして表示【リプライ・コメント数の表示に有効】【annotate+Count】"
date: 2021-01-26T17:02:16+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","上級者向け" ]
---

例えば、Djangoで掲示板サイトを作り、[投稿した内容に対してリプライできる機能を付けた](/post/django-models-foreignkey/)とする。そのリプライ数を一覧表示時に合わせて表示させる時、どうする？

本記事では、上記のように一対多のリレーションが構築されている環境下で、多に該当するデータ数を計算して表示させる方法を解説する。

## 多のデータ数を計算してそれぞれ表示させる

下記のような、`Topic`に対して`Reply`ができるモデルになっていたとする。

    from django.db import models
    from django.utils import timezone
    import uuid 
    
    class Topic(models.Model):
    
        id      = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
        dt      = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        comment = models.CharField(verbose_name="コメント",max_length=500)
    
        def __str__(self):
            return self.comment
    
    class Reply(models.Model):
    
        target  = models.ForeignKey(Topic,verbose_name="対象トピック",on_delete=models.CASCADE)
        dt      = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        comment = models.CharField(verbose_name="コメント",max_length=500)
    
        def __str__(self):
            return self.comment
    
`Topic`を一覧表示させる時、`Reply`の数を表示させるには、`views.py`でこうすれば良い。


    from django.db.models import Count
    
    #---省略----
    
    def get(self,request,*args,**kwargs):
    
        #TIPS.annotate()とCount("カラム名(外部キーで関連付けられたテーブル名)")で外部キーに対応するテーブルのレコード数を数える
        data    = Topic.objects.all().annotate(reply_count=Count("reply")).order_by("-dt")
    
    #---省略---



まず、`Topic`のモデルオブジェクトから全てを抜き取る。その時、外部キーで関連付けられたテーブル名(今回は`reply`)を`Count`関数で計算する。リプライの総数を`reply_count`という属性に入れる。`.annotate()`により、`Topic.objects.all()`にによって得られたデータと組み合わせて出力される。

つまり、リプライ数もカウントして、まとめて参照できるようにするということだ。テンプレートでは`.annotate()`で追加された`.reply_count`を使って下記のようにリプライ数を参照することができる。

    {% for content in data %}
    <div class="border p-1 my-1">
        <div>{{ content.dt }}</div>
        <div class="p-2">{{ content.comment|linebreaksbr }}</div>
        <div class="text-right"><a href="{{ content.id }}">リプライ数({{ content.reply_count }})</a></div>
    </div>
    {% endfor %}

<div class="img-center"><img src="/images/Screenshot from 2021-01-27 09-25-14.png" alt="annotateにより、リプライ数の参照ができる"></div>

## 結論

項目ごとの平均価格を求めたい時、上位5件のみを表示させたい時などにも`.annotate()`は使える。

例えば`.annotate()`を使って、飲食店の電子メニューで、カテゴリごとの売上上位をまとめてトップページに表示すれば、顧客におすすめのメニューをすぐに試してもらうことができる。

こういったことは全てDjangoの公式ドキュメントにも書かれてあるので参考にしたい。

https://docs.djangoproject.com/en/3.1/topics/db/aggregation/#generating-aggregates-for-each-item-in-a-queryset

### 注意:複数の外部キーに対応したフィールドの個数を取得する時

このやり方では個数のカウントがおかしくなる。そこで、`distinct=True`とする。これで重複してカウントされることがなくなる。詳しくは下記を参照。

[Djangoで複数の外部キーに対応したフィールドの個数をカウントする【annotate(Count)+DISTINCT】](/post/django-foreign-count-distinct/)

