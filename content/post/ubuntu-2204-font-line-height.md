---
title: "Ubuntu 22.04 LTS でTakaoフォントをインストールして行間を詰める。"
date: 2022-12-18T08:38:16+09:00
lastmod: 2022-12-18T08:38:16+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","tips" ]
---

Ubuntu22.04にて日本語版を使用していると、これまでのUbuntuと違って、ターミナルの行間が異常に広いことがわかる。

<div class="img-center"><img src="/images/Screenshot from 2022-12-18 08-34-03.png" alt=""></div>

理由はTakaoフォントがデフォルトでインストールされていないから。

[ここ](apt://fonts-takao)からインストールできる。

インストールが完了すると、このように22.04でも行間を狭くできる。

<div class="img-center"><img src="/images/Screenshot from 2022-12-18 08-36-53.png" alt=""></div>


## Firefox にて規定に戻す

ただ、これだけだと、Firefoxの行間と文字サイズが小さくなってしまうので、

<div class="img-center"><img src="/images/Screenshot from 2023-01-29 16-30-57.png" alt=""></div>

Firefox のフォント指定を戻す。

<div class="img-center"><img src="/images/Screenshot from 2023-01-30 10-48-23.png" alt=""></div>




