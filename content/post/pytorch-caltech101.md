---
title: "【pytorch】caltech-101 を使ってCNNモデルの歴史を辿る【VGG16からEfficientNetまで】"
date: 2026-04-12T11:56:03+09:00
lastmod: 2026-04-12T11:56:03+09:00
draft: false
thumbnail: "images/pytorch.jpg"
categories: [ "others" ]
tags: [ "AI開発","pytorch","python" ]
---

## 備考

- caltech-101 の中にはモノクロ画像(チャンネル数1)が混ざっているため、前処理でチャンネル数を3に変換する。
- 学習済みのモデルを使用して、学習をさせる
- GPUはA2000 12GBを使用する
- 今回はあくまでもモデルごとの違いをコードを通じて体感することが目的。パラメータが最適であるかは不問。

### requirements.txt

```
cuda-bindings==13.2.0
cuda-pathfinder==1.5.2
cuda-toolkit==13.0.2
filelock==3.25.2
fsspec==2026.3.0
Jinja2==3.1.6
MarkupSafe==3.0.3
mpmath==1.3.0
networkx==3.4.2
numpy==2.2.6
nvidia-cublas==13.1.0.3
nvidia-cuda-cupti==13.0.85
nvidia-cuda-nvrtc==13.0.88
nvidia-cuda-runtime==13.0.96
nvidia-cudnn-cu13==9.19.0.56
nvidia-cufft==12.0.0.61
nvidia-cufile==1.15.1.6
nvidia-curand==10.4.0.35
nvidia-cusolver==12.0.4.66
nvidia-cusparse==12.6.3.3
nvidia-cusparselt-cu13==0.8.0
nvidia-nccl-cu13==2.28.9
nvidia-nvjitlink==13.0.88
nvidia-nvshmem-cu13==3.4.5
nvidia-nvtx==13.0.85
pillow==12.2.0
scipy==1.15.3
sympy==1.14.0
torch==2.11.0
torchvision==0.26.0
triton==3.6.0
typing_extensions==4.15.0
```

## VGG16

VGG16 は3x3 畳み込みをとにかく深くして、単純にすることを目的としたモデル。

全結合時のパラメータが非常に多い(1億3800万以上)ため、GPUメモリを多く消費する。

演算量も多いため、リアルタイム処理や性能が限定された状況には不向き。

### ソースコード

```
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, random_split

import torch.nn.functional as F

# エポック数を指定
epochs = 10
lr = 1e-3
batch_size = 32

# 1. 前処理の設定 (VGGの入力サイズ 224x224 に合わせる)
transform = transforms.Compose([
    # リサイズ
    transforms.Resize((224, 224)),

    # caltech 内にチャンネル数1のデータが混ざっているため、[3,224,224] に変換
    transforms.Lambda(lambda x: x.convert('RGB')),

    # PILからテンソルへ変換
    transforms.ToTensor(),

    # 平均化と標準化
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# 2. データセットのロード
# ※ Caltech101はdownload=Trueでもgdown等が必要な場合があります
dataset = datasets.Caltech101(root='./data', download=True, transform=transform)

# 学習用と検証用に分割 (8:2)
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

# バッチサイズを指定してローダーを作る
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

# 3. VGG16モデルの構築 (事前学習済みモデルを使用)
model = models.vgg16(weights=models.VGG16_Weights.IMAGENET1K_V1)

# 出力層(1000クラス)をCaltech101(101クラス)に適合させる
# 最後の全結合層の入力ユニット数は 4096
# 層数が変わっても最後の層を指定するため-1を指定。
num_ftrs = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(num_ftrs, 101) 

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# 4. 損失関数(Softmax関数+クロスエントロピー誤差)と最適化手法(Adam)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=lr)

# 5. 学習ループ 
model.train()
for epoch in range(epochs):
    running_loss = 0.0

    for inputs, labels in train_loader:
        # バッチサイズ分のデータをデバイスへ
        inputs = inputs.to(device)
        labels = labels.to(device)
        
        # 勾配を初期化
        optimizer.zero_grad()

        # 順伝播
        outputs = model(inputs)

        # 損失を求める
        loss = criterion(outputs, labels)

        # 誤差逆伝播法
        loss.backward()

        # 誤差修正
        optimizer.step()

        running_loss += loss.item()

    # 1 epoch 完了時点の損失の計算。
    print(f'Epoch: {epoch + 1} | loss: {running_loss / len(train_loader):.3f}')

print("Training finished.")

correct = 0
total = 0

# すべてのバッチを推論する
model.eval()
with torch.no_grad():
    for inputs, labels in val_loader:

        # バッチサイズ分のデータをデバイスへ
        inputs = inputs.to(device)
        labels = labels.to(device)

        # (バッチサイズ,チャンネル,高さ,幅) 
        output = model(inputs)

        # 1. ロジットをSoftmaxに通して確率（0.0〜1.0）に変換
        probs = F.softmax(output, dim=1)

        # 2. 確率の最大値とそのインデックスを取得
        per, predicts = torch.max(probs, 1)

        predicts = torch.max(output, 1)[1]
        total += labels.size(0)
        correct += (predicts == labels).sum().item()

print(f'Accuracy: {100 * correct / total:.2f}%')
```


