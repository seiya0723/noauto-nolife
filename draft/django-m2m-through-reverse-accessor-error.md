---
title: "【Django】Reverse accessor for 'Topic.good' clashes with reverse accessor for 'Topic.user'.というエラーの対処【Topicに対する良いね、多対多中間フィールドあり】"
date: 2021-08-19T10:41:05+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け" ]
---


このエラーが発生する状況がやや複雑なので、状況から解説。

## このエラーが起こる状況

まず、カスタムユーザーモデルを実装している。

モデルの中身は[【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】](/post/django-custom-user-model-allauth-bbs/)から丸ごと流用。

そして、アプリのモデル。簡易掲示板に良いねと悪いね機能を実装している。

多対多の中間テーブルを手動で定義している。詳細は[【django】ManyToManyFieldでフィールドオプションthroughを指定、中間テーブルを詳細に定義する【登録日時など】](/post/django-m2m-through/)を確認。


    from django.db import models
    from django.utils import timezone
    from django.conf import settings
    
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        dt          = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="投稿者",on_delete=models.CASCADE)
        comment     = models.CharField(verbose_name="コメント",max_length=200)
    
        good        = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="良いね",through="GoodTopic")
        bad         = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="悪いね",through="BadTopic")
    
        def __str__(self):
            return self.comment
    
    
    class GoodTopic(models.Model):
    
        class Meta:
            db_table = "good_topic"
    
        dt          = models.DateTimeField(verbose_name="良いねした時刻",default=timezone.now)
        good_user   = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="良いねしたユーザー",on_delete=models.CASCADE)
        good_target = models.ForeignKey(Topic,verbose_name="良いねしたトピック",on_delete=models.CASCADE)
    
    
    class BadTopic(models.Model):
    
        class Meta:
            db_table = "bad_topic"
    
        dt          = models.DateTimeField(verbose_name="悪いねした時刻",default=timezone.now)
        bad_user    = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="悪いねしたユーザー",on_delete=models.CASCADE)
        bad_target  = models.ForeignKey(Topic,verbose_name="悪いねしたトピック",on_delete=models.CASCADE)


さて、この上記モデルはトピックに対して、良いね、悪いねを送信することができる。排他ではなく両方送信が可能。そして、良いね、悪いねしたユーザーのリストはトピックのフィールド(goodとbad)から確認できる。

実際にマイグレーションを実行すると、下記のようなエラーが出る。

<div class="img-center"><img src="/images/Screenshot from 2021-08-19 13-04-42.png" alt="マイグレーション時エラー"></div>

ちなみにモデルがこの状態であれば、manage.py系コマンドではいずれも問答無用で上記エラーが出る。

## なぜこのエラーが起こるのか。

モデルのリレーションをイラストに書けばその理由がわかる。

まず、ややこしくなるので、BadTopicモデルを除外して考える。TopicとGoodTopic、CustomUserのリレーションは下記の画像のように繋がっている。

<div class="img-center"><img src="/images/Screenshot from 2021-08-19 13-09-15.png" alt="リレーション図"></div>

このようにループ状になっている。このループ状のリレーション自体は間違いではない。問題は、フィールドの参照である。

上記図のようにTopicは`user`フィールドからCustomUserモデルを参照できる。一方でGoodTopicは`good_user`フィールドからCustomUserモデルを参照できる。

この参照が問題ありなのだ。この状況の時、フィールドオプションの`related_name`がないと、双方でCustomUserモデルのフィールド参照時に、フィールド名の衝突が発生してしまう。

