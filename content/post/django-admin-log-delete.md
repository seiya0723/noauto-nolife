---
title: "【Django】管理サイト(admin)のログを削除する。"
date: 2022-03-25T10:42:13+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


Djangoの管理サイトは自動的に操作のログを取るようになっている。

そのログはDBに記録されているため、Herokuの無料プランなどの1万行しかないDBであれば、死活問題になる。

そこで、管理サイトのログをDBから消す。下記のようにすればよい。

    from django.shortcuts import render
    from django.views import View
    
    from django.contrib.admin.models import LogEntry
    
    class IndexView(View)
    
        LogEntry.objects.all().delete()

        ## 以下略 ##


