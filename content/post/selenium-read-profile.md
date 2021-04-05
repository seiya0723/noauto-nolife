---
title: "Seleniumでブラウザのプロファイルを読み込む"
date: 2021-03-29T08:37:13+09:00
draft: true
thumbnail: "images/noimage.jpg"
categories: [ "web全般" ]
tags: [ "python","selenium","スクレイピング" ]
---

めったに使うことのないSeleniumではあるが、いざ使おうとするとかなり手間取る。

特にログイン。ログインフォームでGoogleのRecaptchaとかボット対策をしていると当然突破できない。そこで予めブラウザでログインをしておいて、そのプロファイルを読み込めば良い。


