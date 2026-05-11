---
title: "AI実装検定S級の模擬試験"
date: 2026-05-11T17:28:49+09:00
lastmod: 2026-05-11T17:28:49+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "AI開発","python","pytorch","keras" ]
---


## ■ CNN（30問）

1. VGGに関する記述として正しいものはどれか

A. 畳み込みカーネルは主に7×7を使用
B. 畳み込みカーネルは主に3×3を積み重ねる
C. Residual接続を持つ
D. Depthwise Separable Convを使用

2. KerasでVGG風のブロックを作る際に適切なのはどれか

A. Conv2D → BatchNorm → ReLU → MaxPool
B. Dense → Conv2D → Dropout
C. Conv1D → Flatten → LSTM
D. GlobalAveragePooling → Conv2D

3. VGGの欠点として適切なのはどれか

A. 表現力が低い
B. パラメータ数が多い
C. 勾配消失が発生しない
D. 軽量モデルである

4. GoogLeNetのInceptionモジュールの目的はどれか

A. モデルの単純化
B. 複数スケール特徴の同時抽出
C. 勾配消失の防止
D. チャネル削減のみ

5. Inceptionモジュールで1×1 Convを使う主目的はどれか

A. 空間解像度を上げる
B. チャネル数削減
C. 活性化関数の代替
D. プーリングの代替

6. PyTorchでInception風分岐を作る際に使うのはどれか

A. nn.Sequential
B. nn.ModuleList / 並列処理
C. nn.Linear
D. nn.RNN

7. ResNetの核心的アイデアはどれか

A. Attention
B. Skip Connection
C. Pooling除去
D. Transformer化

8. 残差ブロックの数式として正しいものはどれか

A. y = F(x)
B. y = x * F(x)
C. y = x + F(x)
D. y = F(F(x))

9. ResNetで勾配消失が軽減される理由はどれか

A. 活性化関数がないため
B. 勾配が直接伝播する経路がある
C. BatchNormを使わないため
D. 学習率が小さいため

10. WideResNetの特徴はどれか

A. 層を深くする
B. 層を浅くして幅を広げる
C. Attentionを導入
D. RNNと組み合わせる

11. MobileNetの特徴はどれか

A. Dense接続
B. Depthwise Separable Convolution
C. Residual接続
D. LSTM併用

12. Depthwise Separable Convの構成はどれか

A. Conv → Conv
B. Depthwise → Pointwise
C. Pool → Conv
D. Conv → RNN

13. PyTorchでDepthwise Convを実装する際のポイントはどれか

A. groups=1
B. groups=in_channels
C. kernel_size=1
D. stride=0

14. MobileNetで計算量削減される理由はどれか

A. パラメータ共有
B. 畳み込み分解
C. Attention
D. ReLU削除

15. DenseNetの特徴はどれか

A. 各層が前の全層と接続
B. Skip接続なし
C. CNNとRNN混合
D. Transformerベース

16. DenseNetの利点はどれか

A. 勾配消失の悪化
B. 特徴再利用
C. 計算量増加のみ
D. 過学習増大

17. DenseBlockでの入力はどうなるか

A. 前層のみ
B. 全過去層のconcat
C. 平均値
D. 最大値

18. EfficientNetの特徴はどれか

A. 深さのみ調整
B. 幅のみ調整
C. Compound Scaling
D. Attentionのみ

19. Compound Scalingで調整するのはどれか

A. depthのみ
B. widthのみ
C. resolutionのみ
D. depth・width・resolution

20. EfficientNetで使われるブロックはどれか

A. BasicBlock
B. MBConv
C. LSTMBlock
D. TransformerBlock

21. MBConvの特徴はどれか

A. Conv削除
B. Expand → Depthwise → Project
C. RNN構造
D. Attention

22. KerasでGlobalAveragePooling2Dの役割はどれか

A. 特徴マップ圧縮
B. 畳み込み代替
C. 勾配計算
D. 正規化

23. CNNでBatchNormを入れる位置として一般的なのはどれか

A. Conv前
B. Conv後
C. Pool後のみ
D. Dense前のみ

24. Dropoutの目的はどれか

