---
title: "Ubuntuのバージョンチェックは lsb_release -a もしくは、cat /etc/os-release でOK"
date: 2022-11-03T15:50:20+09:00
lastmod: 2022-11-03T15:50:20+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "システム管理","コマンド","Ubuntu" ]
---

    lsb_release -a

実行するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-11-03 15-51-49.png" alt=""></div>

もしくは

    cat /etc/os-release

を実行する。こうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-11-03 15-53-13.png" alt=""></div>

[SSHでログイン](/post/ubuntu-ssh/)した後、サーバーのOSとバージョンを忘れた時に使う。




