---
title: "Nginxにrtmp-moduleを加えてmake install。ffmpegでRTMP配信する映像をVLCで再生【ライブストリーミング再生】"
date: 2024-04-19T10:07:48+09:00
lastmod: 2024-04-19T10:07:48+09:00
draft: false
thumbnail: "images/nginx.jpg"
categories: [ "インフラ" ]
tags: [ "nginx","rtmp" ]
---



## RTMPモジュールありのNginx(最新版)をmakeでインストールする。

https://nginx.org/en/download.html

最新版のnginxをインストールする

```
wget https://nginx.org/download/nginx-1.25.5.tar.gz
tar -zxvf nginx-1.25.5.tar.gz
cd nginx-1.25.5
```


DLして、解凍したnginxディレクトリの中で、rtmp-moduleをGitHubからクローン
```
git clone https://github.com/arut/nginx-rtmp-module.git
```


rtmp-moduleのパスを `--add-module`引数に含めてビルドする。
```
./configure --add-module=./nginx-rtmp-module
make
sudo make install 
```

これでインストールは完了したが、プロセスはまだ起動していない状態。127.0.0.1 へアクセスしても何も表示されない。

そこで、プロセスを起動する。

```
sudo /usr/local/nginx/sbin/nginx
```

http://127.0.0.1/ へアクセスして、nginxが起動すればOK

ただし、この方法だと、PCを再起動するたびに先のコマンドを実行して、手動でNginxを起動しなければならない。

### Nginxをsystemdから自動起動させる

systemdを使ってNginxを自動起動させるように仕立てる。

まず、先程起動したnginxを停止させる

```
sudo killall nginx 
```

続いて、systemd のファイルを作る。

```
sudo vi /etc/systemd/system/nginx.service
```


内容は下記。
```
[Unit]
Description=nginx - high performance web server
After=network.target

[Service]
Type=forking
PIDFile=/usr/local/nginx/logs/nginx.pid
ExecStartPre=/usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/usr/local/nginx/sbin/nginx -s quit
KillSignal=SIGQUIT
TimeoutStopSec=5
KillMode=process
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

systemdの再読込とnginx.serviceを自動起動させる。
```
sudo systemctl daemon-reload

sudo systemctl enable nginx
```

これで先程、make install した最新版のNginx(rtmp-moduleあり)が自動起動するようになった。



### Nginxにて、RTMPの配信設定をする

下記から、設定ファイルを確認して

```
sudo vi /usr/local/nginx/conf/nginx.conf
```

RTMPの設定を追加する。

```
rtmp {
    server {
        listen 1935; # RTMPポート
        chunk_size 4096;

        application live {
            live on; 
            record off;
        }   
    }   
}
```


再度 restart する。statusも確認して、activeであれば、RTMPモジュールは追加されている。
```
sudo systemctl restart nginx 

sudo systemctl status nginx 
```

もし、ここでrtmpはないなどというエラーが出た場合は、rtmpモジュールのインストールに失敗していると言える。

ffmpegコマンドを使って、RTMPサーバーが正常に動いているかをチェックすることができる。

```
ffmpeg -f v4l2 -i /dev/video0 -f flv rtmp://127.0.0.1/live/1
```

参考: [FFmpegを使ってUbuntuサーバーにUSBで接続されたウェブカメラで映像を録画する](/post/ffmpeg-ubuntu-server-webcamera/)

VLCのネットワークから `rtmp://127.0.0.1/live/1` へアクセスするとウェブカメラの映像が表示される。

ただし映像は10秒ほど遅れているが。

もし、サーバーのカメラが取得した映像をリアルタイムで表示させたい場合、下記記事を使う方法もある。

[【Django】任意のタイミングでサーバーのカメラでライブ配信する【imutils.video.VideoStreamer】](/post/django-livestreamer-custom/)



