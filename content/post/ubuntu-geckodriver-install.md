---
title: "UbuntuにSeleniumで使用するFirefox用のgeckodriverをインストールする【Python】"
date: 2022-10-13T10:11:45+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","Selenium","スクレイピング" ]
---

公式の下記リンクから、`geckodriver-v◯.◯◯.◯-linux64.tar.gz` をダウンロードする。(◯の部分は任意のバージョンを)

https://github.com/mozilla/geckodriver/releases


コマンドで動かす時はこうする。

    wget https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-linux64.tar.gz
    tar -zxvf  geckodriver-v0.32.0-linux64.tar.gz 

DLしたら圧縮ファイルを展開し、中に有るgeckodriverを`/usr/local/bin/`にコピーする。

    sudo cp geckodriver /usr/local/bin/

後は、ターミナルからSeleniumをインストール

```
pip install selenium
```


このコードを動作させる

```
from selenium import webdriver

#プロファイルあり、ヘッドレスモードで起動で起動する場合はこちら
#from selenium.webdriver import Firefox, FirefoxOptions

#fp      = webdriver.FirefoxProfile("/home/akagi/.mozilla/firefox/vvk4wsb6.default")
#options = FirefoxOptions()
#options.add_argument('-headless')

#driver  = webdriver.Firefox(fp, options=options)


driver  = webdriver.Firefox()
driver.get("https://noauto-nolife.com/")

print(driver.page_source)

driver.quit()
```

正常に起動すればインストールは完了
