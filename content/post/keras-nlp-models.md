---
title: "KerasでNLPモデルを再現する"
date: 2026-05-03T15:40:11+09:00
lastmod: 2026-05-03T15:40:11+09:00
draft: false
thumbnail: "images/keras.jpg"
categories: [ "others" ]
tags: [ "AI開発","keras","自然言語処理" ]
---


## 前提知識

本記事では Functional APIを使用する。

FunctionalAPIでは layersの層を積み重ね、Modelクラスの引数として引き渡しインスタンスを作る。

- layers.Input : 入力値のデータ型を定義する。
- layers.Embedding : 単語をベクトルに変換。
- layers.Dense : 全結合層。すべての入力と出力を線で結んで計算をする。
- layers.Flatten : 平坦化。多次元のデータを1列の長い棒に変換をする。全結合層(Dense)につなぐ際などに使う。
- layers.Dot : テンソルの内積を計算する。
- layers.Reshape : 形状の変更をする。Flattenは強制的に1次元にするのに対して、Reshapeは好きな形に変更できる。
- layers.Activation : 活性化関数の指定をする。
- layers.GRU: GRUを使用する。
- layers.LSTM : LSTMを使用する。

Modelインスタンスの メソッドについて

- .compile() : どのようにして学習をするかを決める設定作業。最適化手法や損失関数などを引数に指定する。
- .summary() : 設計図の全容をテキストで表示する際に使う。意図通りに層がつながっているか確認。
- .fit() : 学習の実行。順伝播、誤差計算、逆伝播、勾配降下の重み更新まで、一貫して行う。
- .get_layers() : 特定層へのアクセス。特定の層に対しての操作を行う。


## Word2Vec (Skip-gram)

```
import tensorflow as tf
from tensorflow.keras import layers, Model
import numpy as np
from collections import Counter

# -------------------------
# 1. コーパス準備
# -------------------------
corpus = [
    "i like machine learning",
    "i like deep learning",
    "i enjoy flying",
]

# トークン化
tokens = [sentence.split() for sentence in corpus]

# 語彙作成
word_counts = Counter([w for sent in tokens for w in sent])
vocab = list(word_counts.keys())
word_to_id = {w: i for i, w in enumerate(vocab)}
id_to_word = {i: w for w, i in word_to_id.items()}

vocab_size = len(vocab)

# -------------------------
# 2. Skip-gramデータ生成
# -------------------------
window_size = 2

pairs = []
for sent in tokens:
    ids = [word_to_id[w] for w in sent]
    for i, target in enumerate(ids):
        for j in range(max(0, i-window_size), min(len(ids), i+window_size+1)):
            if i != j:
                context = ids[j]
                pairs.append((target, context, 1))  # 正例

# ネガティブサンプリング
num_negative = 2
all_words = list(range(vocab_size))

neg_pairs = []
for target, _, _ in pairs:
    for _ in range(num_negative):
        negative_word = np.random.choice(all_words)
        neg_pairs.append((target, negative_word, 0))

# データ結合
all_data = pairs + neg_pairs
np.random.shuffle(all_data)

targets = np.array([p[0] for p in all_data])
contexts = np.array([p[1] for p in all_data])
labels = np.array([p[2] for p in all_data])

# -------------------------
# 3. モデル定義
# -------------------------
embedding_dim = 50

target_input = layers.Input(shape=(1,))
context_input = layers.Input(shape=(1,))

embedding = layers.Embedding(
    input_dim=vocab_size,
    output_dim=embedding_dim,
    name="embedding"
)

target_vec = embedding(target_input)
context_vec = embedding(context_input)

# 内積
dot_product = layers.Dot(axes=-1)([target_vec, context_vec])
dot_product = layers.Reshape((1,))(dot_product)

output = layers.Activation("sigmoid")(dot_product)

model = Model(inputs=[target_input, context_input], outputs=output)
model.compile(loss="binary_crossentropy", optimizer="adam")

model.summary()

# -------------------------
# 4. 学習
# -------------------------
model.fit(
    [targets, contexts],
    labels,
    epochs=100,
    batch_size=32
)

# -------------------------
# 5. 埋め込み取得
# -------------------------
embeddings = model.get_layer("embedding").get_weights()[0]

def most_similar(word, top_k=3):
    if word not in word_to_id:
        return []

    idx = word_to_id[word]
    vec = embeddings[idx]

    similarities = embeddings @ vec
    norms = np.linalg.norm(embeddings, axis=1) * np.linalg.norm(vec)
    similarities = similarities / norms

    sorted_ids = np.argsort(-similarities)

    result = []
    for i in sorted_ids[1:top_k+1]:
        result.append((id_to_word[i], similarities[i]))

    return result

# テスト
print(most_similar("learning"))
```

以下、summary の結果である。

<div class="img-center"><img src="/images/Screenshot from 2026-05-05 10-44-01.png" alt=""></div>



### 参考文献

- https://www.tensorflow.org/tutorials/text/word2vec?hl=ja


## RNN (LSTM)

通常RNNは層を積み重ねるたび、入力値に重み(1以下の値)の掛け算を繰り返す。その繰り返しの過程で値は0になり消える、勾配消失を起こす。

そこでLSTMは情報の通り道を用意し、


- 忘却ゲート (forget gate) : 過去の情報のうち不必要なものを処分する
- 入力ゲート (input gate) : 新しい情報のうち何を保存するかを決める
- 出力ゲート (output gate) : 更新された情報のうち何を次の層に出力するかを決める

これらのゲートでは、すべて足し算で更新されるようになっている。そのため、過去の情報をなるべく遠くの未来へ届けることができる。

また、足し算で後続の層へ引き渡す仕組みは、ResNetの残差接続と共通している。ResNetの残差接続は層の入力値に計算をした結果(残差)を加えて後続の層に引き渡している。

