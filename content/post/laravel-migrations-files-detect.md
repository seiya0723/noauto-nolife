---
title: "【Laravel】コマンドからマイグレーションファイルを立ち上げる時、こうすればうまく行く【ワイルドカードとTabキー】"
date: 2021-09-16T14:55:01+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","tips","初心者向け" ]
---

コマンドからマイグレーションファイルを立ち上げる時、わざわざ日付を手入力しながらやっていると、時間がかかりすぎる。

そこで、ワイルドカードとTabキーの補正を使うことで特定する。例えば、`2014_10_12_000000_create_users_table.php`であれば

    vi ./database/migrations/*create_users*

と打って、この状態でTabキーを押す。これで

    vi ./database/migrations/2014_10_12_000000_create_users_table.php

こんなふうになる。もっとも、統合開発環境を使えば、マウスダブルクリックでこんなコマンド打たなくても済むのだが、あくまでもターミナルから開発したい人はこれを使うと良いだろう。