## 結果

10エポックで学習の効果は得られているものの、正解率は実用には程遠い。
更に学習にかかった時間はA2000 12GBでも35分。温度は90度を超える。VRAM消費量は6GB以上。

```
Epoch: 1 | loss: 3.903
Epoch: 2 | loss: 2.924
Epoch: 3 | loss: 2.445
Epoch: 4 | loss: 2.076
Epoch: 5 | loss: 1.727
Epoch: 6 | loss: 1.457
Epoch: 7 | loss: 1.183
Epoch: 8 | loss: 0.977
Epoch: 9 | loss: 0.769
Epoch: 10 | loss: 0.556
Training finished.
Accuracy: 63.48%
```

ちなみに、1エポックでの正解率は18%ほどと、これだけでもランダム(101パターンなので1%以下)よりはマシというレベルではあるが、やはり実用的とは言い難い。

```
Training finished.
Accuracy: 18.84%
```


以下、動作中のGPU

```
Sun Apr 12 11:30:09 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 79%   90C    P2             63W /   70W |    7535MiB /  12282MiB |    100%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      308MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                     71MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                356MiB |
|    0   N/A  N/A           14252      G   /snap/vlc/3777/usr/bin/vlc               38MiB |
|    0   N/A  N/A           22509      C   python3                                6636MiB |
+-----------------------------------------------------------------------------------------+

```


ここから、並列的に学習を進めるGoogLeNetへ移行する。

## GoogLeNet

VGGが単純に深くするのに対して、GoogLeNetはネットワークの横幅を広げて効率を高めている。

GoogLeNetは1x1 3x3 5x5 の畳み込みを並列的に処理をすることで、計算量・メモリ消費量を削減している。

1x1 畳み込みは次元数の削減を行っている。「次元」は画像認識における「視点」に貢献するが、1x1畳み込みでは不必要な視点を削減している。

更に、VGGの処理時間を増やしていた全結合層を廃止し、特徴マップの平均(グローバル平均プーリング層 (GAP) )を取る手法に変更。

パラメータ数も大幅に削減された。VGG1億3千万に対して、GoogLeNetは700万。

層数は22層と、VGGよりも増えている。

### ソースコード



