---
title: "ffmpeg で すべてのmp4ファイルをまとめて加工するシェルスクリプト"
date: 2025-04-12T21:28:06+09:00
lastmod: 2025-04-12T21:28:06+09:00
draft: false
thumbnail: "images/bash.jpg"
categories: [ "others" ]
tags: [ "シェルスクリプト" ]
---

冒頭に広告や前置きなどがある動画を、まとめて加工したい場合。

## 高速で切り取りしたい場合

```
#! /bin/bash

for file in *.mp4; do
  ffmpeg -i "$file" -ss 100 -c copy "${file}_output.mp4"
done
```

たまに、冒頭数秒が空白になってしまうようだ。

## 品質も維持したい場合

```
#! /bin/bash

for file in *.mp4; do
  ffmpeg -i "$file" -ss 100 -c:v libx264 -c:a aac -strict experimental "${file}_output.mp4"
done
```

こちらはエンコードまでするため、冒頭の空白が除去できる。

## 解説

- `-i input.mp4` : 編集対象のファイルを指定する
- `-ss 100` : 動画の開始時間を100秒とする
- `-c copy` : エンコードなしでコピーする(品質よりも高速化)
- `-c:v libx264` : ビデオを再エンコード(H.264)
- `-c:a aac` : オーディオを再エンコード(AAC)
- `-strict experimental` : 一部の環境でAACを有効にするための指定



