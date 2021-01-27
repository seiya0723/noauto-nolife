---
title: "【Nginx】1MB以上のファイルアップロードが出来ない場合の対処法"
date: 2021-01-26T17:27:37+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "サーバーサイド" ]
tags: [ "ウェブサーバー","Nginx" ]
---

ファイルアップロード系のウェブアプリを作り、デプロイも無事成功し、さあファイルをアップロードしようとすると、うまくアップロードされない事がある。

これはなぜか。ウェブサーバーの設定に施されたデフォルトのファイルアップロード上限容量が原因である。


## Nginxの場合の対策


`/etc/nginx/sites-available/`の中にあるサーバー起動用の設定ファイルを編集することで対処できる


    server {
        listen 80; 
        server_name 192.168.11.XXX;
    
        location    = /favicon.ico { access_log off; log_not_found off; }
        location /static/ {
            root /var/www/プロジェクト名;
        }   
        location /media/ {
            root /var/www/プロジェクト名;
        }   
        location / { 
            include proxy_params;
            proxy_pass http://unix:/run/gunicorn/プロジェクト名.sock;
        }   
    
        client_max_body_size 100M;
    }


末端の`client_max_body_size 100M;`を追加することで、最大100MBまでのファイルアップロードを許可する。

別の方法として、Nginx本体の設定ファイル( `/etc/nginx/nginx.conf` )を書き換えることでも対処できる。ただし、この方法で指定した内容はNginxで起動している全てのウェブアプリで適応されてしまうので非推奨。


    #====省略=====
    
    http {
            #=========省略==========
            client_max_body_size 100M;
    }


