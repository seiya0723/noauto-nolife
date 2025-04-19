---
title: "Seleniumの基本操作のまとめ"
date: 2025-04-19T08:17:38+09:00
lastmod: 2025-04-19T08:17:38+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "others" ]
tags: [ "selenium","自動化","作業効率化","スクレイピング","追記予定" ]
---

Seleniumは同じような処理が続くため、基本操作をまとめた。

ただ、forループとtry 文が続く冗長構成のため、後に修正する予定。


## ソースコード

```
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By

from selenium.common.exceptions import TimeoutException

driver  = webdriver.Firefox()
wait    = WebDriverWait(driver, 10)
retry   = 10


# 要素が見えているか
def xpath_visible(xpath: str):
    return wait.until(excepted_conditions.visibility_of_element_located((By.XPATH, xpath)))

def xpath_click(xpath: str):
    for _ in range(retry):
        try:
            elem = xpath_visible(xpath)
            elem.click()
        except:
            continue
        else:
            return

    raise TimeoutException(f"クリックできませんでした: {xpath}")


def xpath_send_keys(xpath: str, keys: str):
    for _ in range(retry):
        try:
            elem = xpath_visible(xpath)
            elem.send_keys(keys)
        except:
            continue
        else:
            return

    raise TimeoutException(f"キー入力できませんでした: {xpath}:{keys}")


# 入力欄の初期化
def xpath_clear(xpath: str):
    for _ in range(retry):
        try:
            elem = xpath_visible(xpath)
            elem.clear()
        except:
            continue
        else:
            return

    raise TimeoutException(f"入力欄の初期化ができませんでした: {xpath}")

# select で値選択
def xpath_select_value(xpath: str, value: str):
    for _ in range(retry):
        try:
            elem = xpath_visible(xpath)
            select = Select(elem)
            select.select_by_value(value)
        except:
            continue
        else:
            return

    raise TimeoutException(f"Select要素の値選択ができませんでした: {xpath}:{value}")


# select で表示テキストで選択
def xpath_select_text(xpath: str, value: str):
    for _ in range(retry):
        try:
            elem = xpath_visible(xpath)
            select = Select(elem)
            select.select_by_visible_text(value)
        except:
            continue
        else:
            return

    raise TimeoutException(f"Select要素のテキスト選択ができませんでした: {xpath}:{value}")


# テキストの取得
def xpath_text(xpath: str):
    for _ in range(retry):
        try:
            elem = xpath_visible(xpath)
        except:
            continue
        else:
            return elem.text

    raise TimeoutException(f"テキスト取得ができませんでした: {xpath}")


# JSを使用したスクロール
def xpath_scroll(xpath: str):
    for _ in range(retry):
        try:
            elem = xpath_visible(xpath)
            driver.execute_script("arguments[0].scrollIntoView(true);", elem)
        except:
            continue
        else:
            return elem.text

    raise TimeoutException(f"スクロールができませんでした: {xpath}")


# アラートの待機とOK
def alert_accept():
    for _ in range(retry):
        try:
            wait.until(excepted_conditions.alert_is_present())
            alert = driver.switch_to.alert
            alert.accept()
        except:
            continue
        else:
            return elem.text

    raise TimeoutException(f"アラートの待機とOKができませんでした")
```



## 【構想】djangoを使用して、ノーコードでSeleniumツール作成

これだけ同じような単調なコードが続くのであれば、djangoを使って作業の指示をウェブアプリ化、ノーコードでSeleniumのツールを生成できるのではないかと考えている。

もっとも、個人的にはあまり需要はないので、作らないままでいるのだが。

