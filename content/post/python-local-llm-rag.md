---
title: "OllamaでRAGを実現する。"
date: 2026-05-31T14:41:24+09:00
lastmod: 2026-05-31T14:41:24+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "AI開発","LLM","ローカルLLM","RAG" ]
---

すでにollamaとgemma:2bをインストール済みとする。

参照: [UbuntuにローカルLLMをインストールし、Python上で動作させる(Ollama)](/post/local-llm-install/)

## RAGの実装とソースコード

```
pip install faiss-cpu sentence-transformers numpy
```

```
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import subprocess

# =========================
# 1. ドキュメント準備
# =========================
documents = [
    "RAGとは、検索と生成を組み合わせたAI手法です。",
    "FAISSはベクトル検索ライブラリです。",
    "OllamaはローカルでLLMを動かすツールです。",
    "GemmaはGoogleが開発した軽量言語モデルです。"
]

# =========================
# 2. Embedding
# =========================
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(documents)

# =========================
# 3. FAISSインデックス構築
# =========================
dim = embeddings.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(np.array(embeddings))

# =========================
# 4. 検索関数
# =========================
def search(query, top_k=2):
    query_vec = model.encode([query])
    distances, indices = index.search(np.array(query_vec), top_k)
    return [documents[i] for i in indices[0]]

# =========================
# 5. Ollamaで回答生成
# =========================
def ask_llm(prompt):
    result = subprocess.run(
        ["ollama", "run", "gemma:2b"],
        input=prompt.encode(),
        stdout=subprocess.PIPE
    )
    return result.stdout.decode()

# =========================
# 6. RAG実行
# =========================
def rag(query):
    retrieved_docs = search(query)

    context = "\n".join(retrieved_docs)

    prompt = f"""
以下の情報のみを使って質問に答えてください。

{context}

質問: {query}
"""

    answer = ask_llm(prompt)
    return answer

# =========================
# 実行
# =========================
if __name__ == "__main__":
    query = "RAGとは何ですか？"
    print(rag(query))
```

今回は、ollamaコマンドを外部として動かしている。

RAGは、それまでの会話の流れを意識する必要はないからだ。

## 解説

RAGのコア機能部の解説をする。

### 文字列を埋め込みベクトル化(Embedding)する。

```
from sentence_transformers import SentenceTransformer

# モデルの選択をしてインスタンス化
model = SentenceTransformer("all-MiniLM-L6-v2")

# 元ドキュメントを埋め込み化。
embeddings = model.encode(documents)
```

埋め込みベクトル化により、文章は意味的な類似度を距離として扱える数値空間に変換される。

意味空間への射影により、文章の意味を意識した検索が可能になる。

これは、ただの文字一致とは異なり、以下のような、より柔軟な検索ができるということだ。

```
例: ゴリラを「黒くて毛が多くて力持ちの霊長類は？」などと曖昧な言葉で検索できる。
```

### FAISSインデックス構築

FAISS はFacebook AI が開発した。

大規模ベクトルデータから、類似のベクトルを高速検索するためのもの。

更にシンプルにまとめると、検索機能とデータ構造を組み合わせたようなものである。

先ほどの埋め込みベクトル化した物を、次元数に合わせて格納する。

```
import faiss
import numpy as np

# 次元数の定義
dim = embeddings.shape[1]

# インデックス作成
index = faiss.IndexFlatL2(dim)

# 埋め込みベクトルをインデックスに格納
index.add(np.array(embeddings))
```

こうして出来上がったインデックスを次の検索工程で使用する。

### 検索処理

```
# 引数には「RAGとはなにか？」などと言った質問文章
def search(query, top_k=2):
    # 質問文章をエンコードする。(※ドキュメントの埋め込みじと同じようにリストにして送る。)
    query_vec = model.encode([query])

    # 先ほど作成したインデックスで検索をする。top_k は 最も近いベクトルを何件取得するか？という意味。(由来: k近傍法)
    distances, indices = index.search(np.array(query_vec), top_k)

    # LLMに引き渡す情報のリスト(文章の断片)
    return [documents[i] for i in indices[0]]
```

index.search で検索をする。その際、距離が違い上位何件を取得するかを`top_k`で設定する。

意味はk近傍法と同じで、近傍数の指定をしているのと同義。

数値を大きくすればするほど、情報量は増えるがノイズは増える。小さくすればするほど、ノイズは減るが情報量も減る。

最後に、LLMに引き渡す元ドキュメントのリストを引き渡して、質問に回答するよう指示を出す。

## RAGの原理のまとめ

1. ドキュメントを埋め込みベクトル化してインデックスする
1. 質問文も同様にベクトル化し、近傍となるドキュメントを取得する
1. 取得したドキュメントをコンテキストとしてLLMに与え、回答を生成させる



## 【補足】検索の精度をより高めるには？

- 元ドキュメント不足
- 質問文が長すぎる
- Embeddingの質を高め と chunk設計を考慮する
- top_kをモデルの賢さ、ドキュメント量に応じて調整
- 

特に Embedding と chunk 設計を考慮する必要がある。

日本語に弱いモデルで埋め込みを作ったり、ドメインが不一致(法律と医療の混在など)が原因。

チャンクも長すぎればノイズが混入してしまう、短すぎれば文脈は崩壊する。その適切な値を調整していく必要がある。

## 【補足】FAISS以外の選択肢

FAISSは最低限度の検索機能であり、メタデータの管理には弱い。

それ故に以下のような選択肢がある。

- Chroma : Pythonで完結、メタデータ対応
- Qdrant : 高速 ＋ フィルタ検索（label, categoryなど）

例えばQdrantであれば以下のようなJSON形式でインデックスが可能。

```
{
  "vector": [...],
  "payload": {
    "category": "AI",
    "date": "2026-01-01"
  }
}
```

ChromaはPythonベースで内部完結する。一方でQdrantはサーバーとして動作し、複数のプログラムからの問い合わせを受け、各自LLMで回答を得ることができる。

つまり、料理屋で例えるなら以下のようなものだ。

- Embeddingとチャンク : 食材の下ごしらえをして冷蔵庫に保管する加工係
- FAISSやQdrantなどのインデックス : 料理屋の冷蔵庫
- インデックスに問い合わせをする処理 : 食材を選ぶ仕入れ係
- ローカルLLM : 食材と客の要望に応じて料理を作るシェフ
- 検索文章 : 客が料理屋に送りつけた注文

というようなものだ。

上記料理屋のたとえに倣って、FAISSとQdrantの違いを並べるなら

- FAISS : 雑に詰めた冷蔵庫
- Qdrant : ラベルを付けたり、きれいに整理整頓された冷蔵庫

の違いである。Embeddingは食材の皮むき、骨取りなどの下処理。チャンクは調理しやすく食材を小さく切るようなもの。

