---
title: "【Django】admin.pyからカスタムアクションを追加し、管理サイトから実行【crontab、BaseCommandが使えない場合の対処法】"
date: 2021-06-14T17:33:41+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","システム管理" ]
---



[【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】](/post/django-command-add/)から、manage.pyのコマンドを追加することができる。

だが、誰もがmanage.pyのコマンドを実行できるとも限らない。crontabが使えない場合もある。

特にコマンドを打ったことのない人向けにシステムの管理を行ってもらう場合、GUIで操作できる管理サイトからアクションを追加する方法が妥当と言えよう。

そこで、本記事ではadmin.pyのアクションの追加方法を解説する。これにより予め用意しておいた処理を管理サイトから、GUIで簡単に実行できる。

## レコードの総数をチェック、指定したレコード数からあふれた分だけ古い順から削除するアクション

レコードが次々増えていくチャットサイトなどを運用するときに使う。本来であればこのような決まった処理はcrontabとBaseCommandの出番だが、手動でも操作できるようadmin.pyにアクションを追加しておく。


    from django.contrib import admin
    from .models import Topic
    
    LIMIT   = 5 
    
    class TopicAdmin(admin.ModelAdmin):
    
        list_display    = [ "id","comment","dt" ]
    
        actions         = [ "over_delete" ]
    
        def over_delete(self, request, queryset):
    
            #選択したレコードはquerysetオブジェクトに入るが、全件から削除を行う場合はquerysetオブジェクトは使わない。
            #しかし、レコードを選択しないとアクションは発動しないので、何でも良いので何かを選択させる
            topics  = Topic.objects.order_by("-dt")[LIMIT:]
                
            #TIPS:LIMITで絞り込んだ状態で.delete()メソッドは使えない
            for topic in topics:
                Topic.objects.filter(id=topic.id).delete()
    
            print(topics)
    
        over_delete.short_description   = "新着" + str(LIMIT) + "件だけ残して、それ以外は削除"
        over_delete.allowed_permissions = ["delete"]
        over_delete.acts_on_all = True
    
    
    admin.site.register(Topic,TopicAdmin)


ちなみにモデルはこうなっている。[40分Django](/post/startup-django/)のモデルに投稿日を追加している。

    from django.db import models
    from django.utils import timezone
    
    class Topic(models.Model):
    
        class Meta:
            db_table = "topic"
    
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        dt      = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
    
        def __str__(self):
            return self.comment
    


<div class="img-center"><img src="/images/Screenshot from 2021-06-15 10-17-40.png" alt="アクションの実装完了"></div>

これで新着の5件だけ残して、それ以外は全て削除することができる。

ただ、admin.pyのアクションは基本的に複数選択をしなければ発動しない。

この問題を解決するには継承元のModelAdminから書き換えを行う必要がある([BaseModelAdmin](https://github.com/django/django/blob/316cc34d046ad86e100227772294f906fae1c2e5/django/contrib/admin/options.py#L551)を継承したクラスを作り、それを継承してadmin.pyを作る)ので、とても手間がかかる。

下記リンクのように10年前のModelAdminクラスの書き換え無しでも動かすことができたが、今は無理っぽい。

https://stackoverflow.com/questions/4500924/django-admin-action-without-selecting-objects

やや冗長ではあるが、適当にセレクトを押した上でアクションを発動してもらう。

## 結論

admin.pyのアクションはレコードを選択し、選択したレコードに対して何かの処理を行うのが基本であるため、データ全件をCSVでDLするなどの処理でも、何かしら選択をしなければ発動しない。

しかし、管理サイトからデータを確認しながら、予め定義しておいた任意の処理を実行することができるので、コマンドが打てないノンプログラマーの管理者でも運用はしやすくなるだろう。

参考文献 https://docs.djangoproject.com/en/3.2/ref/contrib/admin/actions/
