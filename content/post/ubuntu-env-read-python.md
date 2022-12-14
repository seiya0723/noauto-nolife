---
title: "Ubuntuに環境変数をセットし、Pythonでosモジュールを使って読む方法【os.environ使用、crontabにも対応】"
date: 2022-09-04T15:49:58+09:00
lastmod: 2022-12-14T13:20:58+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","Python","git","tips","デプロイ","セキュリティ" ]
---

例えば、gitで管理しているプロジェクトをgitでデプロイする時。

たとえローカルサーバーのDBのパスワードとは言え、ハードコードした状態でコミットするわけには行かない。(gitignoreに入れてしまうとパスワードが含まれない) 

そこで、環境変数をセットし、Python側でそれを読む。

## 環境変数をセットする。

    #変数名=値
    ZZZ=test

    #変数を環境変数としてセットする。
    export ZZZ

    #↑2つは下記でも可
    export ZZZ=test


セットした環境変数を確認・削除する


    #セットした環境変数を確認する。
    echo $ZZZ

    #セットされている環境変数を全て確認する。
    env

    #セットされた環境変数を削除する
    unset ZZZ


## `~/.bashrc`に環境変数をセットする

以下を書き込む。

    export ZZZ="test2"

`.bashrc`を更新

    source ~/.bashrc


## Python側から読む

    import os

    os.environ["ZZZ"]


## /etc/crontabで環境変数を読むには？

/etc/crontabでは、`~/.bashrc`に書いた環境変数は読み込んでくれない。そのため、crontabの冒頭に以下のように記述する。

    ZZZ=test

これで実行するPythonプログラムは環境変数`ZZZ`を読み込むことができる。



## 結論

これでgitとデプロイを両立できる。

この環境変数は利便性だけでなく、セキュリティ面でも有効。秘匿にする必要があるAPIキー等が散らばらなくて済むからだ。

例えば、SendgridのAPIキーを環境変数に登録し、環境変数から読み込む形式にするなどがある。