A. 勾配増加
B. 過学習防止
C. 計算高速化
D. 精度低下

25. Conv2Dのpadding='same'の意味はどれか

A. 出力サイズ維持
B. チャネル維持
C. 重み共有
D. stride固定

26. strideを大きくするとどうなるか

A. 解像度増加
B. 解像度減少
C. チャネル増加
D. 勾配増加

27. PyTorchで活性化関数ReLUを指定する方法はどれか

A. nn.relu
B. nn.ReLU()
C. relu()
D. torch.relu only

28. Flattenの役割はどれか

A. 次元削減
B. ベクトル化
C. 正規化
D. 活性化

29. poolingの役割はどれか

A. 特徴抽出
B. 空間圧縮
C. チャネル増加
D. 勾配強化

30. CNNでoverfitting対策として適切なのはどれか

A. 層を増やす
B. データ拡張
C. 学習率増加
D. epoch増加

## ■ NLP（20問）


31. Word2Vec(skip-gram)の目的はどれか

A. 文生成
B. 周辺単語予測
C. 文分類
D. 翻訳

32. skip-gramの入力と出力はどれか

A. 文→文
B. 中心語→周辺語
C. 周辺語→中心語
D. 文→単語

33. Word2Vecで使われる最適化手法はどれか

A. Attention
B. Negative Sampling
C. Residual
D. Dropout

34. Embedding層の役割はどれか

A. 正規化
B. 単語をベクトル化
C. 勾配計算
D. softmax代替

35. seq2seqの構成はどれか

A. CNNのみ
B. Encoder-Decoder
C. Transformerのみ
D. Denseのみ

36. seq2seqでEncoderの役割はどれか

A. 出力生成
B. 文をベクトル化
C. softmax
D. attention計算

37. seq2seqでTeacher Forcingとはどれか

A. ランダム入力
B. 正解を次入力に使う
C. 勾配固定
D. Attention無効

38. HREDの特徴はどれか

A. 単文処理
B. 階層的構造（文＋対話）
C. CNN構造
D. Attentionなし

39. HREDの3層構造はどれか

A. word / sentence / context
B. conv / dense / rnn
C. encoder / cnn / decoder
D. token / feature / label

40. Transformerの特徴はどれか

A. RNN必須
B. CNNのみ
C. Attentionのみで処理
D. 畳み込み併用

41. Self-Attentionの役割はどれか

A. 外部情報取得
B. 同一系列内依存関係
C. 翻訳専用
D. embedding生成

42. Q, K, Vの役割として正しいのはどれか

A. Q=入力, K=出力
B. Q=検索, K=キー, V=値
C. Q=値, K=検索
D. 全て同じ

43. Attentionの計算で使われるのはどれか

A. 加算
B. 内積
C. 最大値
D. 平均

44. Transformerで位置情報を与える方法はどれか

A. Dropout
B. Positional Encoding
C. Pooling
D. Residual

45. Multi-Head Attentionの目的はどれか

A. 計算削減
B. 多様な関係性の学習
C. 勾配消失防止
D. 正規化

46. PyTorchでTransformerを使う場合のクラスはどれか

A. nn.Conv2d
B. nn.Transformer
C. nn.LSTMCell
D. nn.Linear

47. softmaxの役割はどれか

A. 正規化（確率化）
B. 次元削減
C. 活性化除去
D. attention削除

48. クロスエントロピー損失の用途はどれか

A. 回帰
B. 分類
C. clustering
D. 強化学習

49. Transformerの残差接続の目的はどれか

A. 精度低下
B. 勾配伝播改善
C. 計算削減
D. ノイズ追加

50. LayerNormの役割はどれか

A. 勾配消失
B. 正規化
C. pooling
D. attention



## 回答

1:B  2:A  3:B  4:B  5:B
6:B  7:B  8:C  9:B  10:B
11:B 12:B 13:B 14:B 15:A
16:B 17:B 18:C 19:D 20:B
21:B 22:A 23:B 24:B 25:A
26:B 27:B 28:B 29:B 30:B

