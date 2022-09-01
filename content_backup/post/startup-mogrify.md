---
title: "mogrifyコマンドを使って画像を一括クロップ(トリミング)する"
date: 2022-01-07T09:57:31+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "Linux","tips"]
---

下記コマンドで一括画像処理できる

    mogrify [出力先] -crop [幅]x[高さ]+[切り取り始めるx座標]+[切り取り始めるy座標] [入力元]


参照元:https://qiita.com/yoya/items/62879e6e03d5a70eed09

