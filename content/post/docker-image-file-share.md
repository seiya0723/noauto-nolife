---
title: "dockerのイメージファイルを出力し(docker save)、出力されたファイルを読み込む(docker load)"
date: 2022-02-13T16:54:44+09:00
draft: false
thumbnail: "images/docker.jpg"
categories: [ "インフラ" ]
tags: [ "docker","tips","ubuntu" ]
---

dockerコンテナをイメージ化した後、配布する場合、dockerHubを使う方法の他に直接ファイルをやり取りする方法もある。

下記コマンドでOK

    sudo docker save [イメージファイルのリポジトリ名] -o [出力したいファイル名].tar

この出力されたファイルを別PCから読み込む

    sudo docker load -i [さっき出力したファイル名].tar

読み込みした後のイメージファイルのリポジトリ名は、もともとのリポジトリ名を引き継ぐ。

## 結論

ちなみに、コンテナを出力+読み込みすることも可能。`export`と`import`コマンドを使用する。

参照元:https://qiita.com/leomaro7/items/e5474e67a8e41536f0ff

