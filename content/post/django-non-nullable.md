---
title: "DjangoでYou are Trying to add a non-nullable fieldと表示されたときの対策【makemigrations】"
date: 2020-11-18T08:23:05+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","初心者向け" ]
---

Djangoのモデルにフィールドを追加して、さあマイグレーションしようとすると、こんな表示がされることがある。

<div class="img-center"><img src="/images/Screenshot from 2020-11-18 08-49-45.png" alt="NULL禁止フィールド追加が原因のエラー"></div>


これはなんなのか、対策も兼ねて解説する。


## 解説

要するに、既にレコードが存在する状態で、NULL禁止かつデフォルト値指定なしのフィールドを追加するとこうなる。


<div class="img-center"><img src="/images/Screenshot from 2020-11-18 08-49-18.png" alt="NULL禁止かつデフォルト無しだと既存レコードの扱いはどうするか聞かれる"></div>


デフォルト指定していないので、既存のレコードにはNULL禁止であるにも関わらず、NULLが入ってしまう。そこで既存のレコードはどうするか聞いている。与えられた選択肢は2つ。

    1) Provide a one-off default now (will be set on all existing rows with a null value for this column)
    2) Quit, and let me add a default in models.py

- 1) 1度限りのデフォルト値を入れる
- 2) 一旦`makemigrations`を中止して、models.pyに追加したフィールドにフィールドオプションのdefaultを指定する


## 対策

エラーが起こる前の`models.py`がこんな感じだったとする。

<div class="img-center"><img src="/images/Screenshot from 2020-11-18 08-27-37.png" alt="モデルフィールドの状態"></div>

DBにデータが格納されている状態で、モデルフィールドを追加する。NULL禁止、デフォルト値指定なしの投稿日時を指定するフィールドである。

<div class="img-center"><img src="/images/Screenshot from 2020-11-18 08-28-50.png" alt="NULL禁止、デフォルト指定なしのフィールドを追加"></div>

ここで`makemigrations`すると先の文言が端末に出力される。

<div class="img-center"><img src="/images/Screenshot from 2020-11-18 08-49-45.png" alt="NULL禁止フィールド追加が原因のエラー"></div>

今回は日時型なので1を選択する。続いて、シェルに`timezone.now()`と入力する。

<div class="img-center"><img src="/images/Screenshot from 2020-11-18 09-04-23.png" alt="現在の日時を指定してマイグレーション"></div>

これでマイグレーションファイルが作られた。後はマイグレーションするだけ。既存のデータにはマイグレーション時の日時が一時的に追加される。

<div class="img-center"><img src="/images/Screenshot from 2020-11-18 09-05-39.png" alt="現在の日時が指定された"></div>

一方で、常に`default`値を指定する場合は、2を選んで`models.py`にフィールドオプションの`default`を指定する。`DatetimeField`の場合、下記のように`default`を指定する。

    from django.utils import timezone
    dt      = models.DateTimeField(verbose_name="投稿日",default=timezone.now)

実行するときに値が変わる、メソッドの`timezone.now()`ではなく、その関数そのものを意味する属性値の`timezone.now`を指定する。`timezone`は`django.utils`の中に含まれているので、冒頭でインポートさせる。


## 結論

Djangoのモデルフィールドでは何も指定していないとNULL禁止になるので、安易にフィールドを追加して機能拡張しようと考えているとハマる。

とは言え、プロジェクト内の`db.sqlite3`を削除すれば普通にマイグレーションできる問題でもあるので対処法を知らなくても問題はない(既存データは消えるが)。



