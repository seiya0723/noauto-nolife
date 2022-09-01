---
title: "Djangoでviews.pyからmodels.pyのフィールドオプションを参照する【verbose_name,upload_to】"
date: 2021-05-04T20:30:19+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","上級者向け","tips" ]
---


需要ないかもだけど、備忘録として。

    Video.thumbnail.field.upload_to


つまり、
    
    [モデルクラス].[フィールド名].field.[フィールドオプション]

これで参照できる。


## 用途

`FileField`でアップロードした動画のサムネイル(`ImageField`)をviews.pyが自動生成する時、アップロード先のパスを指定する必要があるが、`models.py`のフィールドオプションとして書いた`upload_to`と整合性を合わせるために、本記事で扱った参照を使って対処する。


