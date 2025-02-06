---
title: "【Django】DBの保存(投稿と編集)、削除に対して任意の動作をする【signals】"
date: 2025-02-06T09:35:41+09:00
lastmod: 2025-02-06T09:35:41+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

モデルの保存時、削除時に任意の動作をしたい時、モデルのsaveメソッドをオーバーライドするなどで対応できる。

[DjangoでDBへデータ格納時(save)、削除時(delete)に処理を追加する【models.py、forms.py、serializer.pyのメソッドオーバーライド】](/post/django-models-save-delete-override/)

ただ、別のモデルに対しても同じ処理を実行したい時、モデルの外部で処理をしたい場合などでは、singalsを使う。

## 実装方法

### signals.py をつくる

先の内容をsignals.py にまとめる

```
from django.core.cache import cache
from .models import Topic

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Topic)
def update_cache_on_save(sender, instance, **kwargs):
    topics = Topic.objects.all()
    cache.set('topics', topics, timeout=60)

@receiver(post_delete, sender=Topic)
def update_cache_on_delete(sender, instance, **kwargs):
    topics = Topic.objects.all()
    cache.set('topics', topics, timeout=60)
```

これは、Topicモデルが保存される時、削除される時に、ローカルメモリキャッシュに対してデータのセットをしている。


### apps.py の編集

先のsignals.pyの作成だけでは、Djangoは読み込みをしてくれないので、apps.py にimportするように書いておく。

例えば、bbsアプリのapps.pyで、signals.pyを読むには、こうする。

```
from django.apps import AppConfig

class BbsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bbs'

    def ready(self):
        import bbs.signals
```


## 結論

これでTopicの保存・削除時にキャッシュを再読込することができる。

その他、備考をまとめる。

- 他のアプリや管理サイト上での保存・削除も発火する
- .update() でデータを編集した場合、saveメソッドが実行されないので発火しない
- raw SQL でデータの作成・編集・削除をした場合も、saveメソッドが実行されないので発火しない
- signals.py を作って管理する(views.pyやmodels.pyでも動作はするが、signalsが分散するとテストが大変)

## 参考文献

- [【Django】ログイン時にメールを送信するには、signal.pyを作ってapps.pyに登録しておく【セキュリティ通知】](/post/django-login-mail-by-signal/)
- https://docs.djangoproject.com/en/5.1/topics/signals/
