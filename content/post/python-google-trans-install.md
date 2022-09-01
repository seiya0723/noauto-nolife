---
title: "【Python】pipで翻訳系ライブラリのgoogletransをインストールする【※バージョン指定しないとエラー】"
date: 2022-08-03T15:25:52+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","tips" ]
---

グーグル翻訳を手軽に試すことができる、Pythonライブラリのgoogletrans。

だが、インストールするバージョンの指定を間違えると、正常に動作してくれない不具合が報告されている。

下記コマンドを実行してインストールするべし。

    pip install googletrans==3.1.0a0


その上で、下記を実行する。

    from googletrans import Translator
    
    translator  = Translator()
    string_ja   = "Pythonの勉強は楽しい"
    trans_en    = translator.translate(string_ja, dest="en")
    
    print(trans_en.text)

正常に翻訳されている。

<div class="img-center"><img src="/images/Screenshot from 2022-08-03 15-37-42.png" alt=""></div>

