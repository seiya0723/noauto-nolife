---
title: "AI実装検定S級の疑問点【KerasとPytorchの入出力テンソル、凍結など】"
date: 2026-05-16T08:52:42+09:00
lastmod: 2026-05-16T08:52:42+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "AI開発","pytorch","keras" ]
---

主に、pytorchとkerasの実装上の問題についてまとめる。

## Q: pytorch の シーケンス系レイヤ(RNNやTransformer)で使用される `batch_first` 引数とはなにか？

A. 入力テンソルの次元の並び順を指定している。

### `batch_first` 引数が使われる場所

以下、シーケンス系のレイヤで使用されている。

RNN系

- torch.nn.RNN
- torch.nn.LSTM
- torch.nn.GRU

Transformer系

- torch.nn.Transformer
- torch.nn.TransformerEncoderLayer
- torch.nn.MultiheadAttention

### `batch_first` 指定による作用

この引数の指定により、入力テンソルの次元の並び順を指定できる。

`batch_first=False（デフォルト）`  の場合、

```
(seq, batch, feature)
```

`batch_first=True` の場合、

```
(batch, seq, feature)
```

となる。いずれも特徴量次元は最後に配置されると覚えておくと良い。

### テンソルの各要素の意味は？

- seq : 時系列長。1つのデータの長さ。トークン数を意味している。
- batch : バッチサイズ。一回の学習で使用する文の数。
- feature :特徴量次元。 1つのトークンを何次元のベクトルで表現をしているか。


### `batch_first` 引数指定はどのように使い分けられるのか？

- `batch_first=False` : 時間軸を先にして、古い使い方に合わせる場合
- `batch_first=True` : バッチを先にして、新しい使い方に合わせる場合

### なぜこのような引数があるのか？

もともと、CNNとNLP(RNN,Transformer)ではテンソルの形状が異なっていた。

元々はCNNはバッチを先頭に`(batch, channel, height, width)`、NLPでは時間軸を先頭に`(seq, batch, feature)`と配置している。そのため不整合が生じていた。

現在は`batch_first=True`を使って全体をバッチ先頭に統一させるのが一般的になっているため。

### 【関連】入力テンソルについて。CNNのKerasとPytorchの違いは？

いずれもバッチを先頭に書く文化がある。異なるのはCHWかHWCの違い

- pytorch : (batch, channel, height, width)
- Keras(TensorFlow) : (batch, height, width, channel)

pytorchは低レベル志向で、メモリアクセス効率を考慮した結果バッチの次にチャンネルを置いている。

Kerasは高レベル志向で、自然な並びに合わせた結果、バッチの次にheight を置いている。


## Q: Kerasの分類ヘッド設計と出力する特徴量表現とはなにか？

A. 分類ヘッド設計は出力するテンソルをImageNetに合わせるかの指定。特徴量表現は最終的に出力をするテンソルの次元数について指定できる。

### 使用する引数

- `include_top` : Trueで全結合分類器(ImageNet用の1000クラス仕様)まで含める。Falseで含まない。
- `pooling` : "avg"を指定してGlobal Average Poolingでプーリング、2次元特徴ベクトルを出す。Noneで四次元ベクトルを出す。

### 出力テンソルの違いの早見表

| `pooling/include_top` | `include_top=True` | `include_top=False` |
| -----      | -------      | ------- |
| `pooling="avg"`       | ※ (B, 1000) | (B,C) |
| `pooling="max"`       | ※ (B, 1000) | (B,C) |
| `pooling=None`        | ※ (B, 1000) | (B,H,W,C) |

(※) `include_top=True`の場合、ImageNetの分類ヘッド(GAP+Dense) 固定により、`pooling` 引数の指定は無効。出力テンソルは必ず(B,1000)となる。

分類ヘッドを自作したい場合に`include_top=False`を指定し自前で全結合層を追加する。その自前の全結合層の前で受け取る出力形状は`pooling` 引数で指定をする。

### 出力テンソル 4次元と2次元の違い

- 4次元: どこに何があるのか(空間情報を活用する)
- 2次元: その特徴がどのぐらいあるのか

空間情報を捨てて、存在量に変換をする。

2次元にすることで全結合層に入れることができる。全結合層(Dense/Linear)は (batch, feature)を期待しているため。


### VGG のパラメータ爆発(1億3800万)を再現するには？

`include_top=False`と`pooling=None`を指定して、その直後にFlattenで線形化、2次元テンソル(batch, feature)にする。

その上で全結合層(Dense/Linear)に突っ込めば実現できる。

