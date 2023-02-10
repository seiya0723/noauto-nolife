---
title: "【openpyxl】PythonからExcelファイルを読み書きする"
date: 2021-12-16T16:31:27+09:00
lastmod: 2023-02-10T16:31:27+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "python","スタートアップシリーズ","django","Pythonライブラリ" ]
---

openpyxlを使うことで、PythonからExcelファイルの読み書き編集ができる。


## インストール

まずはopenpyxlのインストール

    pip install openpyxl 



## Excelファイルの新規作成・読み込み

### 新規作成

    import openpyxl as px
    
    #新規作成(オブジェクト生成)から一旦保存。
    wb          = px.Workbook()
    wb.save('test.xlsx')



### 読み込み

    import openpyxl as px
    
    #既存のファイルを読み込み
    wb          = px.load_workbook('test.xlsx')


先ほど作成したtest.xlsxを読み込む


## シートの操作


### アクティブシートを選択する

    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')

    #アクティブシートを選択(新規作成時に最初からあるシート)
    ws          = wb.active


### 任意のシートを選択する

シートの選択はインデックス番号とシート名で指定する方法の2種類がある。


    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')

    # インデックス番号で指定する
    ws          = wb.worksheet[0]

    # シート名のリストを表示する
    print(wb.sheetnames)

    # シート名で指定する。
    ws          = wb["sheet"]
        

### シートの追加と削除

    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')

    #シートの追加。
    wb.create_sheet(title="new_sheet")

    #未指定の場合、シート名が重複しないように指定してくれる。
    wb.create_sheet()

    # シート名のリストを表示する
    print(wb.sheetnames)

    # シートの削除
    wb.remove( wb["new_sheet"] )



### シートのタイトルを変える(シート名の変更)

    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')
    ws          = wb.active

    #シートのタイトルを変える
    ws.title    = "シート1"



## セルの値の読み書き

### セルに値を入れる


    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')
    ws          = wb.active

    #この場合、文字列として扱う
    ws["A1"].value  = str(100)

    #この場合、数値として扱う。
    ws["B1"].value  = 100

    #保存する。
    wb.save('test.xlsx')


Pythonで文字列で保存した内容は、Excelでも文字列として扱われる。

Pythonで数値で保存した内容は、Excelでも数値として扱われる。

日付や日時も同様。

    import datetime

    #この場合、文字列として扱う
    ws["A2"].value  = str(datetime.datetime.now())

    #この場合、日時として扱う
    ws["B2"].value  = datetime.datetime.now()

ちなみに計算式や関数を入れることで、計算結果を出力してくれる。

    ws["A3"].value  = "=100+400"
    ws["B3"].value  = "=SUM(100*10,200*5)"

別のセルに入れた値を元に計算することもできる

    ws["A4"].value  = 300
    ws["B4"].value  = 400
    ws["C4"].value  = 400

    #計算した値だけを格納する
    ws["D4"].value  = ws["A4"].value*ws["B4"].value

    #計算式を格納し、値を表示できる
    ws["E4"].value  = "=SUM(A4:C4)"


### セルをループして値を入れる

`ws.cell()`を使うことで、行番号と列番号を指定して値を入れることができる。配列と違って1から始まる点に注意。

下記例の場合は、10行目のA列に対して1000を格納する。

    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')
    ws          = wb.active

    ws.cell(row=10, column=1).value  = 1000


これを利用して、forループを使ってセルに値を入れる事ができる。ループの初期値は0にならないように注意。

    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')
    ws          = wb.active
    
    for i in range(1,11):
        ws.cell(row=10, column=i).value  = 1000

forループを二重にすることで、二次元データを格納することもできる。

    import openpyxl as px
    
    wb          = px.load_workbook('test.xlsx')
    ws          = wb.active

    for x in range(1,11):
        for y in range(11,14):
            ws.cell(row=y, column=x).value  = x*y



## セルの装飾・列幅・行の高さの操作

### セルに色をつける

`PatternFill`クラスをimportすることで、セルに装飾を行う事ができる。

    import openpyxl as px

    #PatternFillクラスをimportする
    from openpyxl.styles import PatternFill

    wb          = px.load_workbook('test.xlsx')
    ws          = wb.active

    # A1 を塗りつぶす
    ws["A1"].fill   = PatternFill(patternType='solid', fgColor='00FFCC')


    # ループしてセルを塗りつぶす
    for x in range(1,11):
        for y in range(11,14):
            ws.cell(row=y, column=x).fill  = PatternFill(patternType='solid', fgColor='00FFCC')


ちなみに、fgColorに入れる事ができる値は16進数のカラーコードのみ。HTMLカラーを入れることはできない。

    #これはエラー
    #ws["A1"].fill   = PatternFill(patternType='solid', fgColor='orange')


### 列幅、行の高さを変更する
    
    # 行の高さを変更
    ws.row_dimensions[1].height = 40
    
    # 列幅を変更
    ws.column_dimensions["A"].width = 40

値が列幅をはみ出して表示されてしまう時は、このように調整する。

## 結論

マクロVBAなどからでも同様に定形文書を新規作成できるが、このPythonを使ってエクセルファイルの新規作成を行うメリットは、スクレイピングやDjangoにある。

例えば、スクレイピングして手に入れたデータをExcelファイルに格納して管理する事ができる。

Djangoでウェブアプリ化させると、ブラウザからアクセスできる全ての端末は、openpyxlによるExcelファイルの作成と編集を行う事ができる。


参照元

- https://qiita.com/taito273/items/07e4332293c2c59799d1
- https://it-engineer-info.com/language/python/openpyxl-sheets
- https://openpyxl.readthedocs.io/en/stable/
