---
title: "【箇条書き】CNNモデルの特徴まとめ"
date: 2026-05-04T10:35:49+09:00
lastmod: 2026-05-04T10:35:49+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "AI開発","pytorch","keras" ]
---

簡単にCNNモデルの特徴を確認できるよう、3行〜6行ほどでまとめる。

## VGG 

- VGG16は3x3畳み込みを13層、全結合層を3層重ねたシンプル構造
- 畳み込み後の全結合層の計算コストが非常に高い(パラメーター1億3千万)
- pytorchではオリジナルのVGGにはないバッチ正規化(Batch Normalization)が使用されている。(※勾配消失・爆発対策)


## GoogLeNet

- 1x1 3x3 5x5 の異なる畳込みを並列で行う(後にチャンネル方向に結合) Inceptionモジュールを採用
- VGGと違い、巨大な全結合ではなく、GlobalAveragePooling (GAP)をしてから全結合
- 結果、計算コストを大幅減(パラメーター700万) 
- 補助分類器(Auxiliary Classifier) を採用。中間層で予測を行い、その誤差を逆伝播させて勾配消失の抑止。

## ResNet

- 1x1 3x3 1x1 でチャンネル削減→畳み込み→チャンネル戻す。ボトルネック構造を採用
- 残差接続(Residual Connection、スキップ接続、ショートカット接続とも言う)を利用し、入力値に残差(この層の出力)を加算して次の層へ引き渡す
- チャンネル数が異なると足し算はできないため、事前に1x1畳み込みでチャンネル数を揃える
- 活性化関数は未だReLUを使用
- ResNet付近のモデルから、100層を超える構造になる

## MobileNet

- Depthwise で 各チャンネルを独立して空間方向のみ畳み込みできる
- Pointwise で α値に基づき1x1畳み込みで、チャンネル数の調整をしている。
- V2 ではインバーテッド残差構造を採用。1x1 3x3 1x1 で チャンネル増 → 空間方向のみ畳み込み → チャンネル戻 → 情報ロス防止のため線形出力。リニアボトルネック構造とも言う。
- V3 では チャンネルを戻す前にチャンネル重要度を取り決めるSE層を導入。必要なチャンネルだけ残す。
- 活性化関数として V1はReLU6、V3ではh-swish を使用。

## DenseNet

- DenseBlock(Dense Connection)により、入力値を結合によってロスなく引き継ぐことができる
- growth_rate (k) を使ってDenseBlockで増やすチャンネル数を調整する 
- Transition Layer により、増えすぎたチャンネルを削減する
- 特徴量を多く残せるが、層が増えるたびにメモリ消費大。
- 活性化関数にはReLUを使用

## EfficientNet

- Compound Scalling の採用。スケーリング係数(φ)を使い、解像度、幅、深さを B0~B7まで用意してスケール
- V1ではMobileNetV3とほぼ同じリニアボトルネック構造(インバーテッド残差構造)を採用。SE層も含む
- V2からMBConvとFusedMBConvの2つを採用
- MBConvはpointwiseとdepthwiseで重要とされる特徴を抽出
- FusedMBConv は通常の3x3畳み込みで重要な特徴の計算
- V1〜V2まで活性化関数はswish(SiLU)を使用。


