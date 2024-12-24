---
title: "Pandasの使い方【DataFrame・Series等の型の違い、行と列の取得方法、sklearnとの連携について】"
date: 2022-09-07T17:41:49+09:00
draft: true
thumbnail: "images/pandas.jpg"
categories: [ "サーバーサイド" ]
tags: [ "スタートアップシリーズ","AI","sklearn","pandas" ]
---


## 原型コード

    import pandas as pd
    
    data    = [ 
            ["Alice"    , 71, 29, 49, 73],
            ["Bob"      , 32, 54, 54, 74], 
            ["Carol"    , 60, 62, 77, 30],
            ]   
    
    
    labels  = ["name","jp","math","science","social"]
    
    df      = pd.DataFrame(data, columns=labels)
    
    print(df)
    
    
    #ラベルをループして1つずつ取り出す。
    for label in labels:
        for value in df[label]:
            print(value)