poolingを使わずにFlattenで線形化→Dense/Linearでパラメータが爆発してしまう。実際の計算式は下記。

```
# H x W x C 
7 × 7 × 512 = 25088

# 更にBをかける
25088 × 4096 ≈ 1億

# 実際のVGGでは、更にここに2層目と出力層のパラメータが加わり1億3800万となる。
```

### FlattenとLinearの違いは？

どちらも線形テンソルを出力しているという点では同じ。

Flattenはreshape(形状の変更) チャンネルと空間を掛け算して特徴量としている。

```
(B, H, W, C) → (B, H×W×C)
```

一方でLinearは重みつき和により学習をしている。

```
(B, N) → (B, M)
```
|            | Flatten      | Linear  |
| -----      | -------      | ------- |
| 役割       | 形を変える   | 情報を変換する |
| パラメータ | 0            | あり           |
| 学習       | しない       | する           |

つまり、厳密にはFlattenではなく、Linearに入れた段階でパラメータが爆発する。

だから、`include_top=False`を指定した場合、 基本的にはpoolingで avg もしくはmaxを指定してプーリングを行う。これによりパラメータ爆発は避けられる。

### PytorchでGAPを実行し、二次元テンソルを出力するには？

1x1でAdaptiveAvgPool2d を使ってGAPを実現。squeeze(次元を削除する) して2次元にする。

```
import torch.nn as nn

gap = nn.AdaptiveAvgPool2d((1, 1))

# (B, C, 1, 1)

x = gap(x)
x = x.view(x.size(0), -1)

# (B, C)
```

もしくはmeanで直接二次元化する。


```
x = x.mean(dim=(2, 3))  # H, W を平均
```
つまり、
```
import torch.nn as nn

model = nn.Sequential(
    backbone,
    nn.AdaptiveAvgPool2d((1, 1)),
    nn.Flatten()
)
```
このpytorchコードは以下Kerasと等価。
```
base_model = EfficientNetB0(
    include_top=False,
    pooling="avg"
)
```


## 演習問題 (入力・出力テンソルについて)


### Q1

PyTorchのCNN入力テンソルの形はどれか？

- A. (B, H, W, C)
- B. (B, C, H, W)
- C. (C, B, H, W)
- D. (H, W, C, B)

### Q2

KerasのCNN入力テンソル（デフォルト）はどれか？

- A. (B, C, H, W)
- B. (H, W, C, B)
- C. (B, H, W, C)
- D. (C, H, W, B)

### Q3

PyTorchのRNNのデフォルト入力はどれか？

- A. (B, seq, feature)
- B. (seq, B, feature)
- C. (feature, seq, B)
- D. (B, feature, seq)

### Q4

batch_first=True の意味として正しいものはどれか？

- A. featureが先頭になる
- B. seqが先頭になる
- C. batchが先頭になる
- D. channelが先頭になる

### Q5

PyTorchのTransformerのデフォルト入力はどれか？

- A. (B, seq, feature)
- B. (seq, B, feature)
- C. (feature, B, seq)
- D. (B, feature, seq)

### Q6

include_top=True のときの出力は？

- A. (B, C)
- B. (B, H, W, C)
- C. (B, 1000)
- D. (B, H×W×C)

### Q7

include_top=False, pooling=None の出力は？

- A. (B, 1000)
- B. (B, C)
- C. (B, H, W, C)
- D. (H, W, C)

### Q8

include_top=False, pooling="avg" の出力は？

- A. (B, H, W, C)
- B. (B, C)
- C. (B, 1000)
- D. (C,)

### Q9

include_top=True のときの pooling の扱いは？

- A. 必須
- B. 無視される
- C. 必ずavgになる
- D. エラーになる

### Q10

Global Average Pooling の役割として正しいものは？

- A. チャネルを増やす
- B. 空間次元を平均して削除する
- C. バッチ次元を削除する
- D. featureを並べ替える

### Q11

Flattenの役割は？

- A. 値を平均する
- B. 次元を並べ替えるだけ
- C. 重み付き和を計算する
- D. チャネルを削除する

### Q12

Linear（Dense）の役割は？

- A. reshape
- B. 次元削除
- C. 重み付き線形変換
- D. 並び替え

### Q13

パラメータ爆発の主因はどれか？

- A. GAP
- B. Flatten
- C. Linear層
- D. batch_size

### Q14

VGGでパラメータが多い理由は？

- A. 畳み込みが多い
- B. GAPを使っている
- C. Flatten後に巨大なDenseを使う
- D. batchが大きい

