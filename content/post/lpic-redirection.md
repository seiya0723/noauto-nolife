---
title: "【LPIC】リダイレクションとは？ 【>と<の違い、>>など】"
date: 2023-03-11T14:53:35+09:00
lastmod: 2023-03-11T14:53:35+09:00
draft: false
thumbnail: "images/lpic.jpg"
categories: [ "インフラ" ]
tags: [ "LPIC","Linux" ]
---


## リダイレクションとは？

リダイレクトとも言う、ファイルの内容を標準入力としたり、標準出力の結果をファイルへ書き込むための機能。


### リダイレクションを使った標準入力

例えば、`tr`コマンドを使うと、標準入力状態になる。

```
tr "hello" "Hello"
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 14-59-01.png" alt=""></div>

このようにtrコマンドを使うと、入力した内容を置換して出力してくれる。

では、ファイルに書かれてある内容を置換して出力するには、どうしたらよいか？

ここでリダイレクションが使える。前もって、以下の内容を含んだ、test.txtを作っておく

```
helloWorld
```

その上で、以下のように`tr`コマンドを実行する

```
tr "hello" "Hello" < test.txt
```

するとこのようにtest.txtの内容が置換されて出力される。

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 15-02-18.png" alt=""></div>

これが、リダイレクションを使った標準入力。


### リダイレクションを使った標準出力

例えば、`echo`コマンドを使った時、入力した内容がそのままターミナルに出力される。

```
echo "hey"
```

この内容を、先程のtest.txtに上書きしたい場合、下記のようにリダイレクションを使う。

```
echo "hey" > test.txt
```

これでtest.txtの内容は`hey`のみになる。

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 15-06-14.png" alt=""></div>


ちなみに、test.txtの内容を上書きせずに追記したい場合はこうする。

```
echo "helloWorld" >> test.txt
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-11 15-08-52.png" alt=""></div>