```
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, random_split

import torch.nn.functional as F

# エポック数を指定
epochs = 10
lr = 1e-3
batch_size = 32

# 前処理の設定 (VGGの入力サイズ 224x224 に合わせる)
transform = transforms.Compose([
    # リサイズ
    transforms.Resize((224, 224)),

    # caltech 内にチャンネル数1のデータが混ざっているため、[3,224,224] に変換
    transforms.Lambda(lambda x: x.convert('RGB')),

    # PILからテンソルへ変換
    transforms.ToTensor(),

    # 平均化と標準化
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# データセットのロード
# ※ Caltech101はdownload=Trueでもgdown等が必要な場合があります
dataset = datasets.Caltech101(root='./data', download=True, transform=transform)

# 学習用と検証用に分割 (8:2)
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

# バッチサイズを指定してローダーを作る
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

# GoogLeNetモデルの構築
model = models.googlenet(weights=models.GoogLeNet_Weights.IMAGENET1K_V1)

# 出力層(1000クラス)をCaltech101(101クラス)に適合させる
# GoogLeNetの最終層は 'fc' ( VGGは 'classifier' )
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 101)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# 損失関数(Softmax関数+クロスエントロピー誤差)と最適化手法(Adam)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=lr)

# 学習ループ 
model.train()
for epoch in range(epochs):
    running_loss = 0.0

    for inputs, labels in train_loader:
        # バッチサイズ分のデータをデバイスへ
        inputs = inputs.to(device)
        labels = labels.to(device)
        
        # 勾配を初期化
        optimizer.zero_grad()

        # 順伝播
        outputs = model(inputs)

        # 損失を求める
        loss = criterion(outputs, labels)

        # 誤差逆伝播法
        loss.backward()

        # 誤差修正
        optimizer.step()


        running_loss += loss.item()


    # 1 epoch 完了時点の損失の計算。
    print(f'Epoch: {epoch + 1} | loss: {running_loss / len(train_loader):.3f}')


print("Training finished.")

correct = 0
total = 0

# すべてのバッチを推論する
model.eval()
with torch.no_grad():
    for inputs, labels in val_loader:

        # バッチサイズ分のデータをデバイスへ
        inputs = inputs.to(device)
        labels = labels.to(device)

        # (バッチサイズ,チャンネル,高さ,幅) 
        output = model(inputs)

        # ロジットをSoftmaxに通して確率（0.0〜1.0）に変換
        probs = F.softmax(output, dim=1)

        # 確率の最大値とそのインデックスを取得
        per, predicts = torch.max(probs, 1)

        predicts = torch.max(output, 1)[1]
        total += labels.size(0)
        correct += (predicts == labels).sum().item()

print(f'Accuracy: {100 * correct / total:.2f}%')
```

VGGとの差分は以下の通り

```
# GoogLeNetモデルの構築
model = models.googlenet(weights=models.GoogLeNet_Weights.IMAGENET1K_V1)

# 出力層(1000クラス)をCaltech101(101クラス)に適合させる
# GoogLeNetの最終層は 'fc' ( VGGは 'classifier' )
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 101)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
```

### 結果

5分で終了。結果は以下の通り。

```
Epoch: 1 | loss: 1.457
Epoch: 2 | loss: 0.466
Epoch: 3 | loss: 0.296
Epoch: 4 | loss: 0.190
Epoch: 5 | loss: 0.154
Epoch: 6 | loss: 0.172
Epoch: 7 | loss: 0.123
Epoch: 8 | loss: 0.071
Epoch: 9 | loss: 0.085
Epoch: 10 | loss: 0.102
Training finished.
Accuracy: 89.52%
```

正解率は89%、もう少しほしいところだが、これでも十分実用に耐えられるレベルである。

学習に使用しているVRAMは2GBほどと、VGGより高効率であることが伺える。

```
Sun Apr 12 12:39:05 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 30%   64C    P2             61W /   70W |    3065MiB /  12282MiB |     55%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      316MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                     84MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                342MiB |
|    0   N/A  N/A           14252      G   /snap/vlc/3777/usr/bin/vlc               38MiB |
|    0   N/A  N/A           29123      C   python3                                2150MiB |
+-----------------------------------------------------------------------------------------+

```

なお学習が進むにつれGPU使用率は上がっている模様
```
Sun Apr 12 12:43:02 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 68%   90C    P2             63W /   70W |    3033MiB /  12282MiB |     77%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      316MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                     84MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                342MiB |
|    0   N/A  N/A           14252      G   /snap/vlc/3777/usr/bin/vlc                6MiB |
|    0   N/A  N/A           29123      C   python3                                2150MiB |
+-----------------------------------------------------------------------------------------+
```

これでも十分実用に足るが、更に層数を増やしたResNetの違いを確かめてみる。

## ResNet50

ResNetは勾配消失問題を解決するため、スキップ結合を利用している。

これにより層数は152層に至る。

今回は中規模でバランスの取れたResNet50を利用した。


### ソースコード

差分のみ記す。

```
# ResNetモデルの構築
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# 出力層(1000クラス)をCaltech101(101クラス)に適合させる
# ResNetの最終層も 'fc'
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 101)
```

model部分だけ差し替えればOK


### 結果

学習にかかった時間は約10分。順調に損失は下がっていたが、最後に跳ねているため、正解率は84%付近で終わった。

```
Epoch: 1 | loss: 1.477
Epoch: 2 | loss: 0.443
Epoch: 3 | loss: 0.182
Epoch: 4 | loss: 0.124
Epoch: 5 | loss: 0.131
Epoch: 6 | loss: 0.099
Epoch: 7 | loss: 0.090
Epoch: 8 | loss: 0.056
Epoch: 9 | loss: 0.073
Epoch: 10 | loss: 0.072
Training finished.
Accuracy: 83.87%
```
正解率こそ低いが、GoogLeNetは6エポック時点で0.09、8エポック時点で0.056まで下げていないため、やはりこちらのほうが優秀ではないかとも思える。