### Q15

(B, C, H, W) → (B, C) にする操作として正しいものは？

- A. flatten
- B. mean(dim=(2,3))
- C. permute
- D. unsqueeze

### Q16

squeeze の役割は？

- A. 平均を取る
- B. 次元を追加する
- C. サイズ1の次元を削除
- D. 並び替え

### Q17

(B, C, 1, 1) に対して squeeze を行うと？

- A. (B, C, 1, 1)
- B. (B, C)
- C. (C,)
- D. (B, 1)

### Q18

PyTorchでKerasの pooling="avg" に対応するのは？

- A. nn.Flatten()
- B. nn.Linear()
- C. nn.AdaptiveAvgPool2d((1,1))
- D. nn.Conv2d

### Q19

次のうち「学習パラメータを持たない操作」はどれか？

- A. Linear
- B. Conv2d
- C. Flatten
- D. Dense

### Q20

次のうち正しい説明はどれか？

- A. Flattenは学習を行う
- B. GAPはreshape操作である
- C. Linearはパラメータを持つ
- D. squeezeは平均を取る


### 回答

- Q1  : B
- Q2  : C
- Q3  : B
- Q4  : C
- Q5  : B
- Q6  : C
- Q7  : C
- Q8  : B
- Q9  : B
- Q10 : B
- Q11 : B
- Q12 : C
- Q13 : C
- Q14 : C
- Q15 : B
- Q16 : C
- Q17 : B
- Q18 : C
- Q19 : C
- Q20 : C


注意する点は、`include_top=True`で`pooling=avg`を指定したとしても例外にはならないという点。

無視されるだけであり、開発者の本来の意図した通りにならない可能性もあるため、引数の意味には十分注意をする。

## Q: Kerasでは`include_top=False`で分類出力層(分類ヘッド)を自前で用意するが、Pytorchではどうなる？

A. CNNモデルのオブジェクトから分類ヘッドの箇所を上書きする。

### KerasとPytorchの分類出力層変更の違い

Kerasは、CNNモデルのインスタンス引数として分類ヘッドを自前で用意する旨を指定(`include_top=False`)
```
base_model = EfficientNetB0(
    include_top=False,   # ← Headを外す
    pooling="avg"
)

x = Dense(num_classes)(base_model.output)
```

その上で、インスタンスを自前で用意した出力層と組み合わせる。

一方でPytorchの方では、

```
model = torchvision.models.resnet50(pretrained=True)

model.fc = nn.Linear(2048, num_classes)
```

KerasとPytorchの分類出力層変更の違いは以下の通り。

|観点|Keras|PyTorch|
|--------|------|-------|
|Backbone|そのまま使う|そのまま使う|
|Head|削除して追加|上書き|
|目的|クラス数変更|クラス数変更|

本質と目的は同じ。分類出力層の用意の仕方が異なる。


### CNNモデルごとの分類出力層の変更

#### VGG

```
model = torchvision.models.vgg16(pretrained=True)
model.classifier[6]
```

#### GoogLeNet

※ 注意: GoogLeNetには補助分類器(auxiliary classifier)があるため、補助分類器専用の出力層も考慮する。

補助分類器を無効化させた上で更新するなら下記

```
model = torchvision.models.googlenet(pretrained=True, aux_logits=False)
model.fc = nn.Linear(1024, num_classes)
```

より厳密にやるなら下記

```
model = torchvision.models.googlenet(pretrained=True)
model.aux1.fc2 = nn.Linear(...)
model.aux2.fc2 = nn.Linear(...)
```

#### ResNet/WideResNet

```
model = torchvision.models.resnet50(pretrained=True)
model.fc = nn.Linear(...)
```
#### DenseNet

```
model = torchvision.models.densenet121(pretrained=True)
model.classifier = nn.Linear(...)
```

ここからclassifier に回帰。

#### MobileNetV2

```
model = torchvision.models.mobilenet_v2(pretrained=True)
model.classifier[1] = nn.Linear(...)
```

#### MobileNetV3

```
model = torchvision.models.mobilenet_v3_large(pretrained=True)
model.classifier[3] = nn.Linear(...)
```

MobileNetと違い分類出力層は

```
[0] Linear (in_features → hidden)
[1] Hardswish（活性化）
[2] Dropout
[3] Linear（hidden → num_classes） ← これ
```

となっているため最後のLinearを使う。

#### EfficientNet

```
model = torchvision.models.efficientnet_b0(pretrained=True)
model.classifier[1] = nn.Linear(...)
```

