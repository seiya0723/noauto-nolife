---
title: "【Python】GoogleのISBNのAPIを使い、書籍の情報を手に入れる"
date: 2022-03-19T11:42:50+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","api","django","ajax" ]
---

GoogleのISBN検索ができるAPIを使うことで、書籍の情報を簡単に手に入れることができる。

もちろん、書籍のサムネイルも取得可能。スクレイピングではないので、サイトの変化に合わせて手直しが必要になることもない。

アカウントの登録も不要


    #! /usr/bin/env python3
    # -*- coding: utf-8 -*-
    
    
    import requests
    try:
        result  = requests.get("https://www.googleapis.com/books/v1/volumes?q=isbn:9784873117782")
    except:
        print("通信エラー")
    else:
    
        #返却されたJSONを辞書型に変換する。
        data    = result.json()
    
        print(data)
        print(data["items"][0]["volumeInfo"])
    
        #書籍情報を手に入れる。
        print(data["items"][0]["volumeInfo"]["title"])
        print(data["items"][0]["volumeInfo"]["publishedDate"])
        print(data["items"][0]["volumeInfo"]["authors"])
        print(data["items"][0]["volumeInfo"]["description"])
        print(data["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"])


これで、タイトル、出版年月、出版社(リスト)、書籍の説明、書籍の画像が取れる。

他にも情報があるようだが、今回はこれだけ取得した。

## Djangoと組み合わせて入力されたISBNを元に検索を行うには？

Djangoで組み込む場合、[Ajaxを使うか](/post/jquery-ajax-postcode/)、[常駐スクリプトを使うか](/post/django-command-add/)、[saveメソッドをオーバーライドするか](/post/django-models-save-delete-override/)、[管理サイトから投稿する場合は管理サイトのカスタムを行うか](/post/django-admin-save-method/)などがある。


## 結論

参照元:https://qiita.com/TakeshiNickOsanai/items/2d9c30cedcba21f36669

