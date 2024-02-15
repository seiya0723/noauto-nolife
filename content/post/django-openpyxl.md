---
title: "【Django】openpyxlでエクセルファイルを新規作成、バイナリでダウンロードする【FileResponse】"
date: 2022-07-08T08:15:03+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","openpyxl" ]
---

Djangoでエクセルファイルを新規作成し、ダウンロード(以下DL)する。

ファイルのDLと言うと、[ファイルのアップロードと同じようにやればいい](/post/django-fileupload/)だろうと思うかもしれない。

実際、ファイルをストレージに保存し、そのURLへリダイレクトしてDLする方法でも、問題なく動作する。しかし、これではストレージが圧迫される。

そこで今回は、サーバーのメモリ内に保存されているファイルをバイナリに変換し、レスポンスとして返す方法を採用した。

これにより、ストレージの圧迫を防ぐことができる。

## ソースコード

    from django.views import View
    from django.http import FileResponse

    from io import BytesIO
    import openpyxl as px
    
    class ExcelView(View):
    
        def get(self, request, *args, **kwargs):
    
            #ワークブックを作る。
            wb  = px.Workbook()
            ws  = wb.active
    
            ws["A1"]    = "A1"
    
            #メモリ空間内に保存
            virtual     = BytesIO()
            wb.save(virtual)
    
            #バイト文字列からバイナリを作る
            binary      = BytesIO(virtual.getvalue())
    
            #レスポンスをする
            return FileResponse( binary, filename="download.xlsx" )
    
    excel   = ExcelView.as_view()

    
### メモリ空間内に保存する

    from io import BytesIO

    #メモリ空間内に保存
    virtual     = BytesIO()
    wb.save(virtual)


標準モジュールの`io`から`BytesIO`を使う。

BytesIOのオブジェクトを作る。それをファイルパスとして指定することで、メモリ空間内に保存をする事ができる。


### バイト文字列からバイナリを作る

    #バイト文字列からバイナリを作る
    binary      = BytesIO(virtual.getvalue())

`.getvalue()`でバイト文字列が返ってくる。それを再度BytesIOの引数に入れてバイナリオブジェクトを作る。これを後続のFileResponseの引数に入れて返却する。


### FileResponseでレスポンスを返す

FileResponseを使ってバイナリを返却することで、ファイルそのものを返却することになる。

その際、ファイル名を指定しておくと良いだろう。(何もないと適当なファイル名が割り当てられる。拡張子もなし。)

    #レスポンスをする
    return FileResponse( binary, filename="download.xlsx" )

    
## 結論

メモリ内に保存し、バイナリでレスポンスを返すこの方法は、あらゆるPythonの保存系のメソッドで使える。

matplotlibであれ、Pillowであれ、OpenCVであれ、FFMPEGであれ。

メモリ空間内に保存するので、ストレージに保存する方法と違って削除の手間もかからない。

ただ、ファイルサイズが大きすぎるとサーバーのメモリを大量消費するので、スペックの低いクラウドサーバーやRaspberry Piなどでは使わないほうが良さそうだ。

参照元: https://stackoverflow.com/questions/8469665/saving-openpyxl-file-via-text-and-filestream



### 【非推奨】save_virtual_workbookを使う方法

この方法は公式により非推奨とされている。

    from django.views import View
    from django.http import FileResponse
    
    from io import BytesIO
    import openpyxl as px
    
    class ExcelView(View):
    
        def get(self, request, *args, **kwargs):
    
            #ワークブックを作る。
            wb          = px.Workbook()
            ws          = wb.active
    
            ws["A1"]    = "A1"
    

            #バイト文字列を返却する。
            byte_string = px.writer.excel.save_virtual_workbook(wb)

            #バイト文字列をバイナリに変換してレスポンスをする。ファイル名も指定する。
            return FileResponse( BytesIO(byte_string), filename="download.xlsx" ) 
    
    excel   = ExcelView.as_view()


#### ワークブックのバイト文字列の変換

openpyxlには、ワークブックのオブジェクトをバイト文字列に変換するメソッドが用意されている。それが下記。

    px.writer.excel.save_virtual_workbook(wb)

公式もDjango用としている。

参照元: https://openpyxl.readthedocs.io/en/latest/api/openpyxl.writer.excel.html#openpyxl.writer.excel.save_virtual_workbook

#### バイト文字列のバイナリ変換

このバイト文字列をバイナリに変換する。後述のFileResponseにてレスポンスをするために。


    from io import BytesIO

    BytesIO(byte_string)

#### DjangoのFileResponseでバイナリをレスポンスする

    return FileResponse( BytesIO(byte_string), filename="download.xlsx" ) 

