---
title: "QdrantのCRUD、コレクションとポイント、ハイブリッド検索について"
date: 2026-08-22T08:08:57+09:00
lastmod: 2026-08-22T08:08:57+09:00
draft: false
thumbnail: "images/qdrant.jpg"
categories: [ "インフラ" ]
tags: [ "Qdrant","ベクトルDB","AI開発" ]
---



## Qdrantとは？

Qdrantはファイルの意味をまとめた数値の集まり(ベクトルデータ)を保存・検索できるベクトルDBの一種。

Qdrantにより、意味で検索できる。

例えば、「哺乳類で、海に棲んでいる。天敵がいない、水族館にもいる生き物。」と検索をすれば、「シャチ」が出てくる。つまり、直接「シャチ」と言わず、「シャチ」に含まれる意味を元に検索をすることができる。

実務では、

- ファイル名は思い出せないが、内容はわかっているものを探す
- 類似の画像を探して集約する
- 話題を指定して、その話題が取り上げられた音声データを取り出す

などの用途がある。

ベクトルデータとは、高次元の数値データ(多次元配列)のこと。次元とは特徴のことを意味している。高次元にすることで大量の特徴を保持できる。

## コレクションとポイントについて

- コレクション: 同一の目的・形式のデータをひとまとめにしている物。RDBに例えるならテーブル
- ポイント: コレクション内のデータ1件のこと。RDBに例えるならレコード

このポイントにベクトル情報を記録する。

## dockerで環境構築

docker のインストールは[こちら](/post/startup-ubuntu-docker/)

以下コマンドでdocker にコンテナ作成

```
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

以降、起動する場合はコンテナ指定して起動

```
docker start qdrant
```

動作確認は以下でOK

```
curl http://localhost:6333
```


## コレクションのCRUD


```
from qdrant_client import QdrantClient, models

# 接続
client = QdrantClient(host="localhost", port=6333 )

# Create: 存在確認をしてコレクション作成
if not client.collection_exists("e_cert_rag"):
    client.create_collection(
        collection_name="e_cert_rag",
        vectors_config=models.VectorParams(
            size=384,
            distance=models.Distance.COSINE,
        ),
    )


# Read: 全コレクション取得
collections = client.get_collections()

for c in collections.collections:
    print(c.name)


# Read: コレクション名を指定して取得
info = client.get_collection("e_cert_rag")

print(info.status)
print(info.points_count)
print(info.config.params.vectors.size)


# Update: コレクションの設定変更。(Optimizerの変更)
client.update_collection(
    collection_name="e_cert_rag",
    optimizer_config=models.OptimizersConfigDiff(
        indexing_threshold=10000
    )
)

# Delete: コレクション削除
if client.collection_exists("e_cert_rag"):
    client.delete_collection("e_cert_rag")
```



## ポイントのCRUD

Create/Update で upsert というメソッド名。idを指定して存在しなければCreate、存在していればUpdate

```
client.upsert(
    collection_name="e_cert_rag",
    points=[
        models.PointStruct(
            id=1,
            vector=[0.1] * 384,
            payload={
                "text": "ニューラルネットワークとは...",
                "file": "chapter1.pdf",
                "chunk": 0,
            }
        )
    ]
)
```
points には複数のPointStruct を入れてまとめて登録・編集することができる。

Read(ID指定取得。)

```
points = client.retrieve(
    collection_name="e_cert_rag",
    ids=[1],
)

print(points[0].payload)
```

Payload条件を指定して削除する。

```
client.delete(
    collection_name="e_cert_rag",
    points_selector=models.FilterSelector(
        filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="file",
                    match=models.MatchValue(value="chapter1.pdf")
                )
            ]
        )
    )
)
```

### 【補足1】ポイントの送信上限(JSON)の対処法

client.upsert で送信できるポイントは複数件まとめて送信できる。だが、リクエスト送信上限があるため対策をしなければならない。

例えば、8MBで調整をするには以下のようにする。

```
import json
from qdrant_client import models

MAX_BYTES = 8 * 1024 * 1024  # 8MB

batch = []
batch_size = 0

for point in points:
    size = len(json.dumps(point.payload, ensure_ascii=False).encode("utf-8"))
    size += len(point.vector) * 4  # float32のおおよそのサイズ

    if batch and batch_size + size > MAX_BYTES:
        client.upsert("e_cert_rag", points=batch)
        batch = []
        batch_size = 0

    batch.append(point)
    batch_size += size

if batch:
    client.upsert("e_cert_rag", points=batch)
```

8MBを超えるとき登録を繰り返し、最後に残っていたら登録する。

## ハイブリッド検索について

ハイブリッド検索とは

- Dense: 意味検索
- Sparse: キーワード検索

この2つを組み合わせた検索手法

```
client.query_points(
    collection_name="web_rag",

    # 検索手法
    prefetch=[
        # Dense
        models.Prefetch(query=dense_query,using="dense",limit=30),
        # Sparse
        models.Prefetch(query=sparse_query,using="sparse",limit=30),
    ],
    query=models.FusionQuery(fusion=models.Fusion.RRF ), limit=10,
)
```

1. Denseで意味検索(30件取る)
1. Sparseでキーワード検索(30件取る)
1. models.Fusion.RRF でDenseとSparseの順位を元に順位付けする
1. limit=10 で 10件を取得する

この方法であれば、意味検索とキーワード検索の集合を1つのランキングにまとめることができる。


## リランクについて




### FastEmbedding と SentenceTransformer について



## 参照元

- 公式
    - https://qdrant.tech/documentation/search/search/
    - https://qdrant.tech/documentation/manage-data/points/
- その他
    - https://www.oracle.com/jp/database/vector-database/qdrant/
    - https://zenn.dev/tfutada/articles/acf8adbb2ba5be
    - https://qiita.com/ktaka1104/items/01bc93ce2c36f3386bd0
    - https://note.com/zenkok/n/nbfb21f399e33