```
from keras import layers, Model

inputs = layers.Input(shape=(10, 64)) # (タイムステップ数, 特徴量数)

# LSTM層
# return_sequences=Trueにすると、全ステップの出力を出し、Falseなら最後のステップのみ出す
lstm_output = layers.LSTM(128, return_sequences=False)(inputs)

outputs = layers.Dense(10, activation="softmax")(lstm_output)
model = Model(inputs, outputs)
```

## RNN (GRU) 

LSTMが3つのゲートを使って後続に値を引き渡していたのに対して、GRUの2つのゲートで作られている。

- 更新ゲート (update gate) : 過去の情報をどれだけ残して、どれだけ新しい情報を混ぜるか
- リセットゲート (reset gate) : 新しい情報を作るとき過去の情報をどれだけ無視するか

```
# GRU層
gru_output = layers.GRU(128, return_sequences=False)(inputs)

outputs = layers.Dense(10, activation="softmax")(gru_output)
model_gru = Model(inputs, outputs)
```


## seq2seq

seq2seq は入力を受け付けるEncoderと出力をするDecoderの2つで構成されている。

```
from keras import layers, Model

# --- Encoder ---
encoder_inputs = layers.Input(shape=(None, 512)) # 入力文
# 最後の状態（state_h, state_c）だけを取り出すのがポイント

_, state_h, state_c = layers.LSTM(256, return_state=True)(encoder_inputs)
encoder_states = [state_h, state_c] # これが「文の意味」を凝縮したベクトル

# --- Decoder ---
decoder_inputs = layers.Input(shape=(None, 512)) # ターゲット文（学習時）
decoder_lstm = layers.LSTM(256, return_sequences=True)
# Encoderから引き継いだ states を初期状態としてセットする
decoder_outputs = decoder_lstm(decoder_inputs, initial_state=encoder_states)

decoder_dense = layers.Dense(vocabulary_size, activation="softmax")
decoder_outputs = decoder_dense(decoder_outputs)

model = Model([encoder_inputs, decoder_inputs], decoder_outputs)
```

## HRED 

HREDは 

- 文脈レベルのEncoder
- 文レベルのEncoder
- 出力をするDecoder

の3つで構成されている。

```
# --- 1. Encoder (文レベル) ---
# 各文（発話）をベクトル化する（通常のseq2seqのEncoderと同じ）
sentence_input = layers.Input(shape=(None, 512))
_, s_state_h, _ = layers.LSTM(256, return_state=True)(sentence_input)
# ここで出力される s_state_h は「1つの文の意味」

# --- 2. Context RNN (文脈レベル) ---
# 過去の「文のベクトル」の並びを入力として受ける
# つまり「文のベクトルの時系列」を処理する
context_input = layers.Input(shape=(None, 256)) # 過去の発話ベクトルのリスト
_, c_state_h, c_state_c = layers.LSTM(256, return_state=True)(context_input)
context_states = [c_state_h, c_state_c] # これが「会話全体の流れ」を凝縮したベクトル

# --- 3. Decoder ---
# 会話全体の流れ(context_states)を初期状態にして、次の返答を生成する
decoder_inputs = layers.Input(shape=(None, 512))
decoder_outputs = layers.LSTM(256, return_sequences=True)(
    decoder_inputs, initial_state=context_states
)
```


## Transformer

Transformerはすべての単語を並列的に解釈して単語間のベクトルを作る。

```
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# --- Transformer Encoder Block ---
class TransformerEncoder(layers.Layer):
    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):
        super().__init__()
        self.att = layers.MultiHeadAttention(
            num_heads=num_heads,
            key_dim=embed_dim
        )
        self.ffn = keras.Sequential([
            layers.Dense(ff_dim, activation="relu"),
            layers.Dense(embed_dim),
        ])
        self.layernorm1 = layers.LayerNormalization(epsilon=1e-6)
        self.layernorm2 = layers.LayerNormalization(epsilon=1e-6)
        self.dropout1 = layers.Dropout(rate)
        self.dropout2 = layers.Dropout(rate)

    def call(self, inputs, training=False):
        # Multi-head Self Attention
        attn_output = self.att(inputs, inputs)
        attn_output = self.dropout1(attn_output, training=training)
        out1 = self.layernorm1(inputs + attn_output)

        # Feed Forward Network
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output, training=training)
        return self.layernorm2(out1 + ffn_output)


# --- Positional Encoding ---
class TokenAndPositionEmbedding(layers.Layer):
    def __init__(self, maxlen, vocab_size, embed_dim):
        super().__init__()
        self.token_emb = layers.Embedding(input_dim=vocab_size, output_dim=embed_dim)
        self.pos_emb = layers.Embedding(input_dim=maxlen, output_dim=embed_dim)

    def call(self, x):
        maxlen = tf.shape(x)[-1]
        positions = tf.range(start=0, limit=maxlen, delta=1)
        positions = self.pos_emb(positions)
        x = self.token_emb(x)
        return x + positions


# --- モデル構築 ---
def build_model(
    maxlen=100,
    vocab_size=20000,
    embed_dim=64,
    num_heads=2,
    ff_dim=128,
    num_classes=2
):
    inputs = layers.Input(shape=(maxlen,))
    x = TokenAndPositionEmbedding(maxlen, vocab_size, embed_dim)(inputs)

    # Transformer Encoder
    x = TransformerEncoder(embed_dim, num_heads, ff_dim)(x)

    # Pooling + Classifier
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dropout(0.1)(x)
    x = layers.Dense(20, activation="relu")(x)
    x = layers.Dropout(0.1)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = keras.Model(inputs=inputs, outputs=outputs)
    return model


# --- 使用例 ---
model = build_model()
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()
```



