---
title: "【openpyxl】PythonからExcelファイルを読み書きする"
date: 2021-12-16T16:31:27+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","スタートアップシリーズ","django" ]
---

Pythonを使えばExcelファイルの新規作成や編集、読み込みなどもできる。

## ソースコード

    import openpyxl as px
    
    #新規作成(オブジェクト生成)から一旦保存。
    wb = px.Workbook()
    wb.save('test.xlsx')
    
    #既存のファイルを読み込み
    wb          = px.load_workbook('test.xlsx')
    
    #アクティブシートを選択(新規作成時に最初からあるシート)
    ws          = wb.active
    
    #シート名を変更
    ws.title    = "領収書"
    
    #セルに値を入力していく
    import datetime
    
    ws["A1"].value  = "決済日"
    ws["A2"].value  = str(datetime.date.today())
    
    ws["B1"].value  = "商品名"
    ws["C1"].value  = "個数"
    ws["D1"].value  = "小計"
    
    ws["B2"].value  = "商品A"
    ws["C2"].value  = "2個"
    ws["D2"].value  = "20000"
    
    ws["B3"].value  = "商品B"
    ws["C3"].value  = "1個"
    ws["D3"].value  = "30000"
    
    
    #セルの値を入手。計算結果を入力
    ws["F2"].value  = "請求金額"
    ws["F3"].value  = int(ws["D2"].value) + int(ws["D3"].value)
    
    wb.save('test.xlsx')

`A1`などとセルを指定して、その`.value`属性に値を入れれば良いだけなので、VBAでやるよりもとってもカンタン。

ファイル名もuuidや実行の日付を指定するなどをすれば重複を回避できる。


## 結論

マクロVBAなどからでも同様に定形文書を新規作成できるが、このPythonを使ってエクセルファイルの新規作成を行うメリットは、Djangoにある。

例えばこの定型文書を作るPythonコードをDjangoに搭載させ、ウェブアプリ化させると、ブラウザからアクセスできる全ての端末は定形文書新規作成機能の恩恵を得られる。

スマホであれ、ノートPCであれ、タブレットであれ、全てのブラウザが使用できる端末はワンクリックで定形文書のダウンロードを行い、一部編集して送信などといった事ができるようになる。これはVBAにはとても真似できないことだ。

参照元:https://qiita.com/taito273/items/07e4332293c2c59799d1

