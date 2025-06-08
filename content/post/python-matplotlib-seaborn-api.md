---
title: "【Pythonでグラフ描画】matplotlibとseabornのAPIのまとめ"
date: 2025-05-31T14:30:03+09:00
lastmod: 2025-05-31T14:30:03+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "AI開発","matplotlib","seaborn","tips" ]
---



## matplotlib

matplotlibは配列データを元に、グラフを描画することができる。

代表的な 棒グラフ、折れ線グラフ、散布図の3つを以下コードで描画している。

```
import numpy as np
import matplotlib.pyplot as plt

# データ準備
categories = ['A', 'B', 'C', 'D', 'E']
values = [5, 7, 3, 8, 4]  # 棒グラフ用
x = np.arange(0, 10, 1)  # 折れ線グラフ・散布図用
y_line = np.sin(x)       # 折れ線グラフ用
y_scatter = y_line + np.random.normal(0, 0.2, size=x.shape)  # 散布図用（ノイズを加える）

# --- 1. 棒グラフ ---
plt.figure(figsize=(6, 4))
plt.bar(categories, values, color='skyblue')
plt.title("Bar Graph")
plt.xlabel("Category")
plt.ylabel("Value")
plt.grid(axis='y')
plt.tight_layout()
plt.show()

# --- 2. 折れ線グラフ ---
plt.figure(figsize=(6, 4))
plt.plot(x, y_line, marker='o', linestyle='-', color='green')
plt.title("Line Graph")
plt.xlabel("X")
plt.ylabel("Y")
plt.grid(True)
plt.tight_layout()
plt.show()

# --- 3. 散布図 ---
plt.figure(figsize=(6, 4))
plt.scatter(x, y_scatter, color='red', alpha=0.7, label='Data points')
plt.plot(x, y_line, color='gray', linestyle='--', label='True function')
plt.title("Scatter Plot")
plt.xlabel("X")
plt.ylabel("Y")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
```

### 各メソッドの解説

- .figure()
- .bar()
- .plot()
- .scatter()
- .grid()
- .legend()
- .tight_layout()
- .show()

### matplotlibでデータフレームを与えると意図したとおりにならないことがある。

matplotlibで、pandasのデータフレームを直接扱うとグラフの描画が意図したとおりにならない場合がある。

そこで、matplotlibでデータフレームを扱う場合、以下のように明示的にカラムを指定してデータを与える。

```
import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    'x': [1, 2, 3, 4, 5],
    'y': [10, 20, 15, 30, 25]
})

plt.plot(df['x'], df['y'])  # 明示的にカラムを指定
plt.title("Line Plot from DataFrame")
plt.show()
```

もしデータフレームを直接扱いたい場合は、seabornを使う手もある。

```
import seaborn as sns

df = pd.DataFrame({
    'x': [1, 2, 3, 4, 5],
    'y': [10, 20, 15, 30, 25]
})

sns.lineplot(x='x', y='y', data=df)
plt.title("Line Plot with Seaborn")
plt.show()
```

## seaborn 

seabornはpandasのデータをそのまま取りこむことができる。

しかし、逆にseabornは配列データを直接扱うことはできない。**seabornに与えられるデータはpandasのデータフレーム形式( `pandas.DataFrame` )もしくはSeriesを前提とした高水準のライブラリ**である。

もし、元データが配列形式の場合、DataFrameに変換をした上で与える必要がある。

```
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# データ準備（元と同じ）
categories = ['A', 'B', 'C', 'D', 'E']
values = [5, 7, 3, 8, 4]
x = np.arange(0, 10, 1)
y_line = np.sin(x)
y_scatter = y_line + np.random.normal(0, 0.2, size=x.shape)

# SeabornはDataFrameを使う前提なので、変換する
df_bar = pd.DataFrame({'Category': categories, 'Value': values})
df_line = pd.DataFrame({'X': x, 'Y': y_line})
df_scatter = pd.DataFrame({'X': x, 'Y_Scatter': y_scatter, 'Y_True': y_line})

# --- 1. 棒グラフ ---
plt.figure(figsize=(6, 4))
sns.barplot(x='Category', y='Value', data=df_bar, color='skyblue')
plt.title("Bar Graph")
plt.xlabel("Category")
plt.ylabel("Value")
plt.grid(axis='y')
plt.tight_layout()
plt.show()

# --- 2. 折れ線グラフ ---
plt.figure(figsize=(6, 4))
sns.lineplot(x='X', y='Y', data=df_line, marker='o', color='green')
plt.title("Line Graph")
plt.xlabel("X")
plt.ylabel("Y")
plt.grid(True)
plt.tight_layout()
plt.show()

# --- 3. 散布図 ---
plt.figure(figsize=(6, 4))
sns.scatterplot(x='X', y='Y_Scatter', data=df_scatter, color='red', alpha=0.7, label='Data points')
sns.lineplot(x='X', y='Y_True', data=df_scatter, color='gray', linestyle='--', label='True function')
plt.title("Scatter Plot")
plt.xlabel("X")
plt.ylabel("Y")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
```





