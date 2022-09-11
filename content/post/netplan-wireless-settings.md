---
title: "【Ubuntu】netplanに無線LAN(wifi)で固定IPアドレスを割り当てる"
date: 2022-09-10T17:48:36+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "システム管理","ネットワーク","無線LAN" ]
---

有線であれば以下のように書く。

```
network:
  ethernets:
    eth0:
      dhcp4: false
      addresses:
      - 192.168.11.246/24
      routes:
      - to: default
        via: 192.168.11.1
      nameservers:
        addresses:
        - 192.168.11.1
  version: 2

```

無線LANの場合、`ip addr`で表示される無線LANのデバイス名を控えた上で下記のように記す

```
network:
  wifis:
    wlan0:
        dhcp4: false
        addresses:
        - 192.168.11.246/24
        routes:
        - to: default
          via: 192.168.11.1
        nameservers:
          addresses:
          - 192.168.11.1
        access-points:
          "SSIDname":
            password: "password"
  version: 2
```

