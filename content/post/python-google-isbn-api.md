---
title: "【Python】GoogleのISBNのAPIを使い、書籍の情報を手に入れる"
date: 2022-03-17T11:42:50+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","api","django","ajax" ]
---


GoogleのISBN検索ができるAPIを使うことで、書籍の情報を簡単に手に入れることができる。

もちろん、書籍のサムネイルも取得可能。スクレイピングではないので、サイトの変化に合わせて手直しが必要になることもない。

アカウントの登録も不要


    import requests

    requests.get("https://www.googleapis.com/books/v1/volumes?q=isbn:9784043636037")


## Djangoと組み合わせ、データの保存と同時にISBN検索を行う




## 結論


参照元:https://qiita.com/TakeshiNickOsanai/items/2d9c30cedcba21f36669



