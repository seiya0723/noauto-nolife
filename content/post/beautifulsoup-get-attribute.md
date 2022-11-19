---
title: "【BeautifulSoup】属性を取得する【class,src,valueなど】"
date: 2022-11-19T09:54:49+09:00
lastmod: 2022-11-19T09:54:49+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "BeautifulSoup","Python","tips" ]
---


BeautifulSoupにて、属性を取得する。

```
import requests,bs4

result  = requests.get("https://noauto-nolife.com/")

soup    = bs4.BeautifulSoup(result.content, "html.parser")

elems   = soup.select("img")

for elem in elems:

    #src属性を取得(文字列型)
    print(elem.get("src"))

    #alt属性を取得(文字列型)
    print(elem.get("alt"))

    #属性値が複数なら、リストで取得できる
    print(elem.get("class"))

    #存在しない属性はNoneが返ってくる
    print(elem.get("hoge"))
```


