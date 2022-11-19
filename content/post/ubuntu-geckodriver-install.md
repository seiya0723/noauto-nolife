---
title: "UbuntuにSeleniumで使用するFirefox用のgeckodriverをインストールする【Python】"
date: 2022-10-13T10:11:45+09:00
lastmod: 2022-11-19T10:11:45+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","Selenium","スクレイピング","Firefox" ]
---

## ドライバーのインストーラーをDL

公式の下記リンクから、`geckodriver-v◯.◯◯.◯-linux64.tar.gz` をダウンロードする。(◯の部分は任意のバージョンを)

https://github.com/mozilla/geckodriver/releases

<div class="img-center"><img src="/images/Screenshot from 2022-11-19 10-19-26.png" alt=""></div>

ちなみに、Windowsで64bitの場合は`geckodriver-v0.32.0-win-aarch64.zip `を、32bitの場合は` geckodriver-v0.32.0-win32.zip `をDLする。


コマンドで動かす時はこうする。

    wget https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-linux64.tar.gz
    tar -zxvf  geckodriver-v0.32.0-linux64.tar.gz 


## ドライバーのインストーラーを実行

Windowsの場合はDLした圧縮ファイルを展開する。`geckodriver.exe`があるので、実行するPythonファイルと同じ場所においておけば良い。


Ubuntuの場合はDLしたら圧縮ファイルを展開し、中に有るgeckodriverを`/usr/local/bin/`にコピーする。

    sudo cp geckodriver /usr/local/bin/


## Seleniumをインストール

後は、ターミナルからSeleniumをインストール

```
pip install selenium
```


## 実際に動かす

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


## 結論

Windowsの場合は以下でも解説がされている。

https://scraping-for-beginner.readthedocs.io/ja/latest/src/0.html

chromedriverのインストール方法も書かれてあるので、FirefoxよりもChromeが使いたい場合はこちらが良いだろう。

