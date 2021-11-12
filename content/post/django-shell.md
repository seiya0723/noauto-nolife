---
title: "Djangoのインタラクティブシェルを使う【python3 manage.py shell】"
date: 2021-11-06T09:30:02+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

Djangoに含まれているライブラリを普通のPythonのインタラクティブシェルで動かそうとしても、`manage.py`の環境変数や`settings.py`が無ければ動かない。

だから、Django関係のライブラリを試しに動かしたい時は、

    python3 manage.py shell

とする。

## 用途


### Djangoに含まれるライブラリの動作検証

例えば、django.utils.timezoneなどはPythonのインタラクティブシェルでは動作しない。予め

    python3 manage.py shell

を実行した上で、timezoneをimportする必要がある。

    from django.utils import timezone

    timezone.now()

この時、`settings.py`の`USE_TZ`が参照される。

### DBへデータ挿入

Django公式のチュートリアルではシェルを使って、直接DBへデータを挿入している。

https://docs.djangoproject.com/ja/3.2/intro/tutorial02/#playing-with-the-api

とはいえ、こんなことをしなくてもDBにデータを挿入する方法なら他にもある。

例えば、[admin.pyにて、モデルを登録して管理サイトからデータを挿入する](/post/django-admin/)とか、[予めjsonで作っておいたデータをリストアする](/post/django-loaddata/)とか。





