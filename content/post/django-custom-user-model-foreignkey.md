---
title: "Djangoでカスタムユーザーモデルを外部キーとして指定する方法"
date: 2021-02-20T11:13:37+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","上級者向け","認証" ]
---

例えば、簡易掲示板で投稿者のユーザーIDを外部キーとして指定したい場合がある。

作ったカスタムユーザーモデルを外部キーとして通常のアプリから指定する方法を解説する。

## カスタムユーザーモデルを外部キーとして指定する

まず、`settings.py`に下記のような設定がされているとする。`users`アプリの`CustomUser`クラスを指定している。

    AUTH_USER_MODEL = 'users.CustomUser'

続いて、任意のアプリのモデルを編集する。

    from django.db import models
    from django.utils import timezone
    from django.conf import settings 
    import uuid
    
    class Topic(models.Model):
    
        id      = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
        dt      = models.DateTimeField(verbose_name="投稿日",default=timezone.now)
        comment = models.CharField(verbose_name="コメント",max_length=2000)
        user    = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="ユーザー",on_delete=models.CASCADE)
    
        def __str__(self):
            return self.comment

このように、まずは冒頭`from django.conf import settings`でsettings.pyをインポートする。

続いて、

    user    = models.ForeignKey(settings.AUTH_USER_MODEL,verbose_name="ユーザー",on_delete=models.CASCADE)

とする。`ForeignKey`の対応するモデルクラスは`settings.AUTH_USER_MODEL`、即ち、`users.CustomUser`のことである。

`users`アプリの`CustomUser`をインポートすればいいじゃんって思うかも知れないが、Pythonの構文上それはできない。できたとしても、`settings.py`で指定するカスタムユーザーモデルと外部キーで対応付けるカスタムユーザーモデルに一貫性がなくなってしまう可能性があるため、やめたほうが良いだろう。


ビューのPOST文の処理では以下のように`user`フィールドに値を入れる。


    #--省略--

        def post(self, request, *args, **kwargs):
    
            copied          = request.POST.copy()
            copied["user"]  = request.user.id
    
            form    = TopicForm(copied)
        
            if form.is_valid():
                form.save()
            else:
                print("バリデーションエラー")
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()

`.copy()`メソッドを使ってコピー、`request.user.id`にカスタムユーザーモデルのIDが含まれているのでそれを当てる。後はバリデーションをした上でDBに保存すればOK

もし、ユーザーのそれ以外の情報が欲しい場合は、外部キーから参照すれば良い。

## 結論

これで投稿者のユーザーモデルと紐付けができるので、ハンドルネームを変えたり、プロフィール画像を変えたりしたとしても、投稿内容はIDに紐付いているので追随できる。

今回はユーザーのアカウントが削除されたら同時に投稿内容も削除されるよう、`on_delete=CASCADE`とした。

ちなみに、カスタムユーザーモデルを使用しない場合(デフォルトのユーザーモデルを使用する場合)、下記を参照。

[【Django】ユーザーモデルと1対多のリレーションを組む方法【カスタムユーザーモデル不使用】](/post/django-foreignkey-user/)

