---
title: "【Django】ログイン時にメールを送信するには、signal.pyを作ってapps.pyに登録しておく【セキュリティ通知】"
date: 2023-11-27T14:04:33+09:00
lastmod: 2023-11-27T14:04:33+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","認証" ]
---

セキュリティ対策の一環として、ログイン時にメールを送信させる。

すでにsettings.pyにメール送信設定を実装済みとする。

- [【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】](/post/startup-django-allauth/)


## appname/signals.py を作る。

関数にデコレータを当てて、ログインの信号を受けたら発動する。


```
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.conf import settings
from django.core.mail import EmailMessage

@receiver(user_logged_in)
def user_logged_in_callback(sender, request, user, **kwargs):
    # ログインをしたときの処理

    #送信元のIPアドレスを手に入れる
    ip_list = request.META.get('HTTP_X_FORWARDED_FOR')
    if ip_list:
        ip  = ip_list.split(',')[0]
    else:
        ip  = request.META.get('REMOTE_ADDR')


    user_agent  = request.META.get('HTTP_USER_AGENT')


    body = "ご利用ありがとうございます。下記端末でログインされました。\n\n"
    body += f"IPアドレス: {ip}\n"
    body += f"ユーザーエージェント: {user_agent}\n\n"

    msg = EmailMessage(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[ request.user.email ],
            subject ="セキュリティ通知",
            body=body,
          )

    msg.send(fail_silently=False)

    print(f'{user.username}がログインしました。')

@receiver(user_logged_out)
def user_logged_out_callback(sender, request, user, **kwargs):
    # ログアウトをしたときの処理
    print(f'{user.username}がログアウトしました。')

```

## appname/apps.py に追記する。

例えば、appname が accountsの場合は下記のようになる。

```
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import accounts.signals

```

同じアプリディレクトリ内のsignals.pyを読んでいる。


### 動かすとこうなる

<div class="img-center"><img src="/images/Screenshot from 2023-11-27 14-23-43.png" alt=""></div>



