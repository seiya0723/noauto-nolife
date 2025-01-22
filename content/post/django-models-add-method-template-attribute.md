---
title: "Djangoのモデルに独自メソッドを追加、テンプレートに表示【フィールド間の計算、他モデルの値の表示などに有効】"
date: 2021-08-07T16:28:40+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

モデルにメソッドを追加することで、テンプレート側から属性値として参照することができる。

    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        time        = models.IntegerField(verbose_name="活動時間(分)",default=0)
        level       = models.IntegerField(verbose_name="負荷レベル",default=0)

        def score(self):
            return self.time*self.level
    
        def __str__(self):
            return self.comment


テンプレートからこのモデルオブジェクトの`.score`を参照すると、計算結果が出力される。

    {{ topic.score }}


間違っても下記のように書かないように。当然だが、フィールド名の重複にも注意。後書き有利。


    from django.db import models
    
    class Topic(models.Model):
    
        comment     = models.CharField(verbose_name="コメント",max_length=2000)
        time        = models.IntegerField(verbose_name="活動時間(分)",default=0)
        level       = models.IntegerField(verbose_name="負荷レベル",default=0)

        #後続のscoreメソッドにより上書きされるためこれは意味ない。
        #score       = models.IntegerField(verbose_name="負荷レベル",default=0)

        """ 
        #これらは動かない。
        #score       = time*level
        #score       = self.time*self.level
        """ 

        def score(self):
            return self.time*self.level
    
    
        def __str__(self):
            return self.comment


## 別のモデルクラスの値を参照する。

例えば、通知のモデルクラスと、ユーザーのモデルクラスが、多対1で繋がっている場合、通知の総数を知りたい時は下記のように記述すれば良い。


    #========省略===========

    from tube.models import NotifyTarget
    
    
    #ここ( https://github.com/django/django/blob/master/django/contrib/auth/models.py#L321 )から流用
    class CustomUser(AbstractBaseUser, PermissionsMixin):

        #========省略===========

        #通知の数をカウントして返却する。
        def notify_num(self):
            return NotifyTarget.objects.filter(user=self.id,read=False).count()

これで、ユーザーモデルのオブジェクトは

    {{ request.user.notify_num }}
    
などとして通知の総数を確認することができる。

ユーザーモデルは常に返却されるrequestオブジェクトから参照できるため、ビュー側で検索の処理をしなくてもいい。ヘッダーなど常に表示される箇所はこのようにして簡単に表示できるので、ビューの処理の大幅な削減が期待できる。

ただし、カスタムユーザーモデルなど、通常のモデルとファイルが分離されている状況にある場合、importする側される側の関係を考慮しなければ動作しない。


## 結論

フィールド間の計算、他モデルの参照などはこれで実現できる。毎度毎度モデルオブジェクトを作るたびにビュー側で参照しているようではコードが長くなるので、これは有効に活用したいところだ。

当然ではあるが、saveとdeleteは既に使われているメソッドであるため、上書きしてはならない。


