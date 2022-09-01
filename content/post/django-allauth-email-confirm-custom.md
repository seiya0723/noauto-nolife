---
title: "【Django】allauthにて、確認メールのテンプレートをカスタムする"
date: 2022-02-21T17:22:50+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","allauth" ]
---



<!-- 

仮説:allauthのバージョン問題により、emailのテンプレートの保存先が変わった？そのため、いくら書き換えてもパスが違うので、反映されなかった可能性がある。
少なくとも、0.41はCVEがある模様、virtualenvを使って最新版をインストールするべし。。
https://django-allauth.readthedocs.io/en/latest/release-notes.html

~/Documents/programming/python3/django_test06/test-bbs/startup_bbs_allauth_email_custom$

https://noauto-nolife.com/post/django-allauth-custom-user-model-sendgrid/
https://github.com/seiya0723/bbs_allauth_sendgrid_custom_user_model
-->
