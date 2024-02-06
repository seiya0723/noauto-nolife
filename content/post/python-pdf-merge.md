---
title: "複数のPDFファイルを1つのPDFファイルにまとめる"
date: 2024-02-05T10:12:10+09:00
lastmod: 2024-02-05T10:12:10+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","tips","Pythonライブラリ","作業効率化" ]
---


書類(PDF)を1つにまとめる必要が出てきたので。

複数のPDFを1つにまとめるPythonコードを作ることにした。

## 前提

```
pip install PyPDF2==3.0.1
```

## ソースコード

PyPDF2 をインストールしておく。

PyPDF2 では PdfFileMerger は削除されたため、 PdfMerger を使う。

```
import glob
import datetime
from PyPDF2 import PdfMerger

now     = datetime.datetime.now()
now_str = now.strftime("%Y-%m-%d_%H:%M:%S")

# TIPS: 既存のPDFファイル名を指定した場合、上書きではなく、追記されるので注意。
def merge_pdfs(output_filename=f"{now_str}.pdf"):

    # すべてのPDFファイルを取得。
    # ファイル名順に並び替える。
    pdfs    = sorted( glob.glob(f"./*.pdf") )

    #print(pdfs)

    if not pdfs:
        print("PDFファイルがありません")
        return

    merger  = PdfMerger()

    for pdf in pdfs:
        merger.append(pdf)

    merger.write(output_filename)
    merger.close()

    print(f"pdfファイルをまとめました。ファイル名: {output_filename}")


merge_pdfs()
```

同じファイル名で指定してしまうと追記される仕様になっているため、現在時刻をファイル名とした。


## 結論

これを応用して、DjangoでPDFファイルを複数アップロード、それらをすべてまとめたPDFをDLするウェブアプリを作ることもできるだろう。



