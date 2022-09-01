---
title: "Djangoでmakemigrationsコマンドを実行しても、No changes detectedと言われる場合の対処法"
date: 2021-04-28T15:00:56+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---

Djangoでマイグレーションファイルを作る

    python3 manage.py makemigrations 

このコマンドを実行しても返ってくるのが、

    No changes detected

とされ、マイグレーションファイルが作られないことがある。当然この状態で`migrate`コマンドを打ってもDBには反映されない。

そこで、本記事ではこの対処法について列挙する。


## 対処法1:settings.pyのINSTALLED_APPSに対象のアプリを追加

    python3 manage.py makemigrations 
    python3 manage.py migrate

この2つのコマンドを打って、models.py(モデル)に書かれた内容をDBに反映させるのだが、その際にモデルが読み込まれるのは、`settings.py`の`INSTALLED_APPS`に追加されたアプリだけである。

つまり、`settings.py`の`INSTALLED_APPS`に追加されていなければ、いくらモデルを正しく記述してもDBには反映されない。故に『`No changes detected`』と言われてしまう。


## 対処法2:makemigrationsにアプリ名を追加する。

マイグレーションファイル作る時、

    python3 manage.py makemigrations 

ではなく、
    
    python3 manage.py makemigrations [アプリ名]

とする。これでマイグレーションファイルが作られる。この状態が起こりうるのは、`[アプリ名]`の`migrations`ディレクトリを手動で削除した時。

`migrations`ディレクトリを削除して、1から作り直したいときなどにハマることがあるので、そのときは上記コマンドの用に`[アプリ名]`を明示的に指定してマイグレーションファイルを作らせる。

## 対処法3:migrationsディレクトリをチェックする

実はすでに`makemigrations`でマイグレーションファイルが作られていて、『No changes detected』と言われているパターン。

アプリディレクトリ内にある`migrations`ディレクトリをチェックする。`models.py`の変更がマイグレーションファイルに反映されているかチェックする。同時に、`models.py`を編集した後、保存していないかもチェックする。

`models.py`が書き換わり、保存され、なおかつ`INSTALLED_APPS`にアプリが追加されている場合に限り、アプリが作られる点に注意する。


## 結論

Djangoのマイグレーションファイル生成はLaravelなどと違って、コマンド一発の自動生成なので、ハマる場合はかなりハマる。

自動生成は便利ではあるが、モデル変更の解釈も自動生成に委ねられるので、気に入らない場合は自分でマイグレーションファイルを書き換えする必要がある。この辺りも初見殺しとしか。

