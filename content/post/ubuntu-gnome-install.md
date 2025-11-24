---
title: "サーバー版UbuntuにGNOMEをインストールする"
date: 2025-11-23T06:49:36+09:00
lastmod: 2025-11-23T06:49:36+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","gnome" ]
---


```
sudo apt install ubuntu desktop

sudo shutdown -r now
```

これだけで良い。

インストールしたGNOMEを削除するには、依存パッケージも合わせて削除をする必要がある。

```
sudo apt purge gnome-shell* gnome-session* gdm3* 

sudo apt autoremove --purge
```

systemctlからGUIを無効化する方法もある。

削除が手間な場合、後でまたデスクトップを使う場合はこちらのほうが簡単。

```
sudo systemctl set-default multi-user.target
sudo reboot
```


