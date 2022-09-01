---
title: "【Django】管理サイトで保存した時、何か処理(メール送信など)を実行して欲しい時【saveメソッドオーバーライドは通用しない】"
date: 2022-01-28T13:30:10+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---


Djangoの管理サイトでモデルの保存をした時、何か実行して欲しいものがあれば、saveメソッドのオーバーライドでは通用しない。

Adminクラスに`save_model`メソッドがあるので、それをオーバーライドして使う。


    class MyAdminView(admin.ModelAdmin):
        def save_model(self, request, obj, form, change):
            super(MyAdminView, self).save_model(request, obj, form, change)
    

## 用途

管理サイトから作成・編集をして、保存した時に発動するので、以下の用途が考えられる。

- 通販サイトにて配送処理完了のブーリアン値を変更、それを判定して配送処理完了メールを送る
- 動画サイトにて、違反動画のブーリアン値を変更、それを判定して投稿者に警告メールを送る






