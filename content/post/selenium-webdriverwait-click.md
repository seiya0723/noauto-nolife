---
title: "【Selenium X Python】フォーム入力やクリックをする時は明示的な待機をする【Webdriverwait】"
date: 2022-11-30T15:08:28+09:00
lastmod: 2022-11-30T15:08:28+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "others" ]
tags: [ "スクレイピング","Python","Selenium","自動化" ]
---


Seleniumでブラウザ操作の自動化をする時、クリックやフォーム入力などは頻繁に行われる。

だが、それがもしtimeモジュールを使用した暗黙的待機の場合、動作に再現性はなく、たびたび不具合に見舞われるだろう。

本記事では、再現性を高めるため、明示的な待機を行うWebdriverwaitを使用したクリックとフォーム入力を行う。

## 前提

使用しているPythonとライブラリのバージョン、ブラウザなどをまとめる。

```
Python 3.8.10
```
```
async-generator==1.10
attrs==22.1.0
certifi==2022.9.24
exceptiongroup==1.0.4
h11==0.14.0
idna==3.4
outcome==1.2.0
PySocks==1.7.1
selenium==4.6.1
sniffio==1.3.0
sortedcontainers==2.4.0
trio==0.22.0
trio-websocket==0.9.2
urllib3==1.26.13
wsproto==1.2.0
```
```
Mozilla Firefox 107.0
```

ちなみに、geckodriverは下記の方法でDL・インストールができる。

[Ubuntu、WindowsにSeleniumで使用するFirefox用のgeckodriverをインストールする【Python】](/post/ubuntu-geckodriver-install/)


## 普通のキー入力


```
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from selenium.webdriver.common.by import By

URL     = "https://noauto-nolife.com/"

driver  = webdriver.Firefox()
driver.get(URL)

search  = driver.find_element(By.ID, "search")

search.send_keys("selenium")
```

要素を取得して、send_keysでキーを入力する。

しかし、これではレンダリングに遅れが生じると、失敗してしまう。

そこで、要素の取得がきちんとできるよう、待ち時間を指定する。


## 暗黙的な待機と明示的な待機の違い

### 暗黙的待機


Seleniumは要素を抜き取って、その要素に対してクリックしたりキーを入力したりする事ができる。


暗黙的な待機は、timeモジュールを使うことで、一定時間待機した後、キー入力やクリックをすることである。

```
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from selenium.webdriver.common.by import By


import time


URL     = "https://noauto-nolife.com/"

driver  = webdriver.Firefox()
driver.get(URL)

#暗黙的な待機(これではページが早くロードされても、遅くロードされても必ず3秒待つことになる。)
time.sleep(3)

search  = driver.find_element(By.ID, "search")

#暗黙的な待機
time.sleep(3)

search.send_keys("selenium")
```

だが、これだとレンダリングが3秒よりも早く終わった場合でも3秒待たないといけない。

これではブラウザの操作効率が悪い。だから、次の明示的な待機を利用する。


### 明示的待機


```
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions


URL     = "https://noauto-nolife.com/"

driver  = webdriver.Firefox()
driver.get(URL)

# 最大で10秒待つ
wait    = WebDriverWait(driver,10)

# id="search"が表示されるまで最大で10秒待つ
search  = wait.until( expected_conditions.visibility_of_element_located((By.ID, "search")) )

# search に "selenium" と入力
search.send_keys("selenium")

# 検索結果(1番目)が表示されるまで待つ
search_link = wait.until( expected_conditions.visibility_of_element_located((By.XPATH, '//div[@id="search_result"]/li[1]')) )

# クリックする
search_link.click()
```


## 結論

Seleniumでは画面外にある要素をクリックしたりキー入力したりできないようになっている。

これはもともと画面テスト用のツールとして作られたから。

だから、存在することを確認した上でクリックしなければエラー扱いになってしまう。

この点に注意することで、再現性の高いブラウザ操作の自動化が期待できるだろう。



