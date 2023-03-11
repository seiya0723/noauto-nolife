---
title: "【LPIC】trコマンドの使い方【標準入力したものを変換して出力する】"
date: 2023-03-11T14:36:35+09:00
lastmod: 2023-03-11T14:36:35+09:00
draft: false
thumbnail: "images/lpic.jpg"
categories: [ "インフラ" ]
tags: [ "lpic","linux" ]
---



trコマンドは標準入力したものを変換して出力することができる。

例えば、以下のようにhelloをHelloに変換する

```
tr "hello" "Hello"

# tr hello Hello でも可
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 15-21-07.png" alt=""></div>

テキストファイルに書かれてある内容を置換して出力することができる。

```
tr hello Hello < test.txt
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 15-02-18.png" alt=""></div>

置換した内容を別のテキストファイルにリダイレクトして書き込みできる。

```
tr hello Hello < test.txt > test2.txt
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 15-24-52.png" alt=""></div>

ちなみに、このように同じテキストにリダイレクトして書き込みしようとすると、このように全て消える。

```
tr hello Hello < test.txt > test.txt
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 15-27-35.png" alt=""></div>





