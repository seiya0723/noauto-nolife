---
title: "Pythonのfromとimport文の書き方の決まりをまとめる"
date: 2023-03-12T09:14:57+09:00
lastmod: 2023-03-12T10:14:57+09:00
draft: true
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","初心者向け","tips" ]
---


Djangoなどで`from ~ import ~ `という文を書くことがある。

だが、なぜこの書き方になるのか、曖昧な状態で開発を続けてきたフシがあるので、今日こそはっきりさせようと思う。

もっとも、知らなくてもDjangoの開発には全く差し支えないので、忙しい場合はこの記事の内容はスキップしても良いでしょう。












## 結論 


この`from ~ import ~`文の理屈がわかると、Djangoプロジェクト内に任意のディレクトリを作ってPythonファイルを作り、それを読み込むことができるようになるだろう。

任意のmanage.pyコマンドを作る時に大いに役立つと思われる。


[【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】](/post/django-command-add/)


参照: [Djangoをやる前に知っておくべきPython構文](/post/django-essential-python/)

