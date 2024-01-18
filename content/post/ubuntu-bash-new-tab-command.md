---
title: "UbuntuのBash(gnome-terminal)で新しいタブを開き、新しいタブでコマンドを実行する"
date: 2024-01-18T09:40:13+09:00
lastmod: 2024-01-18T09:40:13+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "ubuntu","bash","tips" ]
---

最近のlaravelでは、`php artisan serve`だけでなく`npm run dev`も実行しておく必要がある。

参考: [【Laravel】GitHubからダウンロードしたプロジェクトを動作させるには？](/post/laravel-github-download/)

故に、ターミナルのタブを開いて双方のコマンドを実行しておく必要がある。

しかし、これを手動でやっていくのはちょっとめんどくさい。

そこで、ワンライナーで新しいタブを開き、開いた新しいタブでコマンドを実行してもらう。

## 新しいタブを開き、新しいタブでコマンドを実行するコマンド

こう書くことで新しいタブでlsコマンドを実行することができる。

```
gnome-terminal --tab -- bash -c "ls; exec bash"
```

実行結果だけが新しいタブに出力される点に注意。

このコマンドもやや長いので、aliasに登録するなり、シェルスクリプトを組むなりしたほうが良いのかもしれない。

## 結論

Django+Reactのアプリ開発でも、DjangoサーバーとReactサーバーの2つを起動する必要がある。

この新しいタブを開いてコマンドを実行する方法を活用したいところだ。

## 参考元

https://www.delftstack.com/ja/howto/linux/start-a-new-bash-session/