### torchvision の分類出力層の変更点の覚え方

いずれも、最後のLinearを選ぶという点で共通。

- VGGは巨大な全結合層があるため、インデックス番号に6を指定し、`.classifier[6]`
- GoogLeNetはLinear1種のみと補助分類器の影響で、aux_logits=True で `.fc` もしくは `aux1.fc2`と`aux2.fc2`
- ResNet/WideResNetもLinear1種のみのため、`.fc`
- DenseNetもLinear1種でvggに名前回帰して、`.classifier`
- MobileNetV2 は Dropout+Linearのため、`.classifier[1]`
- MobileNetV3 は Linear+h-swish+Dropout+Linearのため、`.classifier[3]`
- EfficientNet は Dropout+Linearのため、`.classifier[1]`

もっと抽象化すると。

- VGG は巨大で6
- GoogLeNetは補助分類器に注意
- Resnet/WideResnet,DenseNetはそのまま
- MobileNetV2とEfficientNetは1
- MobileNetV3はやや大きめで3

と覚える。



## Q: pytorchとKerasでは凍結する(ファインチューニングをしない)にはどのように実装するか？


A. 仮にモデル全体を凍結させたい場合は、以下のとおりである。

Keras
```
base_model = EfficientNetB0(weights="imagenet", include_top=False)

base_model.trainable = False


# コンパイル後に凍結の指定は無効。
base_model.compile(...)
```

Pytorch

```
from torchvision.models import resnet50, ResNet50_Weights

model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)

for param in model.parameters():
    param.requires_grad = False
```

Kerasは`trainable=False`してcompile。

Pytorchはモデルのパラメータをループで取り出して`requires_grad=False`。

### そもそも凍結(ファインチューニングをしない)とは？

ファインチューニングとは既存のモデルに対して、学習時で重みを更新する作業のことである。

このファインチューニングをしないようにするのが凍結。

重みを更新させず、事前に用意されたモデルをそのまま使って評価できる。


### 事前学習モデルの指定はweights引数にて

Kerasは文字列型で"imagenet"と指定すればOK。Pytorchはより細かく指定している。

旧仕様としてpretrained 引数がある。

```
model = resnet50(pretrained=True)
```


### 凍結の実装方法のまとめ

全体ではなく、より細かく凍結を行う方法は以下の通り。

Keras
```
base_model = EfficientNetB0(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

base_model.trainable = False

x = Dense(num_classes)(base_model.output)
model = Model(inputs=base_model.input, outputs=x)
```


Pytorch
```
model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)

# freeze
for param in model.parameters():
    param.requires_grad = False

# head差し替え
in_features = model.fc.in_features
model.fc = nn.Linear(in_features, num_classes)

# headだけ学習
for param in model.fc.parameters():
    param.requires_grad = True
```


## Q: Batch Normalization(BN、正規化などとも言う)とMask(マスク)の違いは？

A. BNは値のスケールや分布を整える、マスクは一部の情報を遮断する。



### なんのために正規化をするのか？

BatchNormは層ごとの分布の変動を抑えて学習を安定化させるための正規化手法。

ある層の出力分布が偏ると、その出力を入力として受け取る次の層では入力スケールが変化し、結果として勾配のスケール(大きさ)が不安定になる。

例えば、A層では急な勾配だったが、次のB層では緩やかな勾配になってしまい、結果として勾配降下する際の更新量が大きくなったり小さくなったりする。

この層ごとの分布の変動を抑えるために事前にBatchNormを行っておく。

BatchNormにより勾配の大きさはほぼ均一になり、結果的に更新量の振れ幅が小さくて済む。

### なんのためにマスクをするのか？

そもそもマスクの方法や状況にも種類があり、一概になんのためにマスクをするとは言えない。

代表的なマスクを並べる

- 数値的安定化(Attentionなど) のマスク
    - softmaxの前に対象のlogit に -∞ を入れる。
- Paddingマスク
    - 長さの違う文を揃えるため仕込まれたPADを除外する。これにより計算させない。
- 損失関数 のマスク
    - loss_fn = nn.CrossEntropyLoss(ignore_index=pad_token_id) でPADを損失に含めないようにする。これにより学習させない。
- Dropout のマスク
    - ランダムにニューロンを無効化する。


|用途|目的|
|---------|----------|
|Attentionマスク|見てはいけない情報を遮断（未来・PADなど）|
|Paddingマスク|無意味な入力をモデル計算から除外|
|Lossマスク|学習対象から除外|
|Dropoutマスク|ランダム無効化による正則化|


