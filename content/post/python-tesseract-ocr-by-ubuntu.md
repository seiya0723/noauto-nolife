---
title: "【Ubuntu】tesseractをインストールして、pyocrから画像の文字起こしを試す【Python】"
date: 2022-10-17T08:59:10+09:00
draft: true
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","Ubuntu","Pythonライブラリ","画像認識","OCR" ]
---


## 環境

- Ubuntu 20.04
- Python 3.8.10
- Tesseract Open Source OCR Engine v4.1.1 with Leptonica


## UbuntuへTesseractのインストール

    sudo apt install tesseract-ocr libtesseract-dev libleptonica-dev tesseract-ocr-jpn tesseract-ocr-jpn-vert tesseract-ocr-script-jpan tesseract-ocr-script-jpan-vert

日本語のOCRもできるように訓練済みのデータもインストールしている。

    tesseract-ocr-jpn tesseract-ocr-jpn-vert tesseract-ocr-script-jpan tesseract-ocr-script-jpan-vert


## Tesseractの動作確認

以下画像を`django.png`と名付けて解析してみる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-17 09-15-43.png" alt=""></div>

    tesseract django.png output -l jpn

ファイルはoutput.txtに出力される。出力結果はこうなった。

```
以下、流れ。

1. プロジェクトを作る(5分)
2. アプリを作る(5分)
3.settings.pyの書き換え(5分)
4.urls.pyでURLの指定(5分)
5.views.pyで処理の定義(5分)
6.templatesでHTMLの作成(5分)
7.models.pyでフィールドの定義(5分)
8.マイグレーション実行(2分)
9.views.pyでDBヘアクセス(5分)

10. 開発用サーバーを起動する(3分)

初心者向けの記事につき、forms.pyのバリデーション、デプロイ、DB設定、Ajaxなどは割愛する。

また、Vviews.pyはクラスベースのビューを採用。
```

多少の間違いこそあれ、正常に動作しているようだ。これでUbuntuへのインストールは完了だ。









## 結論


- 参照元1: https://www.kkaneko.jp/tools/ubuntu/tesseract.html
- 参照元2: https://qiita.com/FukuharaYohei/items/e09049c8d312eaf166a5
