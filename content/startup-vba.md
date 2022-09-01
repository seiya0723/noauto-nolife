---
title: "VBAでHelloWorld、セルの色変え、計算などの基本操作をやってみる【LibreOffice】"
date: 2021-12-16T09:52:21+09:00
draft: false
thumbnail: "images/libre.jpg"
categories: [ "others" ]
tags: [ "スタートアップシリーズ","vba" ]
---

VBAで基本操作(セルの装飾、計算処理、ダイアログ表示など)を行う。今回はLibreOfficeで行っているが、MicroSoftOfficeなどでも再現はできる。

## ハローワールド

    Sub hello_vba_world
    	MsgBox("Hello VBA World")
    End Sub

このマクロを任意のボタンなどに割り当てることで、『Hello VBA World』と書かれたダイアログが表示される。


## セルの取得と計算処理

計算処理をするには、特定のセルの値を手に入れ変数に格納する必要がある。

### 変数の定義と特定セルの値取得

    Sub get_value
    	Dim s As String
    	s = Range("A1").Value
    	MsgBox(s)
    End Sub

文字列型の変数sを定義する。そのsにはセルA1の値を代入する。ダイアログでsの内容を表示する。

### 数値の計算

    Sub get_value_1
    	Dim s As Long
    	s = 0
    	s = s + Range("B2").Value
    	s = s + Range("C2").Value
    	s = s + Range("D2").Value
    	MsgBox(s)
    End Sub

`s += Range("B2").Value`などと表現することはできない。

VBAにおいては数値型を定義する際は`Integer`ではなく`Long`にする。`Integer`は最大で3万2千程度しか無く、普通に計算すると簡単にあふれる。

## セルの装飾

セルの装飾。文字色と背景色を塗りつぶす。

    Sub paint
    	Range("A1").Font.Color = RGB(0,255,0)
    	Range("A1").Interior.Color = RGB(255,0,0)
    End Sub


## 結論

VBAは開発環境の構築などの手間を省くことができるメリットがある反面、Python等の最近の言語と比べて制限が多い。

最近の言語ではライブラリを使えばExcelファイルの編集などもできるので、もし開発環境の構築ができる状況であれば、そちらをおすすめする。

参照元:https://excelvba.pc-users.net/

