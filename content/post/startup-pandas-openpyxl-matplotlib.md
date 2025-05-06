---
title: "【データ分析】pandasの基本的な使い方、グラフ描画、ファイル読み書き、計算等【バックエンドにopenpyxlとmatplotlibを使う】"
date: 2021-10-14T12:47:15+09:00
draft: false
thumbnail: "images/pandas.jpg"
categories: [ "others" ]
tags: [ "スタートアップシリーズ","pandas","matplotlib","AI開発","初心者向け","Python","Pythonライブラリ" ]
---

pandasでファイルの読み込み、演算、グラフ描画、ファイル書き込みの基本操作関係を記す。

## 前提

`data.xlsx`及び`data.csv`の内容を下記とする。これをPythonのファイルと同じディレクトリに格納する。

<div class="img-center"><img src="/images/Screenshot from 2021-10-14 13-18-14.png" alt=""></div>

ライブラリインストールのコマンドは下記。

    pip install openpyxl pandas matplotlib

## pandasの使い方

CSVやエクセルのファイルをそのまま読み込んで分析できる。

### ファイルの読み込み

`.read_csv()`メソッドでCSVを読み込む。

    #! /usr/bin/env python3
    # -*- coding: utf-8 -*-
    
    import pandas as pd  
    print(pd.__version__)
    
    df  = pd.read_csv("data.csv")
    print(df)


以下、実行結果。

    1.1.5
         生徒名  英語  数学  国語  理科  社会
    0    Ash  87  69  55  99  59
    1    Bob  88  78  48  66  79
    2  Carol  57  66  86  92  71

`.read_excel()`でエクセルファイルの読み込みができる。`engine='openpyxl'`の指定をお忘れなく。

    #! /usr/bin/env python3
    # -*- coding: utf-8 -*-
    
    import pandas as pd  
    print(pd.__version__)
    
    df  = pd.read_excel("data.xlsx",engine='openpyxl' )
    print(df)

以下、実行結果。

    1.1.5
         生徒名  英語  数学  国語  理科  社会
    0    Ash  87  69  55  99  59
    1    Bob  88  78  48  66  79
    2  Carol  57  66  86  92  71

参照元:https://stackoverflow.com/questions/65254535/xlrd-biffh-xlrderror-excel-xlsx-file-not-supported

### 演算

演算はDataFrameのメソッドから簡単に実行できる。

参照元: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html

#### 参照

まず値の参照から。dfの型は`<class 'pandas.core.frame.DataFrame'>`であり、オブジェクトであるが、辞書型のようにキーを指定してデータの一覧を手に入れることができる。(挙動が完全な辞書型ではない点に注意。)

    for d in df["数学"]:
        print(d)

実行結果。

    69
    78
    66

#### 平均

`.mean()`メソッドを使用する。

列ごとの平均。これで科目ごとの平均点が出せる。

    print(df.mean())

実行結果

    英語    77.333333
    数学    71.000000
    国語    63.000000
    理科    85.666667
    社会    69.666667
    dtype: float64

行ごとの平均。これで生徒ごとの平均点になる。

    print(df.mean(axis="columns"))

実行結果

    0    73.8
    1    71.8
    2    74.4
    dtype: float64

名前で表示して欲しい場合は、ファイル読み込み時に`index_col=0`を指定する。

    df  = pd.read_csv("data.csv",index_col=0)

実行結果

    生徒名
    Ash      73.8
    Bob      71.8
    Carol    74.4
    dtype: float64

参照元: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.mean.html

#### 合計

合計は`.sum()`メソッドを使用する。`.mean()`と同様にaxis引数を使用することで列に対して実行することができる。

科目ごと、生徒ごとの合計値の表示が可能。

    print(df.sum())
    print(df.sum(axis="columns"))

実行結果

    生徒名    AshBobCarol
    英語             232
    数学             213
    国語             189
    理科             257
    社会             209
    dtype: object
    0    369
    1    359
    2    372
    dtype: int64

参照元: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.sum.html

### グラフ描画

`.plot()`メソッドを実行して、グラフデータをセットする。

グラフ描画はバックエンドとしてmatplotlibを使用する。`.show()`でグラフデータをウィンドウで表示。

    df.plot() 

    import matplotlib.pyplot as plt
    plt.show()

<div class="img-center"><img src="/images/202110141441.png" alt=""></div>

フォントが用意されていないので、豆腐になっている。日本語を表示させたいのであれば下記を参照

参照: https://qiita.com/yniji/items/3fac25c2ffa316990d0c

### ファイル書き込み

`.to_csv()`でCSVへ書き込みができる

下記は科目ごとの合計を計算している。

    sumdf   = df.sum()
    sumdf.to_csv("sum.csv")

<div class="img-center"><img src="/images/Screenshot from 2021-10-14 14-48-39.png" alt=""></div>

エクセルファイルに書き込みがしたい場合は、下記の様にする。ただし、何も設定を施さないと、やや見づらい書式になってしまう。

    sumdf   = df.sum()
    sumdf.to_excel("sum.xlsx",engine="openpyxl")

<div class="img-center"><img src="/images/Screenshot from 2021-10-14 14-55-20.png" alt=""></div>

### 参照元

- 公式: https://pandas.pydata.org/docs/
- Qiita1: https://qiita.com/ysdyt/items/9ccca82fc5b504e7913a
- Qiita2: https://qiita.com/koara-local/items/0e56bc1e58b11e4d7a32

### matplotlibの参照元

- 公式: https://matplotlib.org/stable/contents.html
- Qiita1: https://qiita.com/nkay/items/d1eb91e33b9d6469ef51
- Qiita2: https://qiita.com/skotaro/items/08dc0b8c5704c94eafb9

### openpyxlの参照元

- 公式: https://openpyxl.readthedocs.io/en/stable/
- Qiita: https://qiita.com/taito273/items/07e4332293c2c59799d1


## pandas 基本操作のまとめ

基本操作をまとめたコード。


## 関連記事

- [AI実装検定A級のメモ](/post/ai-exam-rank-a/)
- [【Pandas】DataFrameをループして取り出す【列ごと、行ごとに取り出すにはdf.items()とdf.itertuples()でOK】](/post/pandas-for-loop/)



