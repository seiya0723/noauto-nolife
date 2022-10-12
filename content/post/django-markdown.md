---
title: "DjangoでPythonライブラリのマークダウンを試してみる【pip install Markdown】"
date: 2022-10-10T22:51:20+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","Pythonライブラリ","ウェブデザイン" ]
---

どうやらPythonライブラリにマークダウンを実現させるライブラリがあるそうだ。これがDjangoで扱えるらしい。

かなり前から、どうにかしてDjangoでマークダウンを実現できないかと考えていたが、ようやく見つかって良かった。

さっそく試してみる。

## インストール

    pip install Markdown


## 動かすとこうなる

このマークダウンを読み込み、HTMLに変換してもらう。

<div class="img-center"><img src="/images/Screenshot from 2022-10-11 08-55-05.png" alt=""></div>

コードはこれ

    import markdown
    
    with open("test.md", "r", encoding="utf-8") as f:
        text = f.read()
        html = markdown.markdown(text)
    
    print(html)

こうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-11 08-56-25.png" alt=""></div>

どうしてこうなった。

バッククオーテーション3つで囲っている部分は`<pre><code></code></pre>`になってほしかったのだが...

あと、Pythonのようなインデント構文の場合は`\t`を使ってインデントしてほしいのに、現時点ではそれに対応していないようだ。


## 結論

つまり、現時点でこのライブラリは使い物にならないっぽい。

一応、後の再現のため、ライブラリのバージョンを書いておく。

```
importlib-metadata==5.0.0
Markdown==3.4.1
zipp==3.9.0
```




## 参照元

- https://pypi.org/project/Markdown/
- https://learndjango.com/tutorials/django-markdown-tutorial
