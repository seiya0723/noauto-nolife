---
title: "【matplotlib】フォントファイルを用意して日本語の豆腐化を修正する"
date: 2022-10-27T19:13:17+09:00
lastmod: 2022-10-28T19:13:17+09:00
draft: false
thumbnail: "images/matplotlib.jpg"
categories: [ "others" ]
tags: [ "Python","matplotlib","tips" ]
---


カレントディレクトリにNotoSansJP-Light.otfを配置する。

    import matplotlib.font_manager as fm
    import numpy as np
    import matplotlib.pyplot as plt 
    
    fprop   = fm.FontProperties(fname='NotoSansJP-Light.otf')
    x       = np.linspace(0, 1, 100)
    y       = x ** 2
    plt.plot(x, y)
    plt.title("タイトル" ,fontproperties=fprop, fontsize=40)
    plt.show()


これで豆腐化の修正ができる

