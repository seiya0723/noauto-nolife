---
title: "リモートサーバーのデータを自動的にバックアップする方法論【scp+crontab】"
date: 2021-09-19T18:12:35+09:00
draft: false
thumbnail: "images/bash.jpg"
categories: [ "インフラ" ]
tags: [ "システム管理","ssh","django" ]
---

## 手順

1. crontabを使って、一定時間おきにリモートサーバーがバックアップを取る
1. crontabを使って、一定時間おきに任意の端末がscpでリモートサーバーのバックアップファイルをDL
1. crontabを使って、一定時間おきにリモートサーバーがバックアップしたデータを削除

## 方法

例えば、Djangoであればこうなる。

リモートサーバーの`/etc/crontab`に以下の設定を施す。

    00 *   * * *   ubuntu   cd ~/Document/django/ && python3 manage.py dumpdata [任意のアプリ] > data.json
    40 *   * * *   ubuntu   rm ~/Document/django/data.json

任意の端末の`/etc/crontab`に以下の設定を施す。

    20 *   * * *   user     scp -i [公開鍵] ubuntu@[リモートホストのIP]:~/Document/django/data.json ./

これで毎時0分になればリモートサーバーがDBのデータをバックアップ。毎時20分になれば、任意の端末がscpでデータをDL。毎時40分でリモートサーバーはデータを削除する。
    
## 結論

crontabを組み合わせればこういうこともできる。

ただ、リダイレクトは上書きしているので、削除しなくても良いかも知れない。

