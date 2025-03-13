---
title: "Djangoでローカルメモリキャッシュを使う"
date: 2025-03-13T10:31:02+09:00
lastmod: 2025-03-13T10:31:02+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

djangoで一時的にデータをメモリに記録して欲しい場合、ローカルメモリキャッシュを使う。

Redisと違って、プロセス単位で動くため python manage.py runserver を止めたり再起動させたりするとすぐに揮発してしまうが、Pythonオブジェクトの保存もできるため、使いどころを考えればとても便利。

## 使い方

settings.py に以下を追記。

```
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

これでキャッシュの設定は完了。

続いて、ビューなどの任意の箇所で

```
from django.core.cache import cache

topics = Topic.objects.all() 
cache.set('topics', topics, timeout=60)
```

などとキャッシュをセットすれば良い。取り出すには、

```
cache.get("topics")
```

とする。

以下で実際にローカルメモリキャッシュを使っている。

[DjangoでServerSentEvents(SSE)とローカルメモリキャッシュを使い、リアルタイムでDB内の情報を表示する](/post/django-sse-local-caches-realtime/)

