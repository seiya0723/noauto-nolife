---
title: "【LPIC】fileコマンドでMIMEタイプを調べておく"
date: 2023-03-17T10:27:06+09:00
lastmod: 2023-03-17T10:27:06+09:00
draft: false
thumbnail: "images/lpic.jpg"
categories: [ "インフラ" ]
tags: [ "LPIC","Linux" ]
---

fileコマンドはファイルの形式を調べるためのコマンド。

-iオプションを使用することで、MIMEタイプを調べることができる。

```
file -i test.sh
```

<div class="img-center"><img src="/images/Screenshot from 2023-03-17 10-28-43.png" alt=""></div>


## 関連記事

[Djangoで画像及びファイルをアップロードする方法【ImageFieldとFileField】【python-magicでMIMEの判定あり】](/post/django-fileupload/)