スキップ結合の影響か、GoogLeNetよりかはVRAM消費量は増えている。

```
Sun Apr 12 13:01:56 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 31%   65C    P2             64W /   70W |    4335MiB /  12282MiB |     64%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      326MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                     88MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                346MiB |
|    0   N/A  N/A           14252      G   /snap/vlc/3777/usr/bin/vlc                6MiB |
|    0   N/A  N/A           30848      C   python3                                3434MiB |
+-----------------------------------------------------------------------------------------+
```


こちらも学習が進むにつれ、GPU使用率は上がっている。

```
Sun Apr 12 13:10:27 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 79%   89C    P2             63W /   70W |    4332MiB /  12282MiB |     51%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      326MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                     88MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                346MiB |
|    0   N/A  N/A           14252      G   /snap/vlc/3777/usr/bin/vlc                8MiB |
|    0   N/A  N/A           30848      C   python3                                3434MiB |
+-----------------------------------------------------------------------------------------+
```



## WideResNet

チャンネル数を増やすことで、少ない層でも精度を出せるようにしたモデル。


### ソースコード

```
# ResNet50と同じ深さで、幅（Width）を広げた WideResNet-50-2
model = models.wide_resnet50_2(weights=models.Wide_ResNet50_2_Weights.IMAGENET1K_V1)

# 最終層の名前は 'fc'
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 101)
```




### 結果

学習時間はおよそ20分ほど。

メモリ消費とGPU使用率が高く、精度はResNetに比べて良いとは言い難い。

```
Epoch: 1 | loss: 3.520
Epoch: 2 | loss: 2.815
Epoch: 3 | loss: 2.285
Epoch: 4 | loss: 1.891
Epoch: 5 | loss: 1.499
Epoch: 6 | loss: 1.198
Epoch: 7 | loss: 0.903
Epoch: 8 | loss: 0.664
Epoch: 9 | loss: 0.503
Epoch: 10 | loss: 0.373
Training finished.
Accuracy: 73.85%
```

損失こそ低くなっているが、正解率はResNetにも劣る。これは過学習状態ではないか？とも思われる。

そもそも、caltech101は1クラスあたりに50枚程度の画像しか用意されていない。

その状況下で安易に幅を広げる(チャンネル数、次元数)を増やすということは、無理をして特徴を探そうとしてしまい、結果的にノイズに振り回される構図になるのではないか？と考えている。

また、学習率が1e-3 では構造が複雑化しているWideResNetでは収束が困難になってくる。

損失こそ減っているが、今回は転移学習であるため1e-4 か1e-5あたりで試すべきなのかもしれない。

よって、

- 学習データ数が少ない状況下では、幅を安易に広げない
- 構造が複雑化しているモデルでは、学習率は小さめに調整をする

この2点が精度を向上させるためには良いのだろう。


GPUの使用率等は以下の通り。ResNetよりも消費が激しい。

```
Sun Apr 12 14:13:22 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 83%   91C    P2             66W /   70W |    5981MiB /  12282MiB |    100%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      326MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                    105MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                354MiB |
|    0   N/A  N/A           14252      G   /snap/vlc/3777/usr/bin/vlc               38MiB |
|    0   N/A  N/A           35724      C   python3                                5024MiB |
+-----------------------------------------------------------------------------------------+
```


#### 【補足】学習率を1e-4 で調整した結果

```
lr = 1e-4
```

で再挑戦。結果は以下の通り。

```
Epoch: 1 | loss: 1.286
Epoch: 2 | loss: 0.151
Epoch: 3 | loss: 0.067
Epoch: 4 | loss: 0.058
Epoch: 5 | loss: 0.067
Epoch: 6 | loss: 0.048
Epoch: 7 | loss: 0.060
Epoch: 8 | loss: 0.043
Epoch: 9 | loss: 0.043
Epoch: 10 | loss: 0.037
Training finished.
Accuracy: 94.35%
```

以上から、単純にモデルを最新のものにすれば良いというものでもなく、パラメータの指定も一定の影響があるということだ。

今回は転移学習、すでにある程度の学習を終えているわけなので、そこからの学習率は控えめにしておくほうが無難だ。

