---
title: "【Python】openpyxlで棒グラフ・折れ線グラフを表示させる【公式から引用】"
date: 2022-11-03T13:33:46+09:00
lastmod: 2022-11-03T13:33:46+09:00
draft: false
thumbnail: "images/Screenshot from 2022-11-03 13-40-47.png"
categories: [ "others" ]
tags: [ "Python","Pythonライブラリ","openpyxl" ]
---

コードは公式から引用し、一部編集している

- https://openpyxl.readthedocs.io/en/stable/charts/bar.html
- https://openpyxl.readthedocs.io/en/latest/charts/line.html

## ソースコード


```
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference

#書き込みモードでワークブックを作る
wb      = Workbook(write_only=True)

#シートを作る
ws      = wb.create_sheet()

#データ
rows    = [ ['番号', '算数', '国語'],
            [1, 50, 70],
            [2, 60, 30],
            [3, 40, 60],
            [4, 50, 70],
            [5, 20, 40],
            [6, 60, 40],
            [7, 50, 30],
            ]

#書き込み
for row in rows:
    ws.append(row)

#棒グラフを作る
chart1              = BarChart()
chart1.type         = "col"
chart1.style        = 10

#タイトル、横軸・縦軸の指定
chart1.title        = "グラフタイトル"
chart1.y_axis.title = "点数"
chart1.x_axis.title = "番号"


#min_colとmin_rowは開始の列と行、max_colとmax_rowは終端の列と行
#つまり、B1~C8まで(列名も含める) これはエクセルでグラフを作る時と範囲は同様
data                = Reference(ws, min_col=2, min_row=1, max_col=3, max_row=8)

#A2からA8までをX軸とする
cats                = Reference(ws, min_col=1, min_row=2, max_row=8)

#chart1にデータを追加(タイトルも表示)
chart1.add_data(data, titles_from_data=True)

#X軸のラベルをセット
chart1.set_categories(cats)
chart1.shape        = 4

#シートのA10にグラフを追加する。
ws.add_chart(chart1, "A10")



from openpyxl.chart import LineChart

chart2              = LineChart()
chart2.title        = "グラフタイトル"
chart2.y_axis.title = '点数'
chart2.x_axis.title = '番号'

chart2.style        = "12"
chart2.grouping     = "standard" 

data                = Reference(ws, min_col=2, min_row=1, max_col=3, max_row=8)
chart2.add_data(data, titles_from_data=True)

ws.add_chart(chart2, "G10")


#保存
wb.save("graph.xlsx")
```

`openpyxl.chart.BarChart`を使用する。このオブジェクトにReferenceで作ったデータオブジェクトを追加する。

データオブジェクトの範囲指定は通常のエクセルと同様。

LibreOfficeの場合は、表記が一部省略・変更されてしまう点に注意。

<div class="img-center"><img src="/images/Screenshot from 2022-11-03 13-40-47.png" alt=""></div>



## 結論

もし、MS Excelを使用しているのではなく、LibreOfficeを使用する場合、グラフの表記が変わってしまう。

その場合はMatplotlibを使用して画像化させて貼り付けるか、HTML上に表示させる場合はChart.jsを使うと良いだろう。


- [【matplotlib】フォントファイルを用意して日本語の豆腐化を修正する](/post/matplotlib-font-easy-settings/)
- [【データ分析】pandasの基本的な使い方、グラフ描画、ファイル読み書き、計算等【バックエンドにopenpyxlとmatplotlibを使う】](/post/startup-pandas-openpyxl-matplotlib/)
- [【JavaScript】Chart.jsでグラフを描画する【棒グラフ、円グラフ、折れ線グラフ】](/post/startup-chartjs/)


データの取得にはスクレイピングを使うと良いだろう。

- [【Python】気象庁のサイトから特定の都市の月ごとの平均気温をスクレイピングする](/post/python-scrape-temp/)
- [【Python3】BeautifulSoup4の使い方、検証のコード作成方法、役立つリンク集のまとめ【保存版】](/post/startup-python3-beautifulsoup4/)