31:B 32:B 33:B 34:B 35:B
36:B 37:B 38:B 39:A 40:C
41:B 42:B 43:B 44:B 45:B
46:B 47:A 48:B 49:B 50:B



## 私の回答+解説

### 総評

14番以外正答。正解率98%。だが、ところどころ理解が浅い箇所がある。

### 内容

1: B VGGは3x3の畳み込みを重ねたシンプル構造。全結合3層と畳み込み3x3を13層重ねたVGG16などがある。

2: A 畳み込みを行ったあと各要素をReLUで活性化、マックスプールを行うのが基本。BatchNormは論文にはなかったのでKerasオリジナルかと思われる。LSTMはRNNのNLPなどで使用されており、VGGでは使用されない。GAPはGoogLeNetで使用される。これにより巨大な全結合がなくなり、パラメータ数は1億3千万から700万になる。BはDenseが全結合なので、順序が逆ではないか？

3: B 巨大な全結合があるため、1億3千万ものパラメーターを計算しなければならない。パラメータ数はかなり多いため、表現力が低いとは言えない。勾配消失は発生し得る。後発のGoogLeNetやMobileNetなどと比べると軽量とは言えない。

4: B 1x1 3x3 5x5 の異なるサイズの畳み込みを行うことで、より多様な特徴抽出が可能になっている。特に1x1はチャンネル数の削減(圧縮)を行うことで計算コストを減らしている。これらの畳み込みを行ったあと、チャンネル方向に結合するのがGoogLeNet

5: B 前問の解説の通り。

6: B 消去法で選択。RNNは違う。Linearは線形に変換をするためのものでありInceptionでは使用しないかと。SequentialはKerasのAPIでは？

7: B Skip Connection またの名を残差接続、スキップ接続などと言われている。入力値を後続の層に引き渡すため、層で計算した結果の残差に入力値を加算して、後続の層に引き渡す。

8: C 計算式の英字部分を忘れてしまったが、足し算を使用するという点に注目すれば回答できる。残差にはHが使用されていたかと思うが気のせいだろうか？

9: B 消去法で選択。勾配が直接伝播する経路の名前を忘れた。補助分類器(auxi...) だったかと思うが、これはGoogLeNetの仕様ではないか？

10: B WideResNetの名前の通り、層を浅くして幅を広げることで精度を高めようと試みた。が、単純に層を深くすれば良い、幅を広げれば良いという問題ではない。幅・深さ・解像度の3点を適度にスケールすることが精度の向上に効率的に貢献できる。その点が後続のMobileNetやEfficientNetに活用されている。

11: B MobileNet から畳み込み時にDepthwise が使用されている。これは空間方向にのみ畳み込みを行い、チャンネル方向への混合を行わない。これにより計算コストを減らしている。特にMobileNetV2ではPointwise (1x1畳み込み)によるチャンネル方向の拡大縮小を行い、depthwise と組み合わせている。

12: B 前問の解説の通り。

13: B うろ覚えだが、groups を使用したかと思う。チャンネル方向の混合は行わず、空間方向にのみ畳み込みを行うためin_channels かと。Cは1x1畳み込みのPointwiseなので誤り。

14: D 確かKeras では、MobileNetからReLU 6 が採用されたかと思う。6以上の場合6にクリッピングを行うことにより勾配爆発を防ぐことができる。更に後発のMobileNetではh-swishが採用された。が、これは計算量削減になるかと言われると微妙。DenseNetで使用されていたAの可能性も。

→ 誤り、正解はBの畳み込み分解。計算量削減の本質はDepthwise Separableにある。


15: A 密結合を採用している。接続という表現ではなく、結合が適切かと。またBのSkip接続(ResNetの残差接続と同義？)を使用していないという点も正解ではないか？

16: B いずれも利点ではないため回答は容易であるが、結合を行うことにより前の特徴を再利用できるという利点がある。

17: B 

18: C Compound Scalingは幅・深さ・解像度をスケールするための物

19: D

