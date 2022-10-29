---
title: "【openpyxl】PythonからExcelファイルを読み書きする"
date: 2021-12-16T16:31:27+09:00
lastmod: 2022-10-28T16:31:27+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","スタートアップシリーズ","django","Pythonライブラリ" ]
---

Pythonのopenpyxlというライブラリを使えば、PythonからExcelファイルの新規作成や編集、読み込みなどができる。

これにより、スクレイピングしたデータをExcelにまとめたり、予め用意しておいたExcelファイルを読み込みすることもできる

## インストールと動作確認

まずはopenpyxlのインストール

    pip install openpyxl 


続いて、以下のコードをPythonファイルに記述し、動かす。


    import openpyxl as px
    
    #新規作成(オブジェクト生成)から一旦保存。
    wb = px.Workbook()
    wb.save('test.xlsx')


`test.xlsx`ファイルが作られたらインストールは完了。

## Excelファイルの読み込み

    import openpyxl as px
    
    #既存のファイルを読み込み
    wb          = px.load_workbook('test.xlsx')


先ほど作成したtest.xlsxを読み込む


## アクティブシートを選択する

    import openpyxl as px
    
    #既存のファイルを読み込み
    wb          = px.load_workbook('test.xlsx')

    #アクティブシートを選択(新規作成時に最初からあるシート)
    ws          = wb.active

以降、このwsを使って操作する。


## シートのタイトルを変える

    import openpyxl as px
    
    #既存のファイルを読み込み
    wb          = px.load_workbook('test.xlsx')

    #アクティブシートを選択(新規作成時に最初からあるシート)
    ws          = wb.active

    #シートのタイトルを変える
    ws.title    = "シート1"


    #保存する。
    wb.save('test.xlsx')

選択したシートから`.title`に文字列を代入することで、シート名を変更できる。

ワークブックを保存することで、シートのタイトルの変更が反映される。


## セルに値を入れる

    import openpyxl as px
    
    #既存のファイルを読み込み
    wb          = px.load_workbook('test.xlsx')

    #アクティブシートを選択(新規作成時に最初からあるシート)
    ws          = wb.active

    #シートのタイトルを変える
    ws.title    = "シート1"


    #このように入れると、エクセル上、文字列として処理される。
    ws["A1"].value  = str(100)

    #このように入れると、エクセル上、数値として処理される。
    ws["B1"].value  = 100

    #保存する。
    wb.save('test.xlsx')


Excelではセルごとに型の概念がある。

そのため、数値を入力すると、数値型としてExcelが認識し、自動的に右寄せになる。

それは、日付や日時型も同様。

    import datetime

    #このように入れると、エクセル上、文字列として処理される。
    ws["A2"].value  = str(datetime.datetime.now())

    #このように入れると、エクセル上、日時として処理される。
    ws["B2"].value  = datetime.datetime.now()



ちなみに計算式や関数を入れることで、計算結果を出力してくれる。

    ws["A3"].value  = "=100+400"
    ws["B3"].value  = "=SUM(100*10,200*5)"

別のセルに入れた値を元に計算することもできる

    ws["A4"].value  = 300
    ws["B4"].value  = 400
    ws["C4"].value  = 400

    #こちらは計算した値だけを格納する
    ws["D4"].value  = ws["A4"].value*ws["B4"].value

    #こちらは計算式を格納し、値を表示できる
    ws["E4"].value  = "=SUM(A4:C4)"




## セルをループして値を入れる

`ws.cell()`を使うことで、行番号と列番号を指定して値を入れることができる。配列と違って1から始まる点に注意。

下記例の場合は、10行目のA列に対して1000を格納する。

    ws.cell(row=10, column=1).value  = 1000


これを利用して、forループを使ってセルに値を入れる事ができる。ループの初期値は0にならないように注意。
    
    for i in range(1,11):
        ws.cell(row=10, column=i).value  = 1000

forループを二重にすることで、二次元データを格納することもできる。


    for x in range(1,11):
        for y in range(11,14):
            ws.cell(row=y, column=x).value  = x*y


## 列幅、行の高さを変更する
    
    # 行の高さを変更
    ws.row_dimensions[1].height = 40
    
    # 列幅を変更
    ws.column_dimensions["A"].width = 40

値が列幅をはみ出して表示されてしまう時は、このように調整するとよいだろう。


## セルに色をつける

別途 PatternFillクラスをimportすることで、セルに装飾を行う事ができる。

    #PatternFillクラスをimportする
    from openpyxl.styles import PatternFill
    
    ws["A1"].fill   = PatternFill(patternType='solid', fgColor='00FFCC')


    for x in range(1,11):
        for y in range(11,14):
            ws.cell(row=y, column=x).fill  = PatternFill(patternType='solid', fgColor='00FFCC')


ちなみに、fgColorに入れる事ができる値は16進数のカラーコードのみ。下記のようにHTMLカラーを入れることはできない。

    #これはエラー
    #ws["A1"].fill   = PatternFill(patternType='solid', fgColor='orange')


## 結論

マクロVBAなどからでも同様に定形文書を新規作成できるが、このPythonを使ってエクセルファイルの新規作成を行うメリットは、スクレイピングやDjangoにある。

例えば、スクレイピングして手に入れたデータをExcelファイルに格納して管理する事ができる。

Djangoでウェブアプリ化させると、ブラウザからアクセスできる全ての端末は、openpyxlによるExcelファイルの作成と編集を行う事ができる。


参照元: https://qiita.com/taito273/items/07e4332293c2c59799d1

