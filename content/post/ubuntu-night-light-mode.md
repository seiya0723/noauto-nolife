---
title: "Ubuntuの夜間モードが通用しない場合の対処法"
date: 2025-05-02T07:02:16+09:00
lastmod: 2025-05-02T07:02:16+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "others" ]
tags: [ "Ubuntu","tips" ]
---


## GUIから夜間モードの操作をする。

```
gnome-control-center display
```

これで夜間モードの設定画面が開く。



## コマンドから夜間モードを有効にする。

```
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true
```

これでONになり、
```
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled false
```
これでOFFになる。ショートカットキーにも割り当てておけば便利かもしれない。



## どうしても夜間モードが効かない場合は？

ログアウトして再度ログインする。これでデスクトップが起動し直され、夜間モードが正常に機能する。



