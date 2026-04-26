---
title: "CNNとNLPの問題"
date: 2026-04-26T17:09:19+09:00
lastmod: 2026-04-26T17:09:19+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "AI開発","NLP","CNN" ]
---



## 試験範囲

- CNN : VGG,GoogLeNet,ResNet(WideResNet),MobileNet,DenseNet,EfficientNet
- NLP : Word2Vec(skip-gram),seq2seq,HRED,Transformer 

## 問題

間違えている箇所は → で解答を表示。

### 1. VGG

#### Q1: VGG16において、すべての畳み込み層で 3×3 カーネルが採用されている理由として適切なものは？

空間方向・チャンネル方向双方に畳み込みを行い、層を増やすため。5x5では特徴量がぼやけてしまい、1x1では空間方向の特徴抽出が難しいため。


#### Q2: PyTorchの models.vgg16 において、特徴抽出部分の最後にある nn.AdaptiveAvgPool2d((7, 7)) の役割は？

7x7で平均プーリングを行い、全結合の負担を軽減する。しかしそれでも全結合層が巨大すぎるため、パラメータ数が多く、計算コストが非常に高い。


#### Q3: KerasでVGGを実装する際、全結合層の前に置く、多次元テンソルを1次元に変換するレイヤー名は？

わかりません。が、pytorchでは線形にするLinear だったかと思います。Kerasにも似たような名前であるのでしょうか？

→ Flatten 。Pytorchのview やreshape に相当する。


### 2. GoogLeNet (Inception)

#### Q4: Inceptionモジュールにおいて、計算量を削減するために 3×3 や 5×5 畳み込みの前に入れられる処理は？

1x1畳み込みですね。

#### Q5: GoogLeNetで導入された、勾配消失を防ぐためにネットワークの途中から分岐させた出力層の名称は？

ボトルネック層ではないでしょうか？

→ Auxiliary Classifier (補助分類器)


#### Q6: 1×1 畳み込みが「ボトルネック層」と呼ばれる理由を「チャンネル」という言葉を使って説明せよ。

チャンネル方向に対しての結合を行い、後続の畳み込みのコストを削減しているため


### 3. ResNet / WideResNet

#### Q7: ResNetの基本単位であるResidual Blockにおいて、入力 x を出力に直接足し合わせる経路を何と呼ぶか？

わかりません。が、ResNetは入力値をそのまま計算に利用できるようにするため足し算を使用しています。関数のバイアスのようなものなので、バイアス経路などと言った名前でしょうか？

→ Shortcut Connection（またはスキップ接続）


#### Q8: PyTorchの実装において、入力と出力のチャンネル数が異なる場合に Shortcut 側で行う演算は？

わかりません。

→ チャンネル数が違うと足し算ができないため、Shortcut側にも 1x1畳み込み を適用してサイズを合わせます。


#### Q9: WideResNetが通常のResNetに対して、「深さ」ではなく何を増やすことで性能向上を図っているか？

幅を増やして性能向上を行っています。

チャンネル数を増やし、パラメータ数を増やすことでハードウェア性能をフル活用してでも性能向上を図っています。


### 4. MobileNet

#### Q10: 添付の例題にあった Depthwise Separable Convolution を、通常の畳み込みと比較した際の計算量の削減率は？（カーネルサイズ K×K とする）


削減率まではわかりません。が、チャンネル方向に対しての混合は行われないため、計算量はKの二乗でしょうか？

→ おおよそ 1/9（3x3の場合）と覚えればOKです。


#### Q11: MobileNet V2 で導入された、中間層でチャンネル数を増やし、出力で減らす構造の名称は？

InvertedResidual でしょうか？


#### Q12: Kerasの DepthwiseConv2D レイヤーにおいて、1つの入力チャンネルに対して適用するフィルタ数を指定する引数名は？

Keras不勉強のためわかりません。

が、Depthwise は空間方向に対してのみの3x3畳み込みのため、特にあえて引数を指定できる要素がないようにも思えます。

→ depth_multiplier です。1つの入力からいくつ出力を作るか（通常は1）を決めます。


### 5. DenseNet / EfficientNet

#### Q13: DenseNetにおいて、前の層の出力を後の層に「足し算」ではなく「何」することで結合するか？

結合をすることで、前の層の出力を後続に引き渡している。pytorchではリストにappendしている。だがこれによりメモリ消費量が増え、計算量も増えてしまう。DenseNetはハードウェア性能をフル活用してでも精度の向上を図っています。が、手軽さで優れているResNetよりも普及しませんでした。


→ 足し算ではなく Concat (連結) です。チャンネルを後ろにどんどん繋げるため、メモリを消費します。

#### Q14: EfficientNetの「Compound Scaling」が最適化する3つの要素は、解像度、深さと、あと一つは何か？

幅。EfficientNetはこれまでの単純に層を増やしたり幅を広げたりするのではなく、学習するデータに応じて最適な解像度、深さ、幅で学習を行っている。


#### Q15: DenseNetの各ブロック間でチャンネル数を圧縮する役割を持つ層の名称は？

