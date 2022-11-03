---
title: "【Python】気象庁のサイトから特定の都市の月ごとの平均気温をスクレイピングする"
date: 2022-11-03T09:42:10+09:00
lastmod: 2022-11-03T09:42:10+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "スクレイピング","Python","BeautifulSoup" ]
---


## 気象庁のサイトで都市の月ごとの平均気温を表示させる


下記サイトへ行く。

https://www.data.jma.go.jp/obd/stats/etrn/index.php

1. 地点を選択
2. 月ごとの値を表示する

下記画像の1で地点を選ぶ、続いて月ごとの値を表示する

<div class="img-center"><img src="/images/Screenshot from 2022-11-03 09-41-32.png" alt=""></div>

これで問題のページにたどり着く

https://www.data.jma.go.jp/obd/stats/etrn/view/monthly_s3.php?prec_no=44&block_no=47662&year=&month=&day=&view=

今回はこれをスクレイピングする。


## ソースコード

```
import requests, bs4

URL = "https://www.data.jma.go.jp/obd/stats/etrn/view/monthly_s3.php?prec_no=44&block_no=47662&year=&month=&day=&view="

#サイトへアクセス
result      = requests.get(URL)

#構文解析(※ブラウザに表示されているHTMLとrequestsとBeautifulSoupで取得したHTMLは異なる場合がある。)
soup        = bs4.BeautifulSoup(result.content,"html.parser")

#年を取得する
years       = []
year_elems  = soup.select(".mtx > td > div > a")

for year_elem in year_elems:
    years.append(year_elem.text)

#年の出力
print(years)

#月ごとの値と年の値を抜き取る(1行が13個)
td_elems    = soup.select(".mtx > td > td")

data        = []
row         = []
length      = len(td_elems)

for i in range(length):

    #データの中に、)や]などの数値以外が混ざっているので、replaceで除去する
    text_data   = td_elems[i].text
    text_data   = text_data.replace(" ","")
    text_data   = text_data.replace(")","")
    text_data   = text_data.replace("]","")


    #年の値を取得しない場合はここでif文をつける
    if i%13 != 12:
        row.append(text_data)

    #13で割った余りが12の時 dataにappendする
    if i%13 == 12:
        data.append(row)
        row = []


#全データが出力される。
for row in data:
    print(row)


# データと年を合わせてループさせる
for year,row in zip(years,data):
    print(year, row)

```

