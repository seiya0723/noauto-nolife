---
title: "【Pandas】DataFrameをループして取り出す【列ごと、行ごとに取り出すにはdf.items()とdf.itertuples()でOK】"
date: 2022-10-27T09:29:04+09:00
draft: false
thumbnail: "images/pandas.jpg"
categories: [ "others" ]
tags: [ "pandas","Python","AI開発","初心者向け" ]
---

よくあるpandasの行ごと、列ごとにデータを取り出す方法。


## 環境

```
Python 3.8.10
```


```
numpy==1.23.4
pandas==1.5.1
python-dateutil==2.8.2
pytz==2022.5
six==1.16.0
```

## 列ごとにループして取り出す

`.iteritems()`は後のバージョンで廃止される可能性があるので、列ごとのループには`.items()`を使う

    import pandas as pd

    data                = {}
    data["month"]       = [ str(i)+"月" for i in range(1,13) ]
    data["page_view"]   = [ i*1000 for i in range(12) ]
    data["earnings"]    = [ i*100 for i in range(12) ]
    
    index               = [ str(i) for i in range(12) ]
    df                  = pd.DataFrame( data, index=index )

    ## 列ごとにループする
    for column_name, item in df.items():
    
        print(column_name)
        print(item)
        print(item["0"])
        print(item["1"])
        print(item["2"])
    

indexを指定して、取り出しができる。indexの値が文字列であれば、属性として呼び出すこともできる。

        print(item.one)
        print(item.two)
        print(item.three)


## 行ごとにループして取り出す

`.iterrows()`はindexを取り出す事ができるが、速度は`.itertuples()`に劣るので、できればitertuplesを使う方が良いだろう。

    import pandas as pd

    data                = {}
    data["month"]       = [ str(i)+"月" for i in range(1,13) ]
    data["page_view"]   = [ i*1000 for i in range(12) ]
    data["earnings"]    = [ i*100 for i in range(12) ]
    
    index               = [ str(i) for i in range(12) ]
    df                  = pd.DataFrame( data, index=index )

    ## 行ごとにループする
    for row in df.itertuples():
    
        print(row)
        print(row.month)
        print(row.page_view)
        print(row.earnings)
    


## 【補足】特定の行以降、特定の列のデータを取り出したい場合はこうする。

特定の行以降、特定の列のデータを取り出したい場合は、こうする。

```
# 行名が"1"以降のデータを取り出す。
df["4":]


特定の列
df["month"]
```

    
## 結論

- 行ごとにループする時は`df.itertuples()`
- 列ごとにループする時は`dt.items()`

これで大抵の問題は解決できる。


