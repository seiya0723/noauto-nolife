---
title: "LaravelをCloudinaryを使用したHerokuにデプロイ、画像やファイルをアップロードする"
date: 2021-12-02T06:59:02+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","Heroku","デプロイ","cloudinary" ]
---

画像やファイルをアップロードするLaravelウェブアプリをオンプレミスではなく、クラウド(とりわけHeroku)にデプロイしたい場合、ストレージ問題を解決する必要がある。普通のLaravelアプリのHerokuデプロイはそれほど難しくはないが、Cloudinaryを使うとなると情報が限られ、難易度も高い。

そこで本記事では限られている情報に少しでも貢献するため、画像やファイルアップロード機能のあるLaravelアプリをHeroku+Cloudinaryの環境にデプロイする方法を記す。




