---
title: "Ubuntuのアップグレード時の設定を置き換えてはいけない"
date: 2022-10-09T13:46:18+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","システム管理" ]
---

Ubuntuアップグレード時、こんなダイアログが表示されることが有る。

<div class="img-center"><img src="/images/Screenshot from 2022-10-09 13-22-48.png" alt=""></div>

この設定の置き換えをしてしまうと、新しい設定ファイルに置き換えられ、これまで書いてきた設定ファイルは全て消えてしまう。

これまでの設定ファイルを残しておきたいのであれば、『そのまま』を選ぶ。

このダイアログの選択肢を誤るとcrontabやvimの設定も消えてしまうので、十分注意する。


