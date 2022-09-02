---
title: "PHPでmb_strlenもしくはstrlenがNotFoundのときの対策"
date: 2022-09-02T09:07:28+09:00
draft: false
thumbnail: "images/php.jpg"
categories: [ "サーバーサイド" ]
tags: [ "php","Laravel","tips","Ubuntu" ]
---

`mb_strlen()`もしくは`strlen()`がNotFoundになるときは、下記コマンドを実行してphp-mbstringをインストールする

    #PHPのバージョンは合わせる
    sudo apt install php8.1-mbstring


ちなみに、`strlen()`はバイト数、`mb_strlen()`は文字列の長さ(マルチバイト文字を1文字とみなす)を返す。



