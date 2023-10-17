---
title: "Djangoのmanage.pyのコマンドをsystemdから動かして常駐化【データを常にチェックし、Sendgridでメール送信】"
date: 2023-10-13T13:56:41+09:00
lastmod: 2023-10-13T13:56:41+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","インフラ","Ubuntu","システム管理","デプロイ","上級者向け","systemd" ]
---


Djangoでは、manage.pyコマンドを追加することができる。

参照: [【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】](/post/django-command-add/)

これにより、例えばTodoリストの期限が切れたデータをチェックして、Sendgridを使ってメールで通知できる。

しかし、デプロイをした後は別途systemdによる管理が必要になる。

本記事では、デプロイ後のmanage.pyの独自コマンドの動作を想定し、systemdのserviceファイルを作る。

## 動かしたいDjangoコマンドのコード

`todo/management/commands/todocheck.py`の中身を下記とする。

```
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from ...models import Todolist

import time

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        print("これでコマンドが実行できる。")

        while True:

            #TODO: Todolistのチェックをする(省略)


            #TODO: メールの送信をする。
            subject = "ここに件名を入れる"
            message = "ここに本文を入れる"

            from_email = "送信元メールアドレス"
            recipient_list = [ "送信先メールアドレス" ]
            send_mail(subject, message, from_email, recipient_list)

            time.sleep(10)
```

これにより

```
python3 manage.py todocheck
```

で上記コードを動作できる。

参照: [【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】](/post/django-command-add/)


## Djangoコマンドを動作させるserviceファイル


`/etc/systemd/system/todo.service`の中身を下記とする。

```
[Unit]
Description=write text file 
After=network.target

[Service]
User=[ユーザー名]
WorkingDirectory=/home/[ユーザー名]/Documents/[プロジェクト名]
ExecStart=/home/[ユーザー名]/Documents/[プロジェクト名]/venv/bin/python3 /home/[ユーザー名]/Documents/[プロジェクト名]/manage.py todocheck
Restart=always

# TODO: 環境変数のセット
Environment="SENDGRID_APIKEY=[ここにSENDGRIDのAPIキーを入れる。]"

[Install]
WantedBy=multi-user.target
```

今回、SendgridのAPIキーは環境変数から読み込みするようにしているので、serviceファイル内に環境変数を追加している。

また、仮想環境を通した上で、コマンドを動作させている。

この`todo.service`を動作させる。自動起動を有効化させる。ステータスも確認しておく。

```
sudo systemctl start todo
sudo systemctl enable todo
sudo systemctl status todo
```

## 結論

これにより、デプロイ後も常駐ファイルを動かすことができる。

`@reboot`を使ってcrontabから動かすこともできるが、仮に例外が出ても自動で再起動してくれないので、systemdのほうが良いだろう。


## 関連記事

- [DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)
- [Django・PythonでSendgridを実装しメールを送信する方法【APIキーと2段階認証を利用する】](/post/django-sendgrid/)
- [【Ubuntu】systemdでPythonファイルを動作させる【常駐スクリプトに】](/post/systemd-run-python/)
- [【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】](/post/django-command-add/)

