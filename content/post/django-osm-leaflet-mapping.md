---
title: "Djangoでオープンストリートマップ(OSM)とleaflet.jsを使ってマッピングアプリを作る"
date: 2021-11-15T17:57:22+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","マッピング" ]
---

※この方法はDjangoでなくても実現できる。


Djangoでマッピングを実現する方法としてGeoDjangoがある。だが、GeoDjangoは実装が容易ではなく、以前紹介した方法では実現できない事がわかった。

そこで、GeoDjangoよりも容易にマッピングを実現するため、オープンストリートマップ(以下、OSM)とleaflet.jsを使って対処する。

## 全体像





## 実装手順

モデルで緯度と経度を記録する
テンプレートのフォームから緯度と経度の入力と送信







