---
title: "DjangoとReactのSPAウェブアプリで、使用することができない(と思われる)Djangoの技術"
date: 2024-01-21T09:49:12+09:00
lastmod: 2024-01-21T09:49:12+09:00
draft: true
thumbnail: "images/django-react.jpg"
categories: [ "others" ]
tags: [ "django","react","アンチパターン" ]
---

Djangoで開発を進めていき、途中でReactのSPAを考える場合。

一部のDjangoの技術が使用できない。

本記事ではDjango+ReactのSPAを作る際、使用できない(もしくは使用できないと思われる)Djangoの技術をまとめる。

## Django Template Language

当然だが、Reactがレンダリングを行うため、DjangoTemplateLanguageは使えなくなる。

ifやforはJavaScriptに含まれるため問題はないが、 urlテンプレートタグが使えないのは痛い。

Reactでは、urls.pyにまとめたnameを使ってURLの逆引きができないため、


## テンプレートの継承

レンダリングはReactが行うため、Django側でやっていたテンプレートの継承も使えない。

[【Django】DTLのextendsとblockを使って、テンプレートを継承をする](/post/django-templates-extends-and-block/)

もっとも、extendsテンプレートタグは使えなくなるが、どのテンプレートを親とするかなど設計面はReactに流用できるため、全くの無価値というわけでもないだろう。


## フォームクラスのウィジェット、フォームオブジェクトのレンダリング(フォームテンプレート)

重複するが、フォームオブジェクトのレンダリング(フォームテンプレート)にも影響は出てくる。

フォームクラスのウィジェットを使うことで、フォームテンプレートに装飾を施すことができた。

[Djangoのforms.pyが提供するフォームテンプレートは使わない](/post/django-forms-temp-not-use/)

しかし、JsonResponseを返す都合上、これは使えない。

ログイン用のテンプレートでも、フォームオブジェクトをレンダリングしているため、こちらも全て書き換えていく手間がかかる。

[【Django】デフォルトの認証機能を網羅し、カスタムユーザーモデルとメール認証も実装させる【脱allauth】](/post/django-auth-not-allauth-add-custom-user-model/)


## カスタムテンプレートタグ

DTLが使えなくなるため、カスタムテンプレートタグも意味をなさなくなる。

ただ、カスタムテンプレートタグでできることは、Djangoのビューでもできるため、それほど影響はないと思われる。

クエリストリングのパラメータの操作などもJavaScriptで対応できる。

[JavaScriptでクエリパラメータを書き換え、GETメソッドを送信する【通販サイトなどの絞り込み検索に有効】](/post/javascript-query-change-and-get-method/)


## ContextProcessor

Reactと連携させるためには、JsonResponseを返却する必要があるため、ContextProcessorも機能しなくなる。

ContextProcessorに紐付いている、requestオブジェクト、DjangoMessageFrameworkも機能しなくなる。

自前で作ったContextProcessorも使えないので、Reactとの連携を想定する場合、ContextProcessorは使わないほうが良いだろう。

[【Django】context_processorsを使い、全ページに対して同じコンテキストを提供する【サイドバーのカテゴリ欄、ニュース欄などに有効】](/post/django-context-processors/)

対策として、ビューを継承する方向で調整するなどが良いと思われる。

[【Django】ビュークラスの継承を使い、予めcontextを追加させる](/post/django-add-context/)



## 逆参照、モデルメソッド

JsonResponseによって返却されている内容は、あくまでもjson(辞書型のようなもの)であり、モデルオブジェクトではない。

故に、モデルオブジェクトで使える逆参照やモデルメソッドなども機能しなくなる。

これは、シリアライザに追加のフィールドを用意するなどで対策はできると思われる。

だが、1対多や多対多、1対1などでリレーションを組んでいる場合、すぐに参照できないのは非常に辛いところだろう。


## 結論

思いつくだけでこれだけが考えられたが、使えない技術は他にもあると思う。

Django+ReactのSPA開発時に、これまでのDjango技術の殆どが役に立たなくなることに気づく。

サーバーサイドとフロントサイドを疎結合にするデメリットが、ここに来て大きく出ているように思える。

もう少しだけ、Django+ReactのSPAをスムーズに開発する方法を考慮したほうが良いだろう。

