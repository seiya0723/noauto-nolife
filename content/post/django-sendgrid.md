---
title: "Django・PythonでSendgridを実装しメールを送信する方法【APIキーと2段階認証を利用する】"
date: 2021-02-12T17:48:49+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","Sendgrid","tips","Python","allauth","Pythonライブラリ" ]
---

Sendgridのパスワードを使用したメール送信が廃止され、APIを使用した2段階認証が強制されるため、ここに対策を記す。本記事はDjango(Python)を対象とした対策について解説する。

## django-sendgrid-v5のインストール

APIを使用するために、pipにて`django-sendgrid-v5`をインストールさせる。

    pip install django-sendgrid-v5

## settings.pyにて設定を施す

settings.pyの任意の場所に下記のコードを記述する。

    EMAIL_BACKEND       = "sendgrid_backend.SendgridBackend"
    SENDGRID_API_KEY    = "ここにsendgridのAPIkeyを記述する"

    SENDGRID_SANDBOX_MODE_IN_DEBUG = False

これで[Django-allauthのメール認証](/post/startup-django-allauth/)も動く。

## Djangoでメール送信をする

先の項目をsettings.pyに格納し、例えば、viewsであれば下記のようにすればIndexViewにGETメソッドがリクエストされるたび、メールが送信される仕組みになる。

    from django.shortcuts import render
    from django.views import View


    from django.core.mail import send_mail

    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            subject = "ここに件名を入れる"
            message = "ここに本文を入れる"
    
            from_email = huga@gmail.com
            recipient_list = [ "hoge@gmail.com" ]
            send_mail(subject, message, from_email, recipient_list)
    
            return render(request,"bbs/index.html")
    
    index   = IndexView.as_view()


## 素のPythonに実装する方法

Djangoではなく、素のPythonにSendgridのAPIを実装するには`sendgrid`ライブラリをインストールする。

    pip install sendgrid

続いて、任意のPythonコードに下記スニペットを追加。

    import sendgrid
    from sendgrid.helpers.mail import *
    
    SENDGRID_API    = "ここにAPIKeyを記述する"
    
    sg          = sendgrid.SendGridAPIClient(api_key=SENDGRID_API)
    from_email  = Email("送信元のメールアドレス")
    to_email    = To("宛先のメールアドレス")
    subject     = "メールの件名"
    content     = Content("text/plain", "ここに本文")
    mail        = Mail(from_email, to_email, subject, content)
    response    = sg.client.mail.send.post(request_body=mail.get())

これで、メール送信型のPythonのバッチ処理のスクリプトも動く。


## 結論

[APIキーの作成方法は公式に掲載されている](https://sendgrid.kke.co.jp/docs/User_Manual_JP/Settings/api_keys.html#-Create-an-API-Key)のでそちらを参考にしたい。APIキーの権限はメール送信さえあれば十分だろう。

ちなみに、django-sendgrid-v5の実装方法は、GitHubのページからの受け売りである。

https://github.com/sklarsa/django-sendgrid-v5
