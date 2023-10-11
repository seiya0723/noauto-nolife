---
title: "【Ubuntu】systemdでPythonファイルを動作させる【常駐スクリプトに】"
date: 2023-10-05T15:30:41+09:00
lastmod: 2023-10-05T15:30:41+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","Python","インフラ","追記予定" ]
---


このPythonコードを動作させる。ファイルパスは`~/Documents/systemd/test.py`

```
import datetime, time 

while True:

    with open("test.txt", mode="w") as f:
        f.write( str(datetime.datetime.now()) )

    time.sleep(1)
```

必要最小限度の serviceファイルが以下。ファイルパスは`/etc/systemd/system/testpython.service`とする。

```
[Unit]
Description=write text file 
After=network.target

[Service]
ExecStart=/usr/bin/python3 test.py
WorkingDirectory=/home/testuser/Documents/systemd

[Install]
WantedBy=multi-user.target
```


下記で動作できる。

```
sudo systemctl start testpython.service
```

動作中は`/home/testuser/Documents/systemd/test.txt`が更新されていく。



