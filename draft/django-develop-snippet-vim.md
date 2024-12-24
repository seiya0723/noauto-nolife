---
title: "【作業効率化】Django開発時に使うスニペット(Vim Snippet)"
date: 2023-10-18T16:53:03+09:00
lastmod: 2023-10-18T16:53:03+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","作業効率化","追記予定","上級者向け" ]
---


## 前置き

このスニペットは汎用性を考慮して、大抵のウェブアプリで使用すると思われるものに絞った。

また、スニペットに関わらず開発の効率化に関係するものもまとめた。


- [【Vimでスニペット】snipmateプラグインをインストールして使ってみる【爆速コーディング】](/post/vim-snipmate-plugin/)


## views.pyにて、検索とページ、認証などをまとめてimportする




## admin.pyにて、モデルを元にAdminクラスを作る




これはスニペットを使うよりも、Pythonファイルを作ってモデルを読み込んで、生成する形にしたほうが良いかもしれない。

基本は`list_display`を使うだけで終わることが多いので。

### 【補足】models.pyの内容を読み込み、list_displayを含む、Adminクラスを生成するPythonコード


このコードを作る方法論

- まず、models.pyをテキストファイルとして読み込み
- 1行ずつリストに入れて、ループさせる。
- classを含んでおり、なおかつ models.Modelを継承している行は、モデルクラス名
- その中の = と models を含んでいるものは モデルフィールドと判断する。
- つまり、モデルクラス名を元に、Adminクラスを作り、モデルフィールド名をlist_displayに含ませて生成する。
- ただし、ManyToManyはlist_displayに登録することはできない。そのため、別途関数を作る。

このコードを、bashのaliasに登録して、コマンド一発でforms.py及び。生成できるようにする。


## forms.pyにてモデルを使用したFormクラスを作る


こちらもモデルを読んで、formクラスを作るようにした。



### 【補足】models.pyの内容を読み込み、Formクラスを生成するPythonコード




## settings.pyにデプロイ用の設定を追加



## 新しいシークレットキーの作成