1クラスあたり50件程度と、データが少ないのであればなおさらそうだ。

ともあれ、このレベルの精度が出れば、十分実用に足ると思われる。

## DenseNet

DenseNetも勾配消失との戦いであり、各層の入力をすべての層に結合するモデルである。

ResNetと違い、入力をそのまま維持して最後まで利用することができる。

チャンネルの結合はDenseBlockを使用している。特徴量の再利用により、少ないパラメータで高い精度が出せる。

### ソースコード

最初から学習率は1e-4に変更している。

```
lr = 1e-4


# 中略

# DenseNet-121
model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)

# 最終層の名前は 'classifier' (VGGと同じタイプ)
num_ftrs = model.classifier.in_features
model.classifier = nn.Linear(num_ftrs, 101)
```

### 結果

20分程度で学習は終わった。精度はWideResNetよりも高いものになった。

```
Epoch: 1 | loss: 1.989
Epoch: 2 | loss: 0.459
Epoch: 3 | loss: 0.140
Epoch: 4 | loss: 0.057
Epoch: 5 | loss: 0.034
Epoch: 6 | loss: 0.022
Epoch: 7 | loss: 0.016
Epoch: 8 | loss: 0.011
Epoch: 9 | loss: 0.008
Epoch: 10 | loss: 0.010
Training finished.
Accuracy: 96.66%
```

何より、損失の下がり方が順等でブレがない。

メモリ消費はほぼ5GB、GPU使用率も80%を超えている。

```
Sun Apr 12 15:11:15 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 79%   91C    P2             65W /   70W |    5727MiB /  12282MiB |     97%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      315MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                    108MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                347MiB |
|    0   N/A  N/A           36467      G   /snap/vlc/3777/usr/bin/vlc               16MiB |
|    0   N/A  N/A           41862      C   python3                                4810MiB |
+-----------------------------------------------------------------------------------------+
```

## EfficientNet

EfficientNetは数式を使い、深さ、幅、解像度の3比率を調整して効率化している。

単純にとにかく深く、勾配消失を防いででも深くすれば良いという、これまでの考え方とは異なる。

これにより圧倒的なコストパフォーマンスを得ることができる。

EfficientNetにはB0〜B7まで用意されており、対応している解像度が異なる。

- B0 : 224
- B1 : 240
- B2 : 260
- B3 : 300
- B4 : 380
- B5 : 456
- B6 : 528
- B7 : 600

B4以降は、A2000 12GBを使ったとしても非常に時間がかかってしまうため、B3以下で行う。

また、今回他モデルでも224x224サイズで行っているため、B0を採用した。

### ソースコード

今回も、最初から学習率を1e-4 にしている。

```
lr = 1e-4


# 中略

# EfficientNet-B0 (最も軽量なベースモデル)
model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)

# 最終層の名前は 'classifier' の中の2番目の要素 [1]
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, 101)
```

### 結果

学習時間は10分ほど。結果は以下の通り。

```
Epoch: 1 | loss: 2.680
Epoch: 2 | loss: 0.761
Epoch: 3 | loss: 0.266
Epoch: 4 | loss: 0.138
Epoch: 5 | loss: 0.087
Epoch: 6 | loss: 0.058
Epoch: 7 | loss: 0.045
Epoch: 8 | loss: 0.029
Epoch: 9 | loss: 0.027
Epoch: 10 | loss: 0.022
Training finished.
Accuracy: 96.37%
```

こうしてみると、速度と精度を両立させたいのであれば、もはやEfficientNet一択とも思える。

あとはパラメータを最適化させていく。

VRAM消費は3GBほど。

```
Sun Apr 12 15:29:59 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.126.20             Driver Version: 580.126.20     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA RTX A2000 12GB          On  |   00000000:01:00.0  On |                  Off |
| 79%   89C    P2             61W /   70W |    4263MiB /  12282MiB |    100%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            2631      G   /usr/lib/xorg/Xorg                      315MiB |
|    0   N/A  N/A            2989      G   /usr/bin/gnome-shell                    110MiB |
|    0   N/A  N/A            8564      G   /usr/lib/firefox/firefox                326MiB |
|    0   N/A  N/A           36467      G   /snap/vlc/3777/usr/bin/vlc               16MiB |
|    0   N/A  N/A           44159      C   python3                                3348MiB |
+-----------------------------------------------------------------------------------------+
```



