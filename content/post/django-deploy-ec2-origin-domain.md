---
title: "【Django+AWS】独自ドメインを割り当てHTTPS通信を実現した状態で、EC2(Ubuntu+Nginx)へデプロイする"
date: 2021-09-13T08:19:27+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","上級者向け","セキュリティ","ec2","nginx" ]
---

既に、[【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】](/post/ec2-origin-domain-https/)の内容を終え、独自ドメインでHTTPS通信が可能な状態である前提で解説する。

一部、[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)と内容が重複しているが、AWS側の設定は一切行わない。書き換えが必要なのは、`settings.py`の`ALLOWED_HOSTS`とNginxの設定ファイル。それぞれ独自ドメイン実装済みの仕様に合わせる。

## settings.py

`ALLOWED_HOSTS`には独自ドメインを入れる。例えば、独自ドメインがseiya0723.xyzだったら、

    ALLOWED_HOSTS = [ "seiya0723.xyz" ]

これでOK。

## Nginxの設定

Nginxの設定ファイル、`/etc/nginx/sites-available/[アプリ名]`の`server_name`にも独自ドメインを指定する。

    server {
        listen 80;
        server_name seiya0723.xyz;
    
        location = /favicon.ico { access_log off; log_not_found off; }
        location /static/ {
            root /var/www/django_fileupload;
        }
        location /media/ {
            root /var/www/django_fileupload;
        }
        location / {
            include proxy_params;
            proxy_pass http://unix:/home/ubuntu/Documents/django_fileupload/django_fileupload.socket;
        }
    
        client_max_body_size 100M;
    }

`server_name`にseiya0723.xyzを指定。ポート番号は80番のままで良い。ロードバランサとEC2の経路はHTTPであるから。


## systemctl restart

以上の設定が完了したら、systemctlコマンドを使って、Nginx、gunicornをrestartさせる。

    sudo systemctl restart nginx gunicorn

再起動され、設定が再読込されるまで1~2分ほどかかることもある。


## 動かない時

この設定で動かない時、AWSのセキュリティ設定に問題があると思われる。独自ドメインがきちんと割り当てられていないか、あるいはEC2インスタンスのセキュリティでロードバランサからの80番アクセスが許可されていないか等が考えられる。

## 結論

尚、BadRequest(400)が出るのは、この`ALLOWED_HOSTS`か`Nginx`の設定の`server_name`が間違っているためである。


