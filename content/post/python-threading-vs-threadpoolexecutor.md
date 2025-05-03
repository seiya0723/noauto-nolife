---
title: "Pythonのthreading.Thread と concurrent.futures.Threadpoolexecutor の違い【マルチスレッド処理】"
date: 2025-05-03T11:05:04+09:00
lastmod: 2025-05-03T11:05:04+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","tips" ]
---

Pythonのマルチスレッドには2つの方法がある。

threading.Thread と concurrent.futures.Threadpoolexecutor の2つである。

本記事ではその比較をまとめる

| 比較項目 |threading.Thread | Threadpoolexecutor |
|----|----|----|
|スレッドの管理|自分でスレッドの実行と終了の管理が必要|自動的に管理される|
|戻り値の扱い|基本取得できない(共有変数などを使う)|取得できる|
|エラーハンドリング|各スレッドでtry-exceptをしなければならない| Future.exception() で取得可能|
|スレッドの起動|個別に起動できる|タスクをプールに投げるので、個別にはスレッドの起動はできない|

よって

- threading.Thread : 細かくスレッドの扱いを指定したい場合
- Threadpoolexecutor : エラーハンドリングをしやすく、短くコードを書きたい、戻り値も使いたい場合

にそれぞれ有効である

## 参照

下記記事で、threading.Thread と Threadpoolexecutor の違いをコードから確認できる。(注意: 以下記事ではThreadpoolexecutor で戻り値を受け取らないようにしている。)

[【Pillow】画像をまとめてクロッピング(トリミング)する【マルチスレッド】](/post/python-pillow-all-photo-cropped/)


