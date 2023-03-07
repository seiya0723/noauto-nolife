---
title: "【LPIC】setコマンドを使用してシェルオプションを設定する"
date: 2023-03-07T12:21:15+09:00
lastmod: 2023-03-07T12:21:15+09:00
draft: false
thumbnail: "images/lpic.jpg"
categories: [ "インフラ" ]
tags: [ "LPIC","Linux" ]
---


set コマンドを使用することで、現在のシェルにシェルオプションやパラメータを設定することができる。

## 現在のシェルオプションを表示する。

現在のシェルに設定されているオプション(シェルオプション)を表示させるには、

```
set -o
```

と実行する。環境によっても異なるが、このように表示される。

<div class="img-center"><img src="/images/Screenshot from 2023-03-07 12-28-10.png" alt=""></div>

### シェルオプションについて

前項の中で、例えば、`histexpand`は `!番号`によるコマンドの実行が有効になっている。(前項のリストでonになっているものは有効化、offになっているものは無効化されている)

例えば、`history` コマンドを実行して、

<div class="img-center"><img src="/images/Screenshot from 2023-03-07 12-31-11.png" alt=""></div>

このように表示される場合、99971番目の`set -o`コマンドを実行するには

```
!99971
```

とコマンドを打つと実行できるようになっている。

### 代表的なシェルオプションの一覧

|シェルオプション名|意味|
|:--:|:--:|
|histexpand|`!番号` と打つことで、過去のコマンドを再実行できる|
|noclobber|リダイレクションによる既存ファイルへの上書きを禁止|
|ignoreeof|Ctrl+Dでシェルを終了しないようにする|
|emacs|emacs風のキーバインドにする|
|vi|vi風のキーバインドにする|


### シェルオプションを有効化、無効化してみる

```
set -o シェルオプション名
```

と実行することで、指定したシェルオプションを有効化できる。

無効化したい場合は

```
set +o シェルオプション名
```
で実現できる。試しに、`ignoreeof`を有効化してみる。

```
set -o ignoreeof
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-07 12-43-04.png" alt=""></div>

この状態で、Ctrl+Dを押すとこのように表示される。

<div class="img-center"><img src="/images/Screenshot from 2023-03-07 12-45-01.png" alt=""></div>


#### 【補足1】ignoreeofを有効化する活用例

例えば、Pythonのインタラクティブシェルなどから、離脱したい時、Ctrl+Dを押すが、うっかり2回押してしまうとシェルまで終了してしまう。

そういう時、事前にignoreeofを有効化しておけば、2度押してシェルまで終了してしまうということが無くなる。

<div class="img-center"><img src="/images/Screenshot from 2023-03-07 12-47-09.png" alt=""></div>





## 参照元

- https://sadanora.hatenablog.com/entry/2020/10/06/233525
- https://atmarkit.itmedia.co.jp/ait/articles/1805/10/news023.html
