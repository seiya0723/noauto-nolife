---
title: "【pytorch】torchvisionのCNNモデルの内部構造から仕組みを知る"
date: 2026-04-12T16:32:53+09:00
lastmod: 2026-04-12T16:32:53+09:00
draft: false
thumbnail: "images/pytorch.jpg"
categories: [ "others" ]
tags: [ "AI開発","pytorch","python" ]
---




## VGG 

ソースコード: https://github.com/pytorch/vision/blob/main/torchvision/models/vgg.py

VGGは3x3フィルタを重ねている単純なモデル。

とりわけVGG16 はプーリング層を除いた、畳み込み層(13)+全結合層(3) の計16層で構成されている。

VGGの全結合層は4096ユニットもあり、これが大量のメモリを消費している。

また、パラメーター数は1億3000万を超えており、caltech-101程度のデータ量(1クラス50件)では過学習を起こす。

期待をしている画像サイズは224x224。畳み込みを終えた時点で7x7に調整し、全結合を行う。

```
class VGG(nn.Module):
    def __init__(
        self, features: nn.Module, num_classes: int = 1000, init_weights: bool = True, dropout: float = 0.5
    ) -> None:
        super().__init__()
        _log_api_usage_once(self)

        # make_layer で生成したCNNを使う。VGGのバージョンごとに異なる。
        self.features = features

        # 7x7の平均プーリング層 (ここでどんなサイズが届いても7x7に再調整する。224/32=7x7であるが、例えば256が来たときなどで7x7でなくなり落ちてしまうのを防ぐため)
        self.avgpool = nn.AdaptiveAvgPool2d((7, 7))

        # 全結合層(分類を行う) 
        self.classifier = nn.Sequential(
            # 512次元 * 畳み込み+プーリングされた7x7画像を、4096のクラスに分類
            nn.Linear(512 * 7 * 7, 4096),

            # ReLU活性化関数
            nn.ReLU(True),
            # ドロップアウト
            nn.Dropout(p=dropout),
            # 次元を並び替え
            nn.Linear(4096, 4096),
            # ReLU活性化関数
            nn.ReLU(True),
            # ドロップアウト
            nn.Dropout(p=dropout),

            # 指定したクラスで分類
            nn.Linear(4096, num_classes),
        )
        if init_weights:
            for m in self.modules():
                if isinstance(m, nn.Conv2d):
                    nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
                    if m.bias is not None:
                        nn.init.constant_(m.bias, 0)
                elif isinstance(m, nn.BatchNorm2d):
                    nn.init.constant_(m.weight, 1)
                    nn.init.constant_(m.bias, 0)
                elif isinstance(m, nn.Linear):
                    nn.init.normal_(m.weight, 0, 0.01)
                    nn.init.constant_(m.bias, 0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x


def make_layers(cfg: list[Union[str, int]], batch_norm: bool = False) -> nn.Sequential:
    layers: list[nn.Module] = []
    in_channels = 3
    for v in cfg:

        if v == "M":
            # Mの場合はマックスプーリング
            layers += [nn.MaxPool2d(kernel_size=2, stride=2)]
        else:

            # 数字の場合は 3x3の畳み込み。サイズはそのままにチャンネル数を増やす。
            v = cast(int, v)
            conv2d = nn.Conv2d(in_channels, v, kernel_size=3, padding=1)

            # 
            if batch_norm:
                layers += [conv2d, nn.BatchNorm2d(v), nn.ReLU(inplace=True)]
            else:
                layers += [conv2d, nn.ReLU(inplace=True)]

            # 増やしたチャンネル数を与えて次の層へ
            in_channels = v


    return nn.Sequential(*layers)


# VGGの各バージョンのリスト
"""
A: VGG11
B: VGG13
D: VGG16
E: VGG19
"""

# 数字 : 出力チャンネル数を指定した畳み込み層
# M : マックスプーリングで画像サイズを半分にする層。ABDEそれぞれに5個用意されている。 224/32 = 7x7 になる。  
cfgs: dict[str, list[Union[str, int]]] = {
    "A": [64, "M", 128, "M", 256, 256, "M", 512, 512, "M", 512, 512, "M"],
    "B": [64, 64, "M", 128, 128, "M", 256, 256, "M", 512, 512, "M", 512, 512, "M"],
    "D": [64, 64, "M", 128, 128, "M", 256, 256, 256, "M", 512, 512, 512, "M", 512, 512, 512, "M"],
    "E": [64, 64, "M", 128, 128, "M", 256, 256, 256, 256, "M", 512, 512, 512, 512, "M", 512, 512, 512, 512, "M"],
}


def _vgg(cfg: str, batch_norm: bool, weights: Optional[WeightsEnum], progress: bool, **kwargs: Any) -> VGG:
    if weights is not None:
        kwargs["init_weights"] = False
        if weights.meta["categories"] is not None:
            _ovewrite_named_param(kwargs, "num_classes", len(weights.meta["categories"]))

    # make_layers で畳み込み層を作る
    model = VGG(make_layers(cfgs[cfg], batch_norm=batch_norm), **kwargs)

    if weights is not None:
        model.load_state_dict(weights.get_state_dict(progress=progress, check_hash=True))
    return model


_COMMON_META = {
    "min_size": (32, 32),
    "categories": _IMAGENET_CATEGORIES,
    "recipe": "https://github.com/pytorch/vision/tree/main/references/classification#alexnet-and-vgg",
    "_docs": """These weights were trained from scratch by using a simplified training recipe.""",
}
```

## GoogLeNet








