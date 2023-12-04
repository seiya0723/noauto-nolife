---
title: "【Django】views.pyでユーザーモデルを扱う時は get_user_model を使う【importはダメ】"
date: 2023-11-26T20:30:24+09:00
lastmod: 2023-11-26T20:30:24+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","アンチパターン","tips" ]
---


これまで、ユーザーモデルをimportする時
```
from django.contrib.auth.models import User
```
もしくは、カスタムユーザーモデルの場合

```
from users.models import CustomUser
```

などとしてきたが、これでは通常のユーザーモデルから、カスタムユーザーモデル導入時にimport文をすべて書き換える必要が出てくる。

アプリが複数であれば、それをすべて書き換えていくのはとても面倒。

そこで、`get_user_model` を使う。これにより、カスタムユーザーモデルの転換時のコード編集の手間を減らすことができる。


## 理屈

この `get_user_model` は settings.pyの`AUTH_USER_MODEL`で指定したモデルを呼び出している。

`AUTH_USER_MODEL`はデフォルトでは `django.contrib.auth.models.User`を、カスタムユーザーモデル実装時にはその指定したカスタムユーザーモデルを指している。

つまり、`get_user_model`を使うことで、プロジェクトで使用しているユーザーモデルを柔軟に呼び出すことができるということだ。

## get_user_model を使う

django.contrib.auth の中に含まれているので、importして使う。

```
from django.contrib.auth import get_user_model

User = get_user_model()
```

以降はこのUserがユーザーモデルを指すようになる。

```
user = User.objects.filter(id=1).first()
```

このように通常のモデルと同じように扱うことができる。

## 用途と影響する範囲

### views.py

例えば、プロジェクト内にユーザーの個別ページを表示させる場合、Userモデルをimportしているのではないだろうか？

views.pyで`get_user_model()`を使うとよいだろう。


### models.py

ユーザーモデルとの1対多を作っている場合。

こちらも`get_user_model`を使うことで、カスタムユーザーモデルに転換した後の編集がなくなる。

### その他、常駐スクリプトなど

『[【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】](/post/django-command-add/)』で作った常駐スクリプト・常駐プログラム。

Userモデルをimportして、問題ありなユーザーを調べている場合、こちらも`get_user_model()`で置き換えることができるだろう。


## 結論

最初からカスタムユーザーモデルを実装する場合、あえて今回の`get_user_model`を実装しなくてもいい。

もしこれからプロジェクトを作っていくときには、`get_user_model` を使っておいたほうが後々柔軟に対応できるだろう。



