---
title: "【Python】正規表現モジュールreでパターンに一致した文字列を全て取り出す・全て置換する"
date: 2022-10-18T18:26:02+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","正規表現","初心者向け" ]
---


正規表現は普段から使っていないと、いざという時にどうなってたっけってなる。

だから備忘録としてまとめておく。

とりわけ、Pythonの正規表現モジュール`re`のメソッドはいろいろあるので、実用的な物に絞っておく。

## 全て取り出す

返り値はリスト型で出る。

    import re
    
    target  = "n1o2a3u4t5o-6n7o8li9f0e9.com"
    
    #数値を取り出す
    result  = re.findall(r'\d', target)
    
    if result:
        print(result)
    
        #取り出した数値を連結する。
        print("".join(result))
    else:
        print("マッチなし")
    

## 全て置換する

    import re
    
    target  = "n1o2a3u4t5o-6n7o8li9f0e9.com"
    print(target)
    
    #数値を置換する
    target = re.sub(r'\d', "", target)
    
    print(target)

`re.sub()`は非破壊メソッドなので、適当な変数に代入する。

## Pythonの正規表現パターンについて

公式を参照。

https://docs.python.org/ja/3/library/re.html


## 結論

`re.sub()`と`re.findall()`だけあれば大抵の正規表現問題は解決できる。


