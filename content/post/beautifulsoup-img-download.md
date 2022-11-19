---
title: "【BeautifulSoup】imgタグをスクレイピングして画像をダウンロードする"
date: 2022-11-19T10:10:06+09:00
lastmod: 2022-11-19T10:10:06+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "BeautifulSoup","Python","tips","スクレイピング" ]
---

[DoS攻撃](https://ja.wikipedia.org/wiki/DoS%E6%94%BB%E6%92%83)になってしまうので、ダウンロードのたびに1秒待つようにしたほうが良いだろう。


```
import requests,bs4,time

result  = requests.get("https://noauto-nolife.com/")
soup    = bs4.BeautifulSoup(result.content, "html.parser")


elems   = soup.select("img")


count   = 0
for elem in elems:

    url     = elem.get("src")
    result  = requests.get(url)

    #バイナリで書き込み
    with open(str(count)+".png", "wb") as f:
        f.write(result.content)

    count += 1

    #1秒待機する(DoS攻撃になってしまうため)
    time.sleep(1)
```