わかりません。が、1x1畳み込みを使っているのでしょうか？だとしたらpointwise でしょうか？

→ Transition Layer (遷移層) と呼びます。


### 1. Word2Vec (Skip-gram)

#### Q16: Skip-gramモデルにおいて、入力となるのは「ターゲット単語」か「周囲の単語」か？

Skip-gramはターゲット単語を入力し、周囲の単語を予測します。よって「ターゲット単語」ですね。


#### Q17: Word2Vecの学習において、計算量を減らすためにソフトマックス関数の代わりによく使われる手法は？

Sigmoid関数だったかと思います。

そのSigmoid関数を使って、答えになる単語がなんであるかを予測していたかと思います。
しかし、これでは全部YESもしくはNOと答えればかんたんに正解率を上げることができるため、それを阻止するために偽物の選択肢を用意して、間違えたら損失を大きめに評価するなどしていたかと思います。


→ Negative Sampling です。偽物（負例）を用意して学習効率を上げる手法です。


#### Q18: PyTorchの nn.Embedding レイヤーにおいて、単語IDをベクトルに変換する際の重み行列のサイズはどう定義されるか？

文章内の単語の数によって定義されるかと思います。

→ (語彙数, 分散表現の次元数) です。

### 2. seq2seq / HRED

#### Q19: seq2seqにおいて、Encoderの最後の隠れ状態 h を何と呼ぶか？

わかりません。

→ Context Vector (文脈ベクトル)。

#### Q20: HRED (Hierarchical Recurrent Encoder-Decoder) が、通常のseq2seqに加えて導入した3つ目のRNNの名称は？

文単位のEncoderとDecoderに続き、コンテキスト単位のEncoderが追加されたと思います。


#### Q21: seq2seqのDecoderにおいて、学習時のみ「正解ラベル」を次の時刻の入力として使う手法を何と呼ぶか？

LSTMでしょうか？

→ Teacher Forcing (教師強制)。


### 3. Transformer

#### Q22: Transformerにおいて、RNNを使わずに単語の位置情報を付与するために加算されるベクトルは？

Self-Attentionですね。単語間の関連をRNNの左から右だけでなく、全方向から行うことができます。並列的に解釈されるため、文章が長くても難なく学習可能です。

→ 正解は Positional Encoding。Self-Attentionは「位置」を無視するため、サイン波などのベクトルを「足し算」して位置を教えます。

#### Q23: Multi-Head Attentionにおいて、Scaled Dot-Product Attentionの入力となる3つのベクトル（Q, K, V）の名称をすべて答えよ。

Query,Key,Value ですね。

Queryは検索キーワード、Keyは見出し、Valueは検索キーワードに紐づく情報です。


#### Q24: Transformerの計算において、次元 dk平方根で割る（スケーリングする）理由は、何の勾配が小さくなるのを防ぐためか？

わかりません。

→ Softmax の勾配です。値が大きすぎるとSoftmaxの勾配が極端に小さくなります。

#### Q25: PyTorchの nn.Transformer において、Decoderが未来の単語を見ないようにするために適用する処理は？

わかりません。

→　Masking (マスク)。未来の単語のスコアを −∞ にして見えないようにします。

#### Q26: 「Self-Attention」と「Source-Target Attention（Cross Attention）」の違いを、Q, K, Vの出所に着目して説明せよ。

わかりません。

→ QはDecoderから、KとVはEncoderから 来ます。

#### Q27: TransformerのEncoder内にある「Position-wise Feed-Forward Networks」の実装における、畳み込みサイズに相当する値はいくつか？

1x1でしょうか？pointwise という点だけでしかわかってはいませんが。


#### Q28: Layer Normalizationは、Batch Normalizationと異なり、どの方向に正規化を行うか？

BatchNormalizationとLayer Nomalizationの違いがわかりません。それぞれがどういったものなのか覚えていませんが、BatchNormalizationはCNNでもよく出てきたかと思います。

Layerなのでチャンネル方向でしょうか？とはいえNLPにチャンネルという概念はなかったかと思いますが。層でしょうか？

→ Batchは「データ間」を、Layerは 「単語ベクトル内（特徴量方向）」 を正規化します。


#### Q29: BERT（Transformerベース）の学習手法において、文章中の一部の単語を隠して予測させるタスクの名称は？

わかりません。

→ Masked Language Model (MLM)。

#### Q30: Keras 3でMulti-Head Attentionを実装する際、ヘッドの数（num_heads）を増やすと、モデル全体のパラメータ数はどう変化するか？

2乗分だけ増えるのでしょうか？わかりません。

→ 実は 「変化しない」 のが一般的です。ヘッドを増やす際、各ヘッドの次元を「全次元 ÷ ヘッド数」にするため、合計は変わりません。


## 確認するべき用語集

- ビームサーチ(HRED)
- プルーニング(VGG)
- MLM(BERT) 
- Layer Normalization vs Batch Normalization (CNN,NLP)
- Positional Encoding (Transformer) 



