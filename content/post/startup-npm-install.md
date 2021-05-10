---
title: "Ubuntu18.04にnode.jsとnpm、vue-cliをインストールする"
date: 2021-03-11T16:10:55+09:00
draft: false
thumbnail: "images/vuejs.jpg"
categories: [ "フロントサイド" ]
tags: [ "javascript","node.js","npm","スタートアップシリーズ","vue.js" ]
---

## 環境

- Ubuntu 18.04
- Bash

## インストール

nodejsとnpmをインストールする。

    sudo apt install -y nodejs npm

npmからnパッケージをインストール

    sudo npm install n -g

nパッケージを使ってnodeをインストール

    sudo n stable 

旧バージョンのnodejs及びnpmをアンインストールする。

    sudo apt purge -y nodejs npm
    exec $SHELL -l

下記コマンドを実行して、バージョンが表示されれば完了

    node -v

## permission denied問題への対処

下記コマンドを実行する。

    npm config get prefix

出力された文字列が/usr/localであれば、下記コマンドを実行。

    sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

これで正常にパッケージのインストールができる。vue-cliのインストールを実行してみる。

    npm install -g vue-cli

`vue`コマンドが使えれば`vue-cli`のインストールは完了。

## 結論

qiitaからの受け売りである。

https://qiita.com/seibe/items/36cef7df85fe2cefa3ea

https://qiita.com/okohs/items/ced3c3de30af1035242d
