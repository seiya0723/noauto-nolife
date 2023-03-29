---
title: "【Django】管理サイトで任意のJavaScript、CSSを発動させる【管理サイトのカスタム】"
date: 2023-03-29T17:54:17+09:00
lastmod: 2023-03-29T17:54:17+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


## 前提

前もって、プロジェクト直下の`templates`が作られており、settings.pyのTEMPLATESでもそれが読まれている状況であるとする。

```
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ BASE_DIR / "templates" ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```


## 作業

`templates`の中に`admin`ディレクトリを作る。

```
mkdir templates/admin/
```

`templates/admin/base.html`を作る。内容は下記。

```
{% extends 'admin/base.html' %}

{% block extrastyle %}{{ block.super }}

<style>
body{
    background:orange;
}
</style>
<script>console.log("test;");</script>

{% endblock %}
```

これで管理サイトの全ページでCSS及び、JSが発動する。


## 参照

https://docs.djangoproject.com/ja/4.1/ref/contrib/admin/#theming-support


## 結論

フォームクラスのウィジェットを使って任意のクラス名を割り当て、本記事で追加したJSからそのクラスに対して何らかの処理を発動させるなどができる。

[Djangoの管理サイト(admin)のフォームをforms.pyを使用してカスタムする【文字列入力フォームをtextareaタグで表現】](/post/django-admin-custom-form/)


例えば、テキストエリア入力時にマークダウン記法のプレビューを表示させたい時。

テキストエリアに任意のクラス名をセット、そのクラス名のテキストエリアに対してなにか入力した時、隣にJSで配置した要素へマークダウン記法のプレビューを貼り付ける。

これで管理サイトでも、理論上はマークダウンのプレビューが配置できるだろう。

