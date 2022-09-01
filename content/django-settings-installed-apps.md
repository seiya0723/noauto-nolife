---
title: "【Django】settings.pyのINSTALLED_APPSにはどのように書くのが適切か【順番とapps】"
date: 2022-06-18T22:55:34+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---



## 公式の書き方

Django公式によると、下記のように書くのが適切。

    INSTALLED_APPS = [ 

        "bbs.apps.BbsConfig",

        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
    ]

参照元: https://docs.djangoproject.com/ja/4.0/ref/applications/#configuring-applications

## 一部媒体における書き方

一方で一部の媒体では以下のように書かれてある。

    INSTALLED_APPS = [ 

        "bbs",

        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
    ]


## どちらが正しいのか？

`bbs/apps.py`にて、下記のように仕立てる。

    from django.apps import AppConfig
    
    class BbsConfig(AppConfig):
        default_auto_field = 'django.db.models.BigAutoField'
        name = 'bbs'
    
        verbose_name = "簡易掲示板"


これは管理サイトで操作するモデルの一覧を表記する際、`verbose_name`を追加して、『簡易掲示板』としている。

<div class="img-center"><img src="/images/Screenshot from 2022-06-18 23-11-03.png" alt=""></div>

この表記は、`INSTALLED_APPS`の書き方によらず、いずれでも同じであった。しかし、公式は下記のように明言している。

    Your code should never access INSTALLED_APPS directly. Use django.apps.apps instead.

つまり、`INSTALLED_APPS`に直接アプリ名を書くなということだ。公式は`"bbs"`を非推奨ということである。

## 並び順について

どうやら、`INSTALLED_APPS`の並び順は以下のようにするべきらしい。

    INSTALLED_APPS = [ 

        "bbs.apps.BbsConfig",

        'django.contrib.sites',
        'allauth',
        'allauth.account',
        'allauth.socialaccount',

        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
    ]

公式において明言されているわけではないが、この順番にしないと静的ファイルやテンプレートファイル、コマンドが上書きされるようだ。

参照元:https://jumpyoshim.hatenablog.com/entry/order-of-installed-apps-with-django-is-important

私は静的ファイルとテンプレートファイルはプロジェクト直下に配置する設計にしているため、問題は発生しないが、コマンドの重複はあり得るので今後はこのようにしておきたいところだ。


## 結論

本記事の内容は、あえて意識しなくても普段のDjango開発で全く困らない内容ではある。

しかし、これにより新たな発見に繋がったり、解決できずに迷宮入りになったりする状況を防ぐことができる。

貪欲に知識を得たいところだ。






