---
title: "laravelで開発中、ログを表示させる"
date: 2021-02-01T10:23:55+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","初心者向け","tips" ]
---

`laravel`では`Django(Python)`のように処理の途中で`print()`を実行してターミナルにログを表示させることはできない。代替として使用されるのが`Log`ファサードを使用する方法である。

## Logファサードを使用してログを表示させる

下記コードを任意の場所に書き込む。

    \Log::debug("ログ");

内容は全て`storage/logs/laravel.log`内に保存される。

    [2021-02-01 00:33:36] local.DEBUG: ログ  
    [2021-02-01 00:34:31] local.DEBUG: ログ  
    [2021-02-01 00:34:34] local.DEBUG: ログ  
    [2021-02-01 00:36:50] local.DEBUG: ログ  
    [2021-02-01 00:36:52] local.DEBUG: ログ  

`debug`の部分を`info`、`notice`、`warning`、`error`、`critical`、`alert`、`emergency`と書き換えることもできる。`config/logging.php`の設定に応じて、表示するログのレベルを絞りこめる。

## リアルタイムでログをチェックする

    less +F ./storage/logs/laravel.log

上記コマンドでリアルタイムで更新されるため、Djangoのターミナルに表示されるものに近づく。

## 結論

Djangoのターミナル表示のログを完全に真似ることはできないが、このようにして`print()`を表現できる。


