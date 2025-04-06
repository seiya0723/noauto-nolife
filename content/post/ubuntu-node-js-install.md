---
title: "Ubuntuにnode.jsを手動でインストールする【tar.xz ファイルの解凍と】"
date: 2025-04-04T21:05:31+09:00
lastmod: 2025-04-04T21:05:31+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "node.js","JavaScript","Ubuntu" ]
---


https://nodejs.org/ja Nodeの公式サイトにアクセスする。

最新版のファイルをDLして、

https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz

ファイルを解凍する。
```
tar -xJf node-v22.14.0-linux-x64.tar.xz
```
オプションの x は解凍。 J は xz圧縮形式の解凍 f はファイル指定。

```
cd node-v22.14.0-linux-x64
```

回答したファイルをすべて /usr/local/ に配置する。

```
sudo cp -r * /usr/local/
```


