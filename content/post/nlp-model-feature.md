---
title: "【箇条書き】NLPモデルの特徴まとめ"
date: 2026-05-09T08:28:22+09:00
lastmod: 2026-05-09T08:28:22+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "AI開発","pytorch","keras","NLP" ]
---

## 前提と基礎知識

### NLPモデルに入力データが与えられるまでの過程

```
文章を与える
↓
Tokenizerでトークン化（単語・サブワード・文字などに分割）
  例: "I love NLP" → ["I", "love", "NL", "##P"]
↓
語彙表（Vocabulary）を使って、トークン → トークンID に変換
  例: ["I", "love", "NL", "##P"] → [101, 2293, 17953, 1925]
↓
※ 必要に応じてパディング・マスキング・特殊トークン付与
  例: [CLS], [SEP], [PAD] などをここで追加（BERTなど）
↓
Embedding層にトークンIDを与える
  └ IDに対応するベクトルをEmbedding行列から"ルックアップ"するイメージ
↓
各トークンが密なベクトルに変換される
  例: shape = (系列長, embedding_dim)
↓
モデルの計算へ
```

トークン化とは、Tokenizerが分割する単位で区切られた結果であり、単純にスペースで区切ったり、品詞分解をしたりした結果ではない。

また、複数の文章を与えるとき、長い文章に合わせて`[PAD]` を与えて揃えている。

Embedding層で得られるベクトル、つまりトークン(単語)の特徴は、大まかに以下のように表現できる。

```
[赤色度, 果物度, 動物度]

りんご [0.85, 0.98, 0.21]
犬 [0.33, 0.12, 0.83]
ポスト [0.68, 0.04, 0.11]
```

このように各トークン(単語)ごとに、決められた特徴(今回は`[赤色度, 果物度, 動物度]`の3つ)に沿って、値を設定する。

ただし、実際に決められる特徴は `[赤色度, 果物度, 動物度]` などと人間にわかるような特徴ではない。モデルが自動的に獲得する、人間にはわからない特徴。

ちなみに、先の3つの特徴を元にベクトルを作る場合、次元数は3となる。

このトークンの次元はCNNのチャンネル数に近い概念で、1トークンにどれぐらい豊かに表現できるかを意味している。

実際には、この次元数は時制や品詞、感情などを含むため、512,1024 などと大きな数字になる。

結果、最終的に生成されるベクトルは `(10, 512)` など系列長(トークン数)と次元数で表現される。


### 入力テンソルと出力テンソルについて

NLPではモデルごとに入力テンソルと出力テンソルが大きく異なる。

#### Word2Vec (Skip-gram)

```
入力: [batch_size, 1]
出力: [batch_size, vocab_size]  ← batch_size と vocab_size で各単語の出現確率が生成できる。

batch_sizeの定義: 中心語のサンプル数
例: "I love NLP" でwindow=1なら
    ("love", "I"), ("love", "NLP") という2サンプル
    → batch_size = 2（文の数ではなく、単語ペアの数）
```

入力 [ batch_size, 1 ] の1はウィンドウサイズ。

`vocab_size` は語彙表に登録されているトークンの総数。

batch_size とvocab_size を使って各単語の出現確率が生成できる。

#### seq2seq

```
Encoderの入力: [batch_size, src_seq_len]
Decoderの入力: [batch_size, tgt_seq_len]
出力:          [batch_size, tgt_seq_len, vocab_size]

batch_sizeの定義: 文(ペア)の数
例: 翻訳タスクで3文を同時に処理 → batch_size = 3
    ("I love NLP" → "NLPが好き")  ← 1サンプル
    ("Hello"      → "こんにちは") ← 1サンプル
    ("Good night" → "おやすみ")   ← 1サンプル
```

`src_seq_len`、`tgt_seq_len` はトークン数を意味している。

例えば 「I am a student .」の場合は5トークンとなる。

`vocab_size` は語彙表に登録されているトークンの総数。

```
{
  "<PAD>": 0,
  "<BOS>": 1,
  "<EOS>": 2,
  "I": 3,
  "am": 4,
  "a": 5,
  "student": 6,
  ".": 7
}
```

例えばこの場合、`vocab_size` は8となる。

つまり、

Tokenizerでトークン化した数は`src_seq_len`,`tgt_seq_len` に、

`vocab_size`は語彙表に登録されているトークンの数を意味している。これは入力文に含まれるトークン数ではなく、モデルが出力として選択可能な全トークンの種類数である。


#### HRED (Hierarchical Recurrent Encoder-Decoder)

```
入力: [batch_size, context_len, seq_len]
出力: [batch_size, tgt_seq_len, vocab_size]

batch_sizeの定義: 会話(コンテキスト)の数
例: 3会話を同時に処理 → batch_size = 3

"こんにちは"          ┐
"元気ですか？"        ├ 1会話(context_len=3, 各発話がseq_len)
"はい、元気です！"    ┘

※ HREDは発話レベルと会話レベルの2階層構造なので
  seq2seqと違い context_len という次元が追加される
```

`context_len` は発話数。`seq_len` はトークン数。

`vocab_size`は語彙表に登録されているトークンの数を意味している。

#### Transformer

```
Encoderの入力: [batch_size, src_seq_len]
Decoderの入力: [batch_size, tgt_seq_len]
出力:          [batch_size, tgt_seq_len, vocab_size]

batch_sizeの定義: 文(ペア)の数
※ 形状はseq2seqと同じだが、内部処理がRNNではなくAttentionになる
```

`src_seq_len`、`tgt_seq_len` はトークン数を。`vocab_size`は語彙表に登録されているトークンの総数を意味している。


## 各モデルの用途

前項の内容をもとに、NLPモデルの用途をまとめる

- Word2Vec (Skip-gram): 単語(トークン)のベクトル化
- seq2seq: 翻訳機
- HRED (Hierarchical Recurrent Encoder-Decoder): チャットボット
- Transformer: 長文読解、文章生成など幅広く利用

## Attentionについて

Attentionは 特に注意を払うべきトークンを見つけるための手法。これにより語彙表から作られた埋め込み行列(ベクトル)では実現できなかった、「文脈の理解」が可能になっている。

トークンから別のトークンの関連性を

```
Attention(Q,K,V)
```

で表現をする。

```
Qは各トークンが「どの情報を参照したいか」を表すベクトル
Kは各トークンが「どんな特徴を持っているか」を表すベクトル

このQとKを使って重み（attention）を作る

Vは各トークンの持つ情報であり、
そのVを重みに従って合成して新しい表現を作る

それがAttentionの出力
```



