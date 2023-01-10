---
title: "【Python】def関数に、PHPやJavaScriptでよく見るアロー関数(->)っぽいものはアノテーション"
date: 2023-01-10T09:00:32+09:00
lastmod: 2023-01-10T09:00:32+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","tips" ]
---

例えば、以下の関数があったとする。


    def test(name:str) -> str:
        return name
    
    print( test("taro") )
    print( test(12) )
    

これは文字列を受け取って文字列を返す関数である。

ただし、上記のように文字列型じゃない型を受け取っても正常に動作はする。

あくまでも注釈として利用することができる。関数の機能自体に影響はない。


## 参照元

- https://docs.python.org/ja/3.6/library/typing.html
- https://magazine.techacademy.jp/magazine/46675
- https://program-shoshinsya.hatenablog.com/entry/2020/09/09/230633