そこで、まずはBadTopicモデルをコメントアウトして、`related_name`のフィールドオプションを指定する。ただし、そのフィールドオプションを指定するのは、Topicの`user`フィールドである。


    from django.db import models
    from django.utils import timezone
    from django.conf import settings
    
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        dt          = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="投稿者",on_delete=models.CASCADE,related_name="posted_user")
        comment     = models.CharField(verbose_name="コメント",max_length=200)
    
        good        = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="良いね",through="GoodTopic")
        #bad         = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="悪いね",through="BadTopic")
    
        def __str__(self):
            return self.comment
    
    
    
    class GoodTopic(models.Model):
    
        class Meta:
            db_table = "good_topic"
    
        dt          = models.DateTimeField(verbose_name="良いねした時刻",default=timezone.now)
        good_user   = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="良いねしたユーザー",on_delete=models.CASCADE)
        good_target = models.ForeignKey(Topic,verbose_name="良いねしたトピック",on_delete=models.CASCADE)
    
    """
    class BadTopic(models.Model):
    
        class Meta:
            db_table = "bad_topic"
    
        dt          = models.DateTimeField(verbose_name="悪いねした時刻",default=timezone.now)
        bad_user    = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="悪いねしたユーザー",on_delete=models.CASCADE)
        bad_target  = models.ForeignKey(Topic,verbose_name="悪いねしたトピック",on_delete=models.CASCADE)
    
    """


Topicのuserフィールドのフィールドオプションとして、`related_name="posted_user"`を付与する。これで、ひとまずは全てのエラーは消える。

ただ、この状態でBadTopicモデルクラスのコメントアウト、Topicのbadフィールドのコメントアウトをそれぞれ外すと、また下記のようにエラーが出てしまう。

<div class="img-center"><img src="/images/Screenshot from 2021-08-19 13-21-13.png" alt="BadTopicのコメントアウトを外すと出るエラー。"></div>


この状況を先ほどと同様に図で表現するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-08-19 13-47-53.png" alt="オレンジの線が問題で、赤い線が重複している。"></div>

このオレンジの線(M2Mのgoodとbad)が原因で、赤い線(それぞれのモデルとCustomUser、Topicとつなぐフィールド)で重複が発生している。

この問題を解決するには、まず、オレンジの線(M2Mのgoodとbad)に`related_name`のフィールドオプションを指定することでエラーを解消する。エラー文をよく読むと、ヒントとして下記のように書かれてある。

	HINT: Add or change a related_name argument to the definition for 'Topic.bad' or 'Topic.good'.
	HINT: Add or change a related_name argument to the definition for 'Topic.good' or 'Topic.bad'.

つまり、Topicのbad、goodの両方に`related_name`フィールドオプションを指定すれば良いようだ。

そこで、下記のようにモデルを書き換える。

    from django.db import models
    from django.utils import timezone
    from django.conf import settings
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        dt          = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        user        = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="投稿者",on_delete=models.CASCADE,related_name="posted_user")
        comment     = models.CharField(verbose_name="コメント",max_length=200)
    
        good        = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="良いね",through="GoodTopic",related_name="posted_good")
        bad         = models.ManyToManyField(settings.AUTH_USER_MODEL,verbose_name="悪いね",through="BadTopic",related_name="posted_bad")
    
        def __str__(self):
            return self.comment
    
    class GoodTopic(models.Model):
    
        class Meta:
            db_table = "good_topic"
    
        dt          = models.DateTimeField(verbose_name="良いねした時刻",default=timezone.now)
        good_user   = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="良いねしたユーザー",on_delete=models.CASCADE)
        good_target = models.ForeignKey(Topic,verbose_name="良いねしたトピック",on_delete=models.CASCADE)
    
    class BadTopic(models.Model):
    
        class Meta:
            db_table = "bad_topic"
    
        dt          = models.DateTimeField(verbose_name="悪いねした時刻",default=timezone.now)
        bad_user    = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="悪いねしたユーザー",on_delete=models.CASCADE)
        bad_target  = models.ForeignKey(Topic,verbose_name="悪いねしたトピック",on_delete=models.CASCADE)
    
    
これでエラーが消える。後はマイグレーションをするだけ。


## 結論

ちなみに、わかりやすいようにGoodTopic及びBadTopicのフィールドをそれぞれ、`good(bad)_user`、`good(bad)_target`としたが、それぞれただの`user`と`target`でも問題はない。

リレーションの原理がよくわからなくても、今後同様のエラーが発生した場合はHINTをよく読んで、該当のフィールドに`related_name`のフィールドオプションを書き込めばとりあえずは解決する。



