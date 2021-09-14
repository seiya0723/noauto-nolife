---
title: "【Django+Sendgrid】サーバー処理中(ビュー、独自コマンド)に通知メール(To,CC,BCC)を送信する"
date: 2021-09-15T07:48:47+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","sendgrid","システム管理" ]
---

[DjangoでSendgridを実装させる方法【APIキーと2段階認証を利用する】](/post/django-sendgrid/)で解説したとおり、SendgridのAPIキーを`settings.py`に書けばallauthでメール送信ができる。

だが、サーバーの処理中(ビューや`manage.py`系の独自コマンド)でメールを送信するには`settings.py`のメール設定を読み込む必要がある。


## ソースコード

まず、前回と同様に`settings.py`にてAPIキーを入力

    from .local_settings import *
    
    EMAIL_BACKEND       = "sendgrid_backend.SendgridBackend"
    #SENDGRID_API_KEY    = "local_settings.pyにて"
    
    #サンドボックスを無効化
    SENDGRID_SANDBOX_MODE_IN_DEBUG = False
    
    #DEBUGがTrueのとき、メールの内容は全て端末に表示させる
    """
    if DEBUG:
        EMAIL_BACKEND   = "django.core.mail.backends.console.EmailBackend"
    """

その設定を各所で読み込みをする。SendgridのAPIキーから読み込みを始める必要はない。`EmailMessage`を使用する。

下記は簡易掲示板にアクセスしたら指定した箇所にメールを送信する。

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    
    from django.core.mail import EmailMessage
    
    class BbsView(View):
    
        def get(self, request, *args, **kwargs):
    
            msg = EmailMessage(
              from_email="ここに送信元",
              to=["ここに送信先"],
              cc=["ここにカーボンコピー"],
              bcc=["ここにブラインドカーボンコピー"],
              subject="テストテスト",
              body="これは本文",
            )
            msg.send(fail_silently=False)
    
            print(Topic.objects.all().query)
    
            topics  = Topic.objects.all()
            context = { "topics":topics }
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            posted  = Topic( comment = request.POST["comment"] )
            posted.save()
    
            return redirect("bbs:index")
    
    index   = BbsView.as_view()


後はこれに倣って、`EmailMessage`をインポートした上で送信を行う。

ちなみに、`from_email`と`to`と`subject`は入力必須。さらに、メール送信時にはSendgridのサーバーにアクセスしているため、やや処理に時間がかかる(宛先2つで3秒ほど)。このようにビューの中にメール送信の処理を実装するのはできれば避けておきたいところだ。

できれば、[独自にコマンドを作って常駐化](/post/django-command-add/)させ、送信したほうがリクエストがタイムアウトしてしまうことも無い。

## 実際に送信するとこうなる。

送信するとこうなる。BCCの内容はメールのヘッダに思いっきりBCCと書かれてあるので、実践でBCCを指定するのは避けたほうが良いかも知れない。画像には無いが、CCを使うとリスト型に指定した送信先メールアドレスの文字列全部が書かれるので、個人情報保護の観点から厳禁。

<div class="img-center"><img src="/images/Screenshot from 2021-09-15 08-02-20.png" alt="BCCで送信するとヘッダに表示されてしまう。"></div>

実践では、forループで回して、toを個別に指定するのが妥当かと思われる。



