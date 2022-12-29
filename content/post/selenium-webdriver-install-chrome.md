---
title: "【Selenium】webdriver-managerを使ってPythonコードからChromeドライバーをインストールする"
date: 2022-12-27T12:06:19+09:00
lastmod: 2022-12-27T12:06:19+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "selenium","Python","スクレイピング" ]
---


前もってwebdriver-managerをインストールしておく。

```
pip install webdriver-manager
```

下記コードでChromeドライバーが簡単にインストールできる。

```
from selenium import webdriver 
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

driver  = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("https://www.google.com/")
```

どうやらvirtualenvではなくOSに直インストールされるようだ。


