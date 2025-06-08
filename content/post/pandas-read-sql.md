---
title: "【Pandas】read_sql で生のSQL(SELECT文)を実行、DBから直接DataFrameを作る"
date: 2025-06-08T16:49:40+09:00
lastmod: 2025-06-08T16:49:40+09:00
draft: false
thumbnail: "images/pandas.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","pandas","tips","SQL" ]
---


分析するデータは常にCSVにあるわけではない。DBから取り出す必要もある。

そこで、Pandasからread_sql メソッドを使ってDBから直接DataFrameを作る。

## pandasで.read_sql() を使うサンプルコード

```
pip install pandas 
pip install sqlalchemy
```

事前にpandas とsqlalchemy をインストールしておく。

```
import pandas as pd
from sqlalchemy import create_engine

# 例: PostgreSQL に接続する場合（DB種類・ホスト・ポート・ユーザー・パスワードを変更）
engine = create_engine('postgresql://username:password@localhost:5432/mydb')

# 生のSQL文（文字列）
sql = """
SELECT
  species,
  AVG(petal_length) as avg_petal_length
FROM iris
GROUP BY species
"""

# pandasでSQL実行 → 結果がDataFrameになる
df = pd.read_sql(sql, con=engine)

print(df)
```

- 参照1: https://pandas.pydata.org/docs/reference/api/pandas.read_sql.html
- 参照2: https://zenn.dev/yuma_memorandum/articles/f2de7bbbc71a51

## OracleDBに対してPandasでデータを読み込みするには？

```
pip install pandas 
pip install sqlalchemy
pip install cx_Oracle
```

必要に応じて、Oracle InstantClient が必要になるため、別途下記からインストールしておく。

https://www.oracle.com/database/technologies/instant-client.html

```
import pandas as pd
from sqlalchemy import create_engine

# Oracle接続 (例: ユーザーscott、パスワードtiger、ホストlocalhost、ポート1521、サービス名orcl)
engine = create_engine('oracle+cx_oracle://scott:tiger@localhost:1521/?service_name=orcl')

df = pd.read_sql("SELECT * FROM iris", con=engine)
print(df)
```



