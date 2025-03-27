---
title: "sedコマンドで指定した範囲の行だけ標準出力をする。xselと組み合わせて部分的にクリップボードにコピー"
date: 2025-03-24T14:18:28+09:00
lastmod: 2025-03-24T14:18:28+09:00
draft: false
thumbnail: "images/bash.jpg"
categories: [ "インフラ" ]
tags: [ "開発効率化","tips","Ubuntu" ]
---


```
sed -n "開始行,終了行p" ファイル名
```

とすることで、指定したファイルの開始行から終了行までのテキストをそのまま標準出力できる。

そのため、[xsel](/post/linux-commandline-clipboard/)と組み合わせ、指定したファイルの指定した範囲の行を、ワンライナーでクリップボードにコピーできる。

```
sed -n "100,120p" ./bbs/views.py | clipcopy
```