20: B 初期のEfficientNetV1 ではMBConvもなく、EfficientNetV2からMBConvが用意され、FusedMBConvが作られた。前者はMobileNet でも使用されたdepthwise とpointwise による特徴抽出。FusedMBConvは抽出した特徴をもとに通常の畳み込みを行う。確か、最初の数回は計算コストが高くなってしまうためFusedMBConvのみ行い、あとからMBConvも加えて計算を行う方法もあった。

21: B 1x1でチャンネル方向を広げ、depthwise で空間方向にのみ畳み込み(チャンネル方向に混合しない)、最後の1x1畳み込みでチャンネル数をもとに戻している。ただ、この最後の1x1でチャンネル数をもとに戻すとき、SE層(squeeze and exitantion ？)により、チャンネルごとに重要度を取り決めている。これにより重要なチャンネルだけ残してチャンネル数をもとに戻せる。

→ Squeeze-and-Excitation (SE) である。


22: A GlobalAveragePooling2D はGoogLeNetなどで使用されている平均プーリング層。

23: B 畳み込みの後にバッチ正規化を行い、活性化関数ReLU仕様時のDying ReLU、勾配爆発のリスクを下げる。

→ バッチ正規化の主目的は分布の安定化と学習高速化であり、DyingReLUは副次的なもの

24: B 不必要な重みを削除することで過学習の防止を図っている。

→ Dropoutはニューロンをランダムに無効化するのであり、重みの削除ではない。

25: A padding を same にすることで畳み込み時のサイズを縮小させないようにしている。

26: B ずらすときの数値を大きくするため、畳み込みにより空間サイズは縮小する。

27: B

28: B Keras の1次元ベクトル化用のメソッドだったかと。

29: B 空間を圧縮する。最大プーリングと平均プーリングの2つがある。

30: B overfitting (過学習)対策として、いたずらに層を増やしたり、エポック数を増やしたりするものではない。学習率の増加は勾配降下時の揺れが大きくなるため収束が遅くなる。


31: B skip-gram は1つの単語から周辺単語を予測する。

32: B 中心語から周辺語である。CはCBOW。

33: B Softmax関数を使用する場合、計算コストが増大していくため、Sigmoid関数による二値分類を使ったNegativeSamplingを使用する。ただ、これが最適化手法と言えるのかはあやふやである。

→ 厳密には損失近似手法(softmax近似)であり、最適化手法とは言えない。

34: B 語彙表を使い単語のベクトル化を行うことがEmbeddingの役割。その前のTokenizerは文章をトークン化し、トークンIDを割り振りすることでEmbeddingへ引き渡している。

35: B seq2seqはRNN(LSTM/GRU)を部品として使用したNLPのモデル。主に翻訳を行うことができる。入力を解析するEncoderと文章生成を行うDecoderの2つに役割分担している。

36: B 先の説明通り。必ずしもAttentionが使われているとは限らないためDは除外した。

37: B Teacher Forcingの意味から推測。

38: B 階層的構造により、直近だけでなく、前の発話内容も考慮しての返答が可能。

39: A 文Encoder 単語Encoder Decoderの3つで構成されていたかと。

→ 違う。 Encoderに限ると、Word Encoder, Sentense Encoder, Context Encoder の3つ。

40: C Attentionのみと言うと語弊があるのではないでしょうか？とはいえ畳み込みとRNNは使われていないのでは？

→ そのとおり、Attentionをベースにして作っているという解釈が正しいかと。

41: B 

42: B Attentionの仕組み。Queryに対してのKeyで重みを計算。Vと重みを合成してAttentionを行う。

43: B QueryとKeyの内積を使う。

44: B 消去法で選択。Residualの意味も忘れてしまった。 

→ Residualは残差。

45: B

46: B

47: A

48: B クロスエントロピー誤差は分類問題の損失関数である。pytorchではsoftmax と組み合わせて1行で呼び出しできる。

→ nn.CrossEntropyLoss = LogSoftmax + NLLLoss

49: B Transformerに残差接続があるのですか？

→ ある。

```
x → Attention → Add & Norm
  → FFN → Add & Norm
```

50: B LayerNormの意味を忘れてしまった。

→ CNNではバッチ方向で正規化を行うBatchNormに対して、

NLPのLayerNormは特徴次元方向で正規化を行っている。


