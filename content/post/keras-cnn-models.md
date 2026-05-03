---
title: "KerasのCNNモデルのコードを解釈する"
date: 2026-05-01T12:07:02+09:00
lastmod: 2026-05-01T12:07:02+09:00
draft: false
thumbnail: "images/keras.jpg"
categories: [ "others" ]
tags: [ "AI開発","keras","CNN" ]
---


Keras公式GitHubからコードを拝借。一部コメントや不必要な箇所を絞って、各CNNモデルの特徴がわかるように再構成してまとめる。

以下関連記事。

- [【pytorch】torchvisionのCNNモデルの内部構造から仕組みを知る](/post/pytorch-torchvision-models/)
- [pytorch の nn.moduleを継承して自作AIモデルを作り、CNNモデルの歴史を辿る](/post/pytorch-cnn-model-origin/)

## VGG


VGG は3x3畳み込みをひたすら積み重ねるシンプルモデル。

とりわけ今回はVGG16(畳み込み層+全結合層が16層)を解説。

https://github.com/keras-team/keras/blob/master/keras/src/applications/vgg16.py

```
from keras.src import backend
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

WEIGHTS_PATH = (
    "https://storage.googleapis.com/tensorflow/keras-applications/"
    "vgg16/vgg16_weights_tf_dim_ordering_tf_kernels.h5"
)
WEIGHTS_PATH_NO_TOP = (
    "https://storage.googleapis.com/tensorflow/"
    "keras-applications/vgg16/"
    "vgg16_weights_tf_dim_ordering_tf_kernels_notop.h5"
)


@keras_export(["keras.applications.vgg16.VGG16", "keras.applications.VGG16"])
def VGG16(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="vgg16",
):


    # 引数のバリデーション等を行う。
    
    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), 'imagenet' "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded.  Received: "
            f"weights={weights}"
        )

    # imagenet を使う場合、クラス数が1000でない場合はエラー。
    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            "If using `weights='imagenet'` with `include_top=True`, "
            "`classes` should be 1000.  "
            f"Received classes={classes}"
        )

    # 入力サイズの決定。 入力サイズは224x224 を基本として、全結合層なしの場合は32x32とする。
    input_shape = imagenet_utils.obtain_input_shape(
        input_shape,
        default_size=224,
        min_size=32,
        data_format=backend.image_data_format(),
        require_flatten=include_top,
        weights=weights,
    )

    # 入力テンソルが用意されていればそれを使う。
    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor

    # 引数のバリデーション等ここまで



    # TIPS: ここで3x3畳み込みをシンプルに重ねている。活性化関数はReLUで。
    #       プーリングはマックスプーリング2x2

    # Conv2D 13層

    # Block 1
    x = layers.Conv2D(64, (3, 3), activation="relu", padding="same", name="block1_conv1")(img_input)
    x = layers.Conv2D(64, (3, 3), activation="relu", padding="same", name="block1_conv2")(x)
    x = layers.MaxPooling2D((2, 2), strides=(2, 2), name="block1_pool")(x)

    # Block 2
    x = layers.Conv2D(128, (3, 3), activation="relu", padding="same", name="block2_conv1")(x)
    x = layers.Conv2D(128, (3, 3), activation="relu", padding="same", name="block2_conv2")(x)
    x = layers.MaxPooling2D((2, 2), strides=(2, 2), name="block2_pool")(x)

    # Block 3
    x = layers.Conv2D(256, (3, 3), activation="relu", padding="same", name="block3_conv1")(x)
    x = layers.Conv2D(256, (3, 3), activation="relu", padding="same", name="block3_conv2")(x)
    x = layers.Conv2D(256, (3, 3), activation="relu", padding="same", name="block3_conv3")(x)
    x = layers.MaxPooling2D((2, 2), strides=(2, 2), name="block3_pool")(x)

    # Block 4
    x = layers.Conv2D(512, (3, 3), activation="relu", padding="same", name="block4_conv1")(x)
    x = layers.Conv2D(512, (3, 3), activation="relu", padding="same", name="block4_conv2")(x)
    x = layers.Conv2D(512, (3, 3), activation="relu", padding="same", name="block4_conv3")(x)
    x = layers.MaxPooling2D((2, 2), strides=(2, 2), name="block4_pool")(x)

    # Block 5
    x = layers.Conv2D(512, (3, 3), activation="relu", padding="same", name="block5_conv1")(x)
    x = layers.Conv2D(512, (3, 3), activation="relu", padding="same", name="block5_conv2")(x)
    x = layers.Conv2D(512, (3, 3), activation="relu", padding="same", name="block5_conv3")(x)
    x = layers.MaxPooling2D((2, 2), strides=(2, 2), name="block5_pool")(x)

    # ==== 畳み込み+マックスプールここまで ====

    # TIPS: ここで全結合層を作っている。 Dense 3層
    if include_top:

        # 線形変換。
        x = layers.Flatten(name="flatten")(x)

        # VGGの巨大な全結合層
        x = layers.Dense(4096, activation="relu", name="fc1")(x)
        x = layers.Dense(4096, activation="relu", name="fc2")(x)

        # 出力層のカスタマイズ。クラス数に合わせてclassifier_activation(Softmax)を使う。
        imagenet_utils.validate_activation(classifier_activation, weights)

        x = layers.Dense(classes, activation=classifier_activation, name="predictions")(x)

    else:
        # VGGの論文にはないが、転移学習用にGAPを使っている。全結合層を使わないタイプのVGG
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D()(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D()(x)

    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input

    # TIPS: FunctionalAPIでモデルを作る。
    model = Functional(inputs, x, name=name)

    
    # 学習済みの重みを読み込みするか否か？
    if weights == "imagenet":
        if include_top:
            weights_path = file_utils.get_file(
                "vgg16_weights_tf_dim_ordering_tf_kernels.h5",
                WEIGHTS_PATH,
                cache_subdir="models",
                file_hash="64373286793e3c8b2b4e3219cbf3544b",
            )
        else:
            weights_path = file_utils.get_file(
                "vgg16_weights_tf_dim_ordering_tf_kernels_notop.h5",
                WEIGHTS_PATH_NO_TOP,
                cache_subdir="models",
                file_hash="6d6bbae143d832006294945121d1f1fc",
            )

        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)

    return model


@keras_export("keras.applications.vgg16.preprocess_input")
def preprocess_input(x, data_format=None):
    return imagenet_utils.preprocess_input(
        x, data_format=data_format, mode="caffe"
    )


@keras_export("keras.applications.vgg16.decode_predictions")
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)


preprocess_input.__doc__ = imagenet_utils.PREPROCESS_INPUT_DOC.format(
    mode="",
    ret=imagenet_utils.PREPROCESS_INPUT_RET_DOC_CAFFE,
    error=imagenet_utils.PREPROCESS_INPUT_ERROR_DOC,
)
decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__
```

VGGなので、全体的に非常にシンプル。畳み込みとマックスプーリングを重ね、最後に線形変換して全結合している。

特徴抽出器としてGlobal Average Poolingを使っている。これにより、更に安定して分類を行うことができる。

## GoogLeNet

KerasにはGoogLeNetは存在しない。が、inception_v3があるためそちらを解説する。

Inception モジュールは、GoogLeNetの 1x1 3x3 5x5 の畳み込みを並列に行うモジュールのこと。

InceptionV3 なので、1x1 5x5 7x7 の畳み込みになっている。

https://github.com/keras-team/keras/blob/master/keras/src/applications/inception_v3.py

```
from keras.src import backend
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

WEIGHTS_PATH = (
    "https://storage.googleapis.com/tensorflow/keras-applications/"
    "inception_v3/inception_v3_weights_tf_dim_ordering_tf_kernels.h5"
)
WEIGHTS_PATH_NO_TOP = (
    "https://storage.googleapis.com/tensorflow/keras-applications/"
    "inception_v3/inception_v3_weights_tf_dim_ordering_tf_kernels_notop.h5"
)



# Inceptionモジュール。(1x1 5x5 7x7 の畳み込みの並列処理)
@keras_export(
    [
        "keras.applications.inception_v3.InceptionV3",
        "keras.applications.InceptionV3",
    ]
)
def InceptionV3(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="inception_v3",
):

    # 入力値のバリデーション等

    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), `imagenet` "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded; "
            f"Received: weights={weights}"
        )

    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            'If using `weights="imagenet"` with `include_top=True`, '
            "`classes` should be 1000. "
            f"Received classes={classes}"
        )

    # Determine proper input shape
    input_shape = imagenet_utils.obtain_input_shape(
        input_shape,
        default_size=299,
        min_size=75,
        data_format=backend.image_data_format(),
        require_flatten=include_top,
        weights=weights,
    )

    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor

    if backend.image_data_format() == "channels_first":
        channel_axis = 1
    else:
        channel_axis = 3

    # ==== 入力値のバリデーション等ここまで ====


    # Batch Normalization (バッチ正規化を使用した畳み込みを行う。)
    
    # 畳み込み3層+マックスプーリング
    x = conv2d_bn(img_input, 32, 3, 3, strides=(2, 2), padding="valid")
    x = conv2d_bn(x, 32, 3, 3, padding="valid")
    x = conv2d_bn(x, 64, 3, 3)
    x = layers.MaxPooling2D((3, 3), strides=(2, 2))(x)

    # 1x1畳み込み + 3x3畳み込み + マックスプーリング
    x = conv2d_bn(x, 80, 1, 1, padding="valid")
    x = conv2d_bn(x, 192, 3, 3, padding="valid")
    x = layers.MaxPooling2D((3, 3), strides=(2, 2))(x)


    # ここで1x1 5x5 7x7の畳み込みを一時変数に記録する形で並列的に処理している
    # なぜ5x5畳み込み2層？なぜ3x3畳み込みを3層？
    # → 同一範囲に寄せながら、計算コストを減らすための工夫。

    branch1x1 = conv2d_bn(x, 64, 1, 1)

    # 実質5x5 相当
    branch5x5 = conv2d_bn(x, 48, 1, 1)
    branch5x5 = conv2d_bn(branch5x5, 64, 5, 5)

    # 実質7x7相当
    branch3x3dbl = conv2d_bn(x, 64, 1, 1)
    branch3x3dbl = conv2d_bn(branch3x3dbl, 96, 3, 3)
    branch3x3dbl = conv2d_bn(branch3x3dbl, 96, 3, 3)

    # 平均プーリングで特徴圧縮
    branch_pool = layers.AveragePooling2D( (3, 3), strides=(1, 1), padding="same" )(x)

    branch_pool = conv2d_bn(branch_pool, 32, 1, 1)

    # 各種の畳み込みを結合する。
    x = layers.concatenate(
        [branch1x1, branch5x5, branch3x3dbl, branch_pool],
        axis=channel_axis,
        name="mixed0",
    )

    # 以降、繰り返し。
    # ==================

    # mixed 1: 35 x 35 x 288
    branch1x1 = conv2d_bn(x, 64, 1, 1)

    branch5x5 = conv2d_bn(x, 48, 1, 1)
    branch5x5 = conv2d_bn(branch5x5, 64, 5, 5)

    branch3x3dbl = conv2d_bn(x, 64, 1, 1)
    branch3x3dbl = conv2d_bn(branch3x3dbl, 96, 3, 3)
    branch3x3dbl = conv2d_bn(branch3x3dbl, 96, 3, 3)

    branch_pool = layers.AveragePooling2D( (3, 3), strides=(1, 1), padding="same" )(x)

    branch_pool = conv2d_bn(branch_pool, 64, 1, 1)

    # 各種の畳み込みを結合する。
    x = layers.concatenate(
        [branch1x1, branch5x5, branch3x3dbl, branch_pool],
        axis=channel_axis,
        name="mixed1",
    )

    # ==================

    # mixed 2: 35 x 35 x 288
    branch1x1 = conv2d_bn(x, 64, 1, 1)

    branch5x5 = conv2d_bn(x, 48, 1, 1)
    branch5x5 = conv2d_bn(branch5x5, 64, 5, 5)

    branch3x3dbl = conv2d_bn(x, 64, 1, 1)
    branch3x3dbl = conv2d_bn(branch3x3dbl, 96, 3, 3)
    branch3x3dbl = conv2d_bn(branch3x3dbl, 96, 3, 3)

    branch_pool = layers.AveragePooling2D((3, 3), strides=(1, 1), padding="same")(x)

    branch_pool = conv2d_bn(branch_pool, 64, 1, 1)

    # 各種の畳み込みを結合する。
    x = layers.concatenate(
        [branch1x1, branch5x5, branch3x3dbl, branch_pool],
        axis=channel_axis,
        name="mixed2",
    )

    # ==================

    # mixed 3: 17 x 17 x 768
    branch3x3 = conv2d_bn(x, 384, 3, 3, strides=(2, 2), padding="valid")

    branch3x3dbl = conv2d_bn(x, 64, 1, 1)
    branch3x3dbl = conv2d_bn(branch3x3dbl, 96, 3, 3)
    branch3x3dbl = conv2d_bn( branch3x3dbl, 96, 3, 3, strides=(2, 2), padding="valid" )

    branch_pool = layers.MaxPooling2D((3, 3), strides=(2, 2))(x)

    # 各種の畳み込みを結合する。
    x = layers.concatenate(
        [branch3x3, branch3x3dbl, branch_pool],
        axis=channel_axis,
        name="mixed3"
    )

    # mixed 4: 17 x 17 x 768
    branch1x1 = conv2d_bn(x, 192, 1, 1)

    branch7x7 = conv2d_bn(x, 128, 1, 1)
    branch7x7 = conv2d_bn(branch7x7, 128, 1, 7)
    branch7x7 = conv2d_bn(branch7x7, 192, 7, 1)

    branch7x7dbl = conv2d_bn(x, 128, 1, 1)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 128, 7, 1)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 128, 1, 7)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 128, 7, 1)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 192, 1, 7)

    branch_pool = layers.AveragePooling2D((3, 3), strides=(1, 1), padding="same" )(x)
    branch_pool = conv2d_bn(branch_pool, 192, 1, 1)

    # 各種の畳み込みを結合する。
    x = layers.concatenate(
        [branch1x1, branch7x7, branch7x7dbl, branch_pool],
        axis=channel_axis,
        name="mixed4",
    )

    # mixed 5, 6: 17 x 17 x 768
    for i in range(2):
        branch1x1 = conv2d_bn(x, 192, 1, 1)

        branch7x7 = conv2d_bn(x, 160, 1, 1)
        branch7x7 = conv2d_bn(branch7x7, 160, 1, 7)
        branch7x7 = conv2d_bn(branch7x7, 192, 7, 1)

        branch7x7dbl = conv2d_bn(x, 160, 1, 1)
        branch7x7dbl = conv2d_bn(branch7x7dbl, 160, 7, 1)
        branch7x7dbl = conv2d_bn(branch7x7dbl, 160, 1, 7)
        branch7x7dbl = conv2d_bn(branch7x7dbl, 160, 7, 1)
        branch7x7dbl = conv2d_bn(branch7x7dbl, 192, 1, 7)

        branch_pool = layers.AveragePooling2D(
            (3, 3), strides=(1, 1), padding="same"
        )(x)
        branch_pool = conv2d_bn(branch_pool, 192, 1, 1)
        x = layers.concatenate(
            [branch1x1, branch7x7, branch7x7dbl, branch_pool],
            axis=channel_axis,
            name="mixed{0}".format(5 + i),
        )

    # mixed 7: 17 x 17 x 768
    branch1x1 = conv2d_bn(x, 192, 1, 1)

    branch7x7 = conv2d_bn(x, 192, 1, 1)
    branch7x7 = conv2d_bn(branch7x7, 192, 1, 7)
    branch7x7 = conv2d_bn(branch7x7, 192, 7, 1)

    branch7x7dbl = conv2d_bn(x, 192, 1, 1)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 192, 7, 1)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 192, 1, 7)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 192, 7, 1)
    branch7x7dbl = conv2d_bn(branch7x7dbl, 192, 1, 7)

    branch_pool = layers.AveragePooling2D((3, 3), strides=(1, 1), padding="same")(x)
    branch_pool = conv2d_bn(branch_pool, 192, 1, 1)

    x = layers.concatenate(
        [branch1x1, branch7x7, branch7x7dbl, branch_pool],
        axis=channel_axis,
        name="mixed7",
    )

    # mixed 8: 8 x 8 x 1280
    branch3x3 = conv2d_bn(x, 192, 1, 1)
    branch3x3 = conv2d_bn(branch3x3, 320, 3, 3, strides=(2, 2), padding="valid")

    branch7x7x3 = conv2d_bn(x, 192, 1, 1)
    branch7x7x3 = conv2d_bn(branch7x7x3, 192, 1, 7)
    branch7x7x3 = conv2d_bn(branch7x7x3, 192, 7, 1)
    branch7x7x3 = conv2d_bn(branch7x7x3, 192, 3, 3, strides=(2, 2), padding="valid")

    branch_pool = layers.MaxPooling2D((3, 3), strides=(2, 2))(x)

    x = layers.concatenate(
        [branch3x3, branch7x7x3, branch_pool], axis=channel_axis, name="mixed8"
    )

    # mixed 9: 8 x 8 x 2048
    for i in range(2):
        branch1x1 = conv2d_bn(x, 320, 1, 1)

        branch3x3 = conv2d_bn(x, 384, 1, 1)
        branch3x3_1 = conv2d_bn(branch3x3, 384, 1, 3)
        branch3x3_2 = conv2d_bn(branch3x3, 384, 3, 1)
        branch3x3 = layers.concatenate(
            [branch3x3_1, branch3x3_2],
            axis=channel_axis,
            name=f"mixed9_{i}",
        )

        branch3x3dbl = conv2d_bn(x, 448, 1, 1)
        branch3x3dbl = conv2d_bn(branch3x3dbl, 384, 3, 3)
        branch3x3dbl_1 = conv2d_bn(branch3x3dbl, 384, 1, 3)
        branch3x3dbl_2 = conv2d_bn(branch3x3dbl, 384, 3, 1)
        branch3x3dbl = layers.concatenate(
            [branch3x3dbl_1, branch3x3dbl_2], axis=channel_axis
        )

        branch_pool = layers.AveragePooling2D((3, 3), strides=(1, 1), padding="same")(x)
        branch_pool = conv2d_bn(branch_pool, 192, 1, 1)

        x = layers.concatenate(
            [branch1x1, branch3x3, branch3x3dbl, branch_pool],
            axis=channel_axis,
            name=f"mixed{9 + i}",
        )
    
    if include_top:

        # GAPを行った後、全結合層に引き渡す。
        x = layers.GlobalAveragePooling2D(name="avg_pool")(x)

        imagenet_utils.validate_activation(classifier_activation, weights)
        x = layers.Dense(classes, activation=classifier_activation, name="predictions")(x)

    else:
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D()(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D()(x)


    # Ensure that the model takes into account
    # any potential predecessors of `input_tensor`.
    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input


    # モデルを作る
    model = Functional(inputs, x, name=name)

    # 重みの読み込み
    if weights == "imagenet":
        if include_top:
            weights_path = file_utils.get_file(
                "inception_v3_weights_tf_dim_ordering_tf_kernels.h5",
                WEIGHTS_PATH,
                cache_subdir="models",
                file_hash="9a0d58056eeedaa3f26cb7ebd46da564",
            )
        else:
            weights_path = file_utils.get_file(
                "inception_v3_weights_tf_dim_ordering_tf_kernels_notop.h5",
                WEIGHTS_PATH_NO_TOP,
                cache_subdir="models",
                file_hash="bcbd6486424b2319ff4ef7d526e38f63",
            )
        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)

    return model


# 畳み込み + バッチ正規化
def conv2d_bn(x, filters, num_row, num_col, padding="same", strides=(1, 1), name=None):
    if name is not None:
        bn_name = f"{name}_bn"
        conv_name = f"{name}_conv"
    else:
        bn_name = None
        conv_name = None

    if backend.image_data_format() == "channels_first":
        bn_axis = 1
    else:
        bn_axis = 3


    # 畳み込みを行い、バッチ正規化を経て、ReLU
    x = layers.Conv2D(filters, (num_row, num_col), strides=strides, padding=padding, use_bias=False, name=conv_name, )(x)
    x = layers.BatchNormalization(axis=bn_axis, scale=False, name=bn_name)(x)
    x = layers.Activation("relu", name=name)(x)

    return x


@keras_export("keras.applications.inception_v3.preprocess_input")
def preprocess_input(x, data_format=None):
    return imagenet_utils.preprocess_input(
        x, data_format=data_format, mode="tf"
    )

@keras_export("keras.applications.inception_v3.decode_predictions")
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)


preprocess_input.__doc__ = imagenet_utils.PREPROCESS_INPUT_DOC.format(
    mode="",
    ret=imagenet_utils.PREPROCESS_INPUT_RET_DOC_TF,
    error=imagenet_utils.PREPROCESS_INPUT_ERROR_DOC,
)
decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__
```

また、VGG16とは異なり、畳み込みの際にバッチ正規化を行っている。これにより勾配消失・勾配爆発を抑止している。


## ResNet

ResNet は残差接続(スキップコネクション、ショートカット接続とも言う)を採用し、残差(今の層の出力) に対して入力値を加算して次の層に引き渡している。

その引き渡しの際に、チャンネル数が異なれば加算はできないため1x1畳み込みでチャンネル数を調整している。

https://github.com/keras-team/keras/blob/master/keras/src/applications/resnet.py


```
from keras.src import backend
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

BASE_WEIGHTS_PATH = (
    "https://storage.googleapis.com/tensorflow/keras-applications/resnet/"
)
WEIGHTS_HASHES = {
    "resnet50": (
        "2cb95161c43110f7111970584f804107",
        "4d473c1dd8becc155b73f8504c6f6626",
    ),
    "resnet101": (
        "f1aeb4b969a6efcfb50fad2f0c20cfc5",
        "88cf7a10940856eca736dc7b7e228a21",
    ),
    "resnet152": (
        "100835be76be38e30d865e96f2aaae62",
        "ee4c566cf9a93f14d82f913c2dc6dd0c",
    ),
    "resnet50v2": (
        "3ef43a0b657b3be2300d5770ece849e0",
        "fac2f116257151a9d068a22e544a4917",
    ),
    "resnet101v2": (
        "6343647c601c52e1368623803854d971",
        "c0ed64b8031c3730f411d2eb4eea35b5",
    ),
    "resnet152v2": (
        "a49b44d1979771252814e80f8ec446f9",
        "ed17cf2e0169df9d443503ef94b23b33",
    ),
    "resnext50": (
        "67a5b30d522ed92f75a1f16eef299d1a",
        "62527c363bdd9ec598bed41947b379fc",
    ),
    "resnext101": (
        "34fb605428fcc7aa4d62f44404c11509",
        "0f678c91647380debd923963594981b3",
    ),
}

# 原型となるResNet、残差接続ギミックは含まず。
def ResNet(
    stack_fn,
    preact,
    use_bias,
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="resnet",
    weights_name=None,
):

    # 入力値のバリデーション等

    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), 'imagenet' "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded.  Received: "
            f"weights={weights}"
        )

    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            "If using `weights='imagenet'` with `include_top=True`, "
            "`classes` should be 1000.  "
            f"Received classes={classes}"
        )

    # Determine proper input shape
    input_shape = imagenet_utils.obtain_input_shape(
        input_shape,
        default_size=224,
        min_size=32,
        data_format=backend.image_data_format(),
        require_flatten=include_top,
        weights=weights,
    )

    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor

    if backend.image_data_format() == "channels_last":
        bn_axis = 3
    else:
        bn_axis = 1

    # 入力値のバリデーション等


    # ゼロ埋め + 7x7 畳み込み
    x = layers.ZeroPadding2D(padding=((3, 3), (3, 3)), name="conv1_pad")(img_input)
    x = layers.Conv2D(64, 7, strides=2, use_bias=use_bias, name="conv1_conv")(x)

    if not preact:
        x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name="conv1_bn")(x)
        x = layers.Activation("relu", name="conv1_relu")(x)

    x = layers.ZeroPadding2D(padding=((1, 1), (1, 1)), name="pool1_pad")(x)
    x = layers.MaxPooling2D(3, strides=2, name="pool1_pool")(x)

    x = stack_fn(x)

    if preact:
        x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name="post_bn")(x)
        x = layers.Activation("relu", name="post_relu")(x)

    if include_top:
        x = layers.GlobalAveragePooling2D(name="avg_pool")(x)

        # Validate activation for the classifier layer
        imagenet_utils.validate_activation(classifier_activation, weights)

        x = layers.Dense(classes, activation=classifier_activation, name="predictions")(x)
    else:
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D(name="max_pool")(x)


    # 入力値の扱い
    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input

    # モデルを作る
    model = Functional(inputs, x, name=name)

    # 重みをロード
    if (weights == "imagenet") and (weights_name in WEIGHTS_HASHES):
        if include_top:
            file_name = f"{weights_name}_weights_tf_dim_ordering_tf_kernels.h5"
            file_hash = WEIGHTS_HASHES[weights_name][0]
        else:
            file_name = (f"{weights_name}_weights_tf_dim_ordering_tf_kernels_notop.h5")
            file_hash = WEIGHTS_HASHES[weights_name][1]
        weights_path = file_utils.get_file(
            file_name,
            f"{BASE_WEIGHTS_PATH}{file_name}",
            cache_subdir="models",
            file_hash=file_hash,
        )
        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)

    return model


# 残差接続ギミックを含む residual_block (残差ネットワーク)
def residual_block_v1(x, filters, kernel_size=3, stride=1, conv_shortcut=True, name=None):

    if backend.image_data_format() == "channels_last":
        bn_axis = 3
    else:
        bn_axis = 1

    # 残差接続用の出力値を畳み込みしてから保存するか？それともそのまま保存するか
    if conv_shortcut:
        # 1x1畳み込みで、チャンネル数を調整している。
        shortcut = layers.Conv2D(4 * filters, 1, strides=stride, name=f"{name}_0_conv")(x)
        shortcut = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_0_bn")(shortcut)
    else:
        shortcut = x

    x = layers.Conv2D(filters, 1, strides=stride, name=f"{name}_1_conv")(x)
    x = layers.BatchNormalization( axis=bn_axis, epsilon=1.001e-5, name=f"{name}_1_bn")(x)
    x = layers.Activation("relu", name=f"{name}_1_relu")(x)

    x = layers.Conv2D(filters, kernel_size, padding="SAME", name=f"{name}_2_conv")(x)
    x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_2_bn")(x)
    x = layers.Activation("relu", name=f"{name}_2_relu")(x)

    x = layers.Conv2D(4 * filters, 1, name=f"{name}_3_conv")(x)
    x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_3_bn")(x)

    # ここで残差接続用に用意した最初の層の出力値(もしくはそれ以前の入力値) を与える。
    x = layers.Add(name=f"{name}_add")([shortcut, x])
    x = layers.Activation("relu", name=f"{name}_out")(x)

    return x


# 残差ネットワークV1を呼び出す。
def stack_residual_blocks_v1(x, filters, blocks, stride1=2, name=None):
    x = residual_block_v1(x, filters, stride=stride1, name=f"{name}_block1")

    for i in range(2, blocks + 1):
        x = residual_block_v1(x, filters, conv_shortcut=False, name=f"{name}_block{i}")

    return x


# 残差接続ギミックを含む residual_block (残差ネットワーク)
def residual_block_v2(x, filters, kernel_size=3, stride=1, conv_shortcut=False, name=None):

    if backend.image_data_format() == "channels_last":
        bn_axis = 3
    else:
        bn_axis = 1

    preact = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_preact_bn")(x)
    preact = layers.Activation("relu", name=f"{name}_preact_relu")(preact)

    # 残差接続用の値を保持しておく。 畳み込みをしてから保存か、マックスプーリングをしてから保存か？
    if conv_shortcut:
        # 畳み込みで保存。1x1でチャンネル調整
        shortcut = layers.Conv2D(4 * filters, 1, strides=stride, name=f"{name}_0_conv")(preact)
    else:
        # マックスプーリングで保存 1x1 でチャンネル調整
        shortcut = (layers.MaxPooling2D(1, strides=stride)(x) if stride > 1 else x)

    x = layers.Conv2D(filters, 1, strides=1, use_bias=False, name=f"{name}_1_conv")(preact)
    x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_1_bn")(x)
    x = layers.Activation("relu", name=f"{name}_1_relu")(x)

    x = layers.ZeroPadding2D(padding=((1, 1), (1, 1)), name=f"{name}_2_pad")(x)
    x = layers.Conv2D(filters,kernel_size,strides=stride,use_bias=False, name=f"{name}_2_conv", )(x)
    x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_2_bn")(x)
    x = layers.Activation("relu", name=f"{name}_2_relu")(x)

    x = layers.Conv2D(4 * filters, 1, name=f"{name}_3_conv")(x)
    x = layers.Add(name=f"{name}_out")([shortcut, x])

    return x


# 残差ネットワークV2を呼び出す。
def stack_residual_blocks_v2(x, filters, blocks, stride1=2, name=None):
    x = residual_block_v2(x, filters, conv_shortcut=True, name=f"{name}_block1")

    for i in range(2, blocks):
        x = residual_block_v2(x, filters, name=f"{name}_block{i}")

    x = residual_block_v2(x, filters, stride=stride1, name=f"{name}_block{str(blocks)}")

    return x



# 以下ResNet50~101の関数。
@keras_export(
    [
        "keras.applications.resnet50.ResNet50",
        "keras.applications.resnet.ResNet50",
        "keras.applications.ResNet50",
    ]
)
def ResNet50(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="resnet50",
):

    def stack_fn(x):
        x = stack_residual_blocks_v1(x, 64, 3, stride1=1, name="conv2")
        x = stack_residual_blocks_v1(x, 128, 4, name="conv3")
        x = stack_residual_blocks_v1(x, 256, 6, name="conv4")
        return stack_residual_blocks_v1(x, 512, 3, name="conv5")

    return ResNet(
        stack_fn,
        preact=False,
        use_bias=True,
        weights_name="resnet50",
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
    )


@keras_export(
    [
        "keras.applications.resnet.ResNet101",
        "keras.applications.ResNet101",
    ]
)
def ResNet101(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="resnet101",
):

    def stack_fn(x):
        x = stack_residual_blocks_v1(x, 64, 3, stride1=1, name="conv2")
        x = stack_residual_blocks_v1(x, 128, 4, name="conv3")
        x = stack_residual_blocks_v1(x, 256, 23, name="conv4")
        return stack_residual_blocks_v1(x, 512, 3, name="conv5")

    return ResNet(
        stack_fn,
        preact=False,
        use_bias=True,
        name=name,
        weights_name="resnet101",
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
    )


@keras_export(
    [
        "keras.applications.resnet.ResNet152",
        "keras.applications.ResNet152",
    ]
)
def ResNet152(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="resnet152",
):

    def stack_fn(x):
        x = stack_residual_blocks_v1(x, 64, 3, stride1=1, name="conv2")
        x = stack_residual_blocks_v1(x, 128, 8, name="conv3")
        x = stack_residual_blocks_v1(x, 256, 36, name="conv4")
        return stack_residual_blocks_v1(x, 512, 3, name="conv5")

    return ResNet(
        stack_fn,
        preact=False,
        use_bias=True,
        name=name,
        weights_name="resnet152",
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
    )


@keras_export(
    [
        "keras.applications.resnet50.preprocess_input",
        "keras.applications.resnet.preprocess_input",
    ]
)
def preprocess_input(x, data_format=None):
    return imagenet_utils.preprocess_input(
        x, data_format=data_format, mode="caffe"
    )


@keras_export(
    [
        "keras.applications.resnet50.decode_predictions",
        "keras.applications.resnet.decode_predictions",
    ]
)
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)


preprocess_input.__doc__ = imagenet_utils.PREPROCESS_INPUT_DOC.format(
    mode="",
    ret=imagenet_utils.PREPROCESS_INPUT_RET_DOC_CAFFE,
    error=imagenet_utils.PREPROCESS_INPUT_ERROR_DOC,
)
decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__

DOC = "Reference: 以下略 "

if ResNet50.__doc__ is not None:
    setattr(ResNet50, "__doc__", ResNet50.__doc__ + DOC)
if ResNet101.__doc__ is not None:
    setattr(ResNet101, "__doc__", ResNet101.__doc__ + DOC)
if ResNet152.__doc__ is not None:
    setattr(ResNet152, "__doc__", ResNet152.__doc__ + DOC)
```


WideResNetはkerasには含まれない。

幅を広げる方向で精度を高めるアプローチは、EfficientNetの登場により適していないとされた。

## MobileNet

MobileNet は チャンネルを分離し空間方向にのみ畳み込みを行うdepthwise と 1x1畳み込みであるpointwiseを使用して計算量を減らしている。

MobileNetV2では、前方の1x1でチャンネルを増やし、depthwise に送り、後方の1x1でチャンネル数を戻す。そして、情報の損失を防ぐため線形で出力を行う。これをリニアボトルネックという。

MobileNetV3では、そのリニアボトルネックに加え1x1でチャンネルを戻す際、チャンネルごとの重要度を取り決めるSE層が用意されており、これにより重要なチャンネルだけ残し精度の向上が期待できる。

https://github.com/keras-team/keras/blob/master/keras/src/applications/mobilenet.py

```
import warnings

from keras.src import backend
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

BASE_WEIGHT_PATH = (
    "https://storage.googleapis.com/tensorflow/keras-applications/mobilenet/"
)


@keras_export(
    [
        "keras.applications.mobilenet.MobileNet",
        "keras.applications.MobileNet",
    ]
)
def MobileNet(
    input_shape=None,
    alpha=1.0,
    depth_multiplier=1,
    dropout=1e-3,
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name=None,
):

    # バリデーションと入力値の扱いについて

    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), 'imagenet' "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded. "
            f"Received weights={weights}"
        )

    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            "If using `weights='imagenet'` with `include_top=True`, "
            "`classes` should be 1000.  "
            f"Received classes={classes}"
        )

    # Determine proper input shape and default size.
    if input_shape is None:
        default_size = 224
    else:
        if backend.image_data_format() == "channels_first":
            rows = input_shape[1]
            cols = input_shape[2]
        else:
            rows = input_shape[0]
            cols = input_shape[1]

        if rows == cols and rows in [128, 160, 192, 224]:
            default_size = rows
        else:
            default_size = 224

    input_shape = imagenet_utils.obtain_input_shape(
        input_shape,
        default_size=default_size,
        min_size=32,
        data_format=backend.image_data_format(),
        require_flatten=include_top,
        weights=weights,
    )

    if backend.image_data_format() == "channels_last":
        row_axis, col_axis = (0, 1)
    else:
        row_axis, col_axis = (1, 2)
    rows = input_shape[row_axis]
    cols = input_shape[col_axis]

    if weights == "imagenet":
        if depth_multiplier != 1:
            raise ValueError(
                "If imagenet weights are being loaded, "
                "depth multiplier must be 1.  "
                f"Received depth_multiplier={depth_multiplier}"
            )

        if alpha not in [0.25, 0.50, 0.75, 1.0]:
            raise ValueError(
                "If imagenet weights are being loaded, "
                "alpha can be one of"
                "`0.25`, `0.50`, `0.75` or `1.0` only.  "
                f"Received alpha={alpha}"
            )

        if rows != cols or rows not in [128, 160, 192, 224]:
            rows = 224
            warnings.warn(
                "`input_shape` is undefined or non-square, "
                "or `rows` is not in [128, 160, 192, 224]. "
                "Weights for input shape (224, 224) will be "
                "loaded as the default.",
                stacklevel=2,
            )

    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor


    # バリデーションと入力値の扱いについて


    x = _conv_block(img_input, 32, alpha, strides=(2, 2))

    # TIPS: depthwise の畳み込み。チャンネル方向から分離して空間方向にのみ畳み込み
    x = _depthwise_conv_block(x, 64, alpha, depth_multiplier, block_id=1)

    x = _depthwise_conv_block(x, 128, alpha, depth_multiplier, strides=(2, 2), block_id=2)
    x = _depthwise_conv_block(x, 128, alpha, depth_multiplier, block_id=3)

    x = _depthwise_conv_block(x, 256, alpha, depth_multiplier, strides=(2, 2), block_id=4)
    x = _depthwise_conv_block(x, 256, alpha, depth_multiplier, block_id=5)

    x = _depthwise_conv_block(x, 512, alpha, depth_multiplier, strides=(2, 2), block_id=)
    x = _depthwise_conv_block(x, 512, alpha, depth_multiplier, block_id=7)
    x = _depthwise_conv_block(x, 512, alpha, depth_multiplier, block_id=8)
    x = _depthwise_conv_block(x, 512, alpha, depth_multiplier, block_id=9)
    x = _depthwise_conv_block(x, 512, alpha, depth_multiplier, block_id=10)
    x = _depthwise_conv_block(x, 512, alpha, depth_multiplier, block_id=11)

    x = _depthwise_conv_block(x, 1024, alpha, depth_multiplier, strides=(2, 2), block_id=12)
    x = _depthwise_conv_block(x, 1024, alpha, depth_multiplier, block_id=13)

    # GAPを使い、ドロップアウトして分類
    if include_top:
        x = layers.GlobalAveragePooling2D(keepdims=True)(x)
        x = layers.Dropout(dropout, name="dropout")(x)
        x = layers.Conv2D(classes, (1, 1), padding="same", name="conv_preds")(x)
        x = layers.Reshape((classes,), name="reshape_2")(x)
        imagenet_utils.validate_activation(classifier_activation, weights)
        x = layers.Activation(activation=classifier_activation, name="predictions")(x)
    else:
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D()(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D()(x)

    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input

    # モデルの作成
    if name is None:
        name = f"mobilenet_{alpha:0.2f}_{rows}"
    model = Functional(inputs, x, name=name)

    # 重みの読み込み
    if weights == "imagenet":
        if alpha == 1.0:
            alpha_text = "1_0"
        elif alpha == 0.75:
            alpha_text = "7_5"
        elif alpha == 0.50:
            alpha_text = "5_0"
        else:
            alpha_text = "2_5"

        if include_top:
            model_name = "mobilenet_%s_%d_tf.h5" % (alpha_text, rows)
            weight_path = BASE_WEIGHT_PATH + model_name
            weights_path = file_utils.get_file(
                model_name, weight_path, cache_subdir="models"
            )
        else:
            model_name = "mobilenet_%s_%d_tf_no_top.h5" % (alpha_text, rows)
            weight_path = BASE_WEIGHT_PATH + model_name
            weights_path = file_utils.get_file(
                model_name, weight_path, cache_subdir="models"
            )
        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)

    return model


def _conv_block(inputs, filters, alpha, kernel=(3, 3), strides=(1, 1)):

    channel_axis = 1 if backend.image_data_format() == "channels_first" else -1
    filters = int(filters * alpha)
    x = layers.Conv2D(
        filters,
        kernel,
        padding="same",
        use_bias=False,
        strides=strides,
        name="conv1",
    )(inputs)
    x = layers.BatchNormalization(axis=channel_axis, name="conv1_bn")(x)
    return layers.ReLU(6.0, name="conv1_relu")(x)


def _depthwise_conv_block(
    inputs,
    pointwise_conv_filters,
    alpha,
    depth_multiplier=1,
    strides=(1, 1),
    block_id=1,
):
    
    # α値( 1x1畳み込みの際にチャンネル数を調整するハイパーパラメータ) を使う。
    channel_axis = 1 if backend.image_data_format() == "channels_first" else -1
    pointwise_conv_filters = int(pointwise_conv_filters * alpha)

    if strides == (1, 1):
        x = inputs
    else:
        x = layers.ZeroPadding2D(((0, 1), (0, 1)), name="conv_pad_%d" % block_id )(inputs)

    # TIPS: ここで空間方向に対してのみの3x3 畳み込みを行う
    x = layers.DepthwiseConv2D(
        (3, 3),
        padding="same" if strides == (1, 1) else "valid",
        depth_multiplier=depth_multiplier,
        strides=strides,
        use_bias=False,
        name="conv_dw_%d" % block_id,
    )(x)

    # 活性化関数前に バッチの正規化で勾配消失・爆発を抑止
    x = layers.BatchNormalization(axis=channel_axis, name="conv_dw_%d_bn" % block_id)(x)

    # ReLU6 : 6を上限としてそれ以上は6扱い。
    x = layers.ReLU(6.0, name="conv_dw_%d_relu" % block_id)(x)

    # TIPS: 1x1 畳み込みでチャンネル数を元に戻す。
    x = layers.Conv2D( pointwise_conv_filters, (1, 1), padding="same",use_bias=False, strides=(1, 1), name="conv_pw_%d" % block_id, )(x)

    
    # 活性化関数前に バッチの正規化で勾配消失・爆発を抑止
    x = layers.BatchNormalization(axis=channel_axis, name="conv_pw_%d_bn" % block_id)(x)

    # ReLU6 : 6を上限としてそれ以上は6扱い。
    return layers.ReLU(6.0, name="conv_pw_%d_relu" % block_id)(x)


@keras_export("keras.applications.mobilenet.preprocess_input")
def preprocess_input(x, data_format=None):
    return imagenet_utils.preprocess_input(
        x, data_format=data_format, mode="tf"
    )

@keras_export("keras.applications.mobilenet.decode_predictions")
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)


preprocess_input.__doc__ = imagenet_utils.PREPROCESS_INPUT_DOC.format(
    mode="",
    ret=imagenet_utils.PREPROCESS_INPUT_RET_DOC_TF,
    error=imagenet_utils.PREPROCESS_INPUT_ERROR_DOC,
)
decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__
```

MobileNetでは ReLU6 が使われている。これは6よりも大きい値は6に止め、勾配爆発を防いでいる。

後続のMobileNetV3では、より高性能なh-swishを使っている。更にSE層も加わりより重要なチャンネルの選別もしている。

https://github.com/keras-team/keras/blob/master/keras/src/applications/mobilenet_v3.py


```
import warnings

from keras.src import backend
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

BASE_WEIGHT_PATH = (
    "https://storage.googleapis.com/tensorflow/keras-applications/mobilenet_v3/"
)
WEIGHTS_HASHES = {
    "large_224_0.75_float": (
        "765b44a33ad4005b3ac83185abf1d0eb",
        "40af19a13ebea4e2ee0c676887f69a2e",
    ),
    "large_224_1.0_float": (
        "59e551e166be033d707958cf9e29a6a7",
        "07fb09a5933dd0c8eaafa16978110389",
    ),
    "large_minimalistic_224_1.0_float": (
        "675e7b876c45c57e9e63e6d90a36599c",
        "ec5221f64a2f6d1ef965a614bdae7973",
    ),
    "small_224_0.75_float": (
        "cb65d4e5be93758266aa0a7f2c6708b7",
        "ebdb5cc8e0b497cd13a7c275d475c819",
    ),
    "small_224_1.0_float": (
        "8768d4c2e7dee89b9d02b2d03d65d862",
        "d3e8ec802a04aa4fc771ee12a9a9b836",
    ),
    "small_minimalistic_224_1.0_float": (
        "99cd97fb2fcdad2bf028eb838de69e37",
        "cde8136e733e811080d9fcd8a252f7e4",
    ),
}


BASE_DOCSTRING = "省略"

# MobileNet V3本体
def MobileNetV3(
    stack_fn,
    last_point_ch,
    input_shape=None,
    alpha=1.0,
    model_type="large",
    minimalistic=False,
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    classes=1000,
    pooling=None,
    dropout_rate=0.2,
    classifier_activation="softmax",
    include_preprocessing=True,
    name=None,
):

    # 入力値のバリデーション
    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), `imagenet` "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded.  "
            f"Received weights={weights}"
        )

    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            'If using `weights="imagenet"` with `include_top` '
            "as true, `classes` should be 1000.  "
            f"Received classes={classes}"
        )

    if input_shape is not None and input_tensor is not None:
        try:
            is_input_t_tensor = backend.is_keras_tensor(input_tensor)
        except ValueError:
            try:
                is_input_t_tensor = backend.is_keras_tensor(
                    operation_utils.get_source_inputs(input_tensor)
                )
            except ValueError:
                raise ValueError(
                    "input_tensor: ",
                    input_tensor,
                    "is not type input_tensor.  "
                    f"Received type(input_tensor)={type(input_tensor)}",
                )
        if is_input_t_tensor:
            if backend.image_data_format() == "channels_first":
                if input_tensor.shape[1] != input_shape[1]:
                    raise ValueError(
                        "When backend.image_data_format()=channels_first, "
                        "input_shape[1] must equal "
                        "input_tensor.shape[1].  Received "
                        f"input_shape={input_shape}, "
                        "input_tensor.shape="
                        f"{input_tensor.shape}"
                    )
            else:
                if input_tensor.shape[2] != input_shape[1]:
                    raise ValueError(
                        "input_shape[1] must equal "
                        "input_tensor.shape[2].  Received "
                        f"input_shape={input_shape}, "
                        "input_tensor.shape="
                        f"{input_tensor.shape}"
                    )
        else:
            raise ValueError(
                "input_tensor specified: ",
                input_tensor,
                "is not a keras tensor",
            )

    # 入力値のバリデーション


    # 入力値の扱い
    if input_shape is None and input_tensor is not None:
        try:
            backend.is_keras_tensor(input_tensor)
        except ValueError:
            raise ValueError(
                "input_tensor: ",
                input_tensor,
                "is type: ",
                type(input_tensor),
                "which is not a valid type",
            )

        if backend.is_keras_tensor(input_tensor):
            if backend.image_data_format() == "channels_first":
                rows = input_tensor.shape[2]
                cols = input_tensor.shape[3]
                input_shape = (3, cols, rows)
            else:
                rows = input_tensor.shape[1]
                cols = input_tensor.shape[2]
                input_shape = (cols, rows, 3)
    # If input_shape is None and input_tensor is None using standard shape
    if input_shape is None and input_tensor is None:
        if backend.image_data_format() == "channels_last":
            input_shape = (None, None, 3)
        else:
            input_shape = (3, None, None)

    if backend.image_data_format() == "channels_last":
        row_axis, col_axis = (0, 1)
    else:
        row_axis, col_axis = (1, 2)
    rows = input_shape[row_axis]
    cols = input_shape[col_axis]
    if rows and cols and (rows < 32 or cols < 32):
        raise ValueError(
            "Input size must be at least 32x32; Received `input_shape="
            f"{input_shape}`"
        )
    if weights == "imagenet":
        if (
            not minimalistic
            and alpha not in [0.75, 1.0]
            or minimalistic
            and alpha != 1.0
        ):
            raise ValueError(
                "If imagenet weights are being loaded, "
                "alpha can be one of `0.75`, `1.0` for non minimalistic "
                "or `1.0` for minimalistic only."
            )

        if rows != cols or rows != 224:
            warnings.warn(
                "`input_shape` is undefined or non-square, "
                "or `rows` is not 224. "
                "Weights for input shape (224, 224) will be "
                "loaded as the default.",
                stacklevel=2,
            )

    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor

    # 入力値の扱い


    channel_axis = 1 if backend.image_data_format() == "channels_first" else -1

    if minimalistic:
        kernel = 3
        activation = relu
        se_ratio = None
    else:
        kernel = 5
        activation = hard_swish
        se_ratio = 0.25

    x = img_input
    if include_preprocessing:
        x = layers.Rescaling(scale=1.0 / 127.5, offset=-1.0)(x)


    # 3x3畳み込みとバッチ正規化。
    x = layers.Conv2D(16,kernel_size=3,strides=(2, 2),padding="same",use_bias=False,name="conv",)(x)
    x = layers.BatchNormalization(axis=channel_axis, epsilon=1e-3, momentum=0.999, name="conv_bn")(x)
    x = activation(x)

    x = stack_fn(x, kernel, activation, se_ratio)

    last_conv_ch = _depth(x.shape[channel_axis] * 6)
    
    # α値(チャンネル数を調整するハイパーパラメータ)でチャンネル削減
    if alpha > 1.0:
        last_point_ch = _depth(last_point_ch * alpha)

    x = layers.Conv2D(last_conv_ch,kernel_size=1,padding="same",use_bias=False,name="conv_1",)(x)
    x = layers.BatchNormalization(axis=channel_axis, epsilon=1e-3, momentum=0.999, name="conv_1_bn")(x)
    x = activation(x)

    if include_top:
        x = layers.GlobalAveragePooling2D(keepdims=True)(x)
        x = layers.Conv2D(last_point_ch,kernel_size=1,padding="same",use_bias=True,name="conv_2", )(x)
        x = activation(x)

        if dropout_rate > 0:
            x = layers.Dropout(dropout_rate)(x)

        x = layers.Conv2D(classes, kernel_size=1, padding="same", name="logits")(x)
        x = layers.Flatten()(x)
        imagenet_utils.validate_activation(classifier_activation, weights)
        x = layers.Activation(activation=classifier_activation, name="predictions")(x)

    else:
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D(name="max_pool")(x)

    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input


    # モデルを作る
    model = Functional(inputs, x, name=name)


    # 重みの読み込み
    if weights == "imagenet":
        model_name = "{}{}_224_{}_float".format(model_type, "_minimalistic" if minimalistic else "", str(alpha))
        if include_top:
            file_name = f"weights_mobilenet_v3_{model_name}.h5"
            file_hash = WEIGHTS_HASHES[model_name][0]
        else:
            file_name = f"weights_mobilenet_v3_{model_name}_no_top_v2.h5"
            file_hash = WEIGHTS_HASHES[model_name][1]

        weights_path = file_utils.get_file(file_name,BASE_WEIGHT_PATH + file_name,cache_subdir="models",file_hash=file_hash,)
        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)



    return model


# MobileNet の小型仕様。インバーテッド残差構造を呼び出したあと、MobileNetV3本体を呼び出す。
@keras_export("keras.applications.MobileNetV3Small")
def MobileNetV3Small(
    input_shape=None,
    alpha=1.0,
    minimalistic=False,
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    classes=1000,
    pooling=None,
    dropout_rate=0.2,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="MobileNetV3Small",
):
    def stack_fn(x, kernel, activation, se_ratio):
        def depth(d):
            return _depth(d * alpha)

        x = _inverted_res_block(x, 1, depth(16), 3, 2, se_ratio, relu, 0)
        x = _inverted_res_block(x, 72.0 / 16, depth(24), 3, 2, None, relu, 1)
        x = _inverted_res_block(x, 88.0 / 24, depth(24), 3, 1, None, relu, 2)
        x = _inverted_res_block(x, 4, depth(40), kernel, 2, se_ratio, activation, 3)
        x = _inverted_res_block(x, 6, depth(40), kernel, 1, se_ratio, activation, 4)
        x = _inverted_res_block(x, 6, depth(40), kernel, 1, se_ratio, activation, 5)
        x = _inverted_res_block(x, 3, depth(48), kernel, 1, se_ratio, activation, 6)
        x = _inverted_res_block(x, 3, depth(48), kernel, 1, se_ratio, activation, 7)
        x = _inverted_res_block(x, 6, depth(96), kernel, 2, se_ratio, activation, 8)
        x = _inverted_res_block(x, 6, depth(96), kernel, 1, se_ratio, activation, 9)
        x = _inverted_res_block(x, 6, depth(96), kernel, 1, se_ratio, activation, 10)

        return x

    return MobileNetV3(
        stack_fn,
        1024,
        input_shape,
        alpha,
        "small",
        minimalistic,
        include_top,
        weights,
        input_tensor,
        classes,
        pooling,
        dropout_rate,
        classifier_activation,
        include_preprocessing,
        name=name,
    )


# MobileNet の大型仕様。インバーテッド残差構造を呼び出したあと、MobileNetV3本体を呼び出す。
@keras_export("keras.applications.MobileNetV3Large")
def MobileNetV3Large(
    input_shape=None,
    alpha=1.0,
    minimalistic=False,
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    classes=1000,
    pooling=None,
    dropout_rate=0.2,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="MobileNetV3Large",
):
    def stack_fn(x, kernel, activation, se_ratio):
        def depth(d):
            return _depth(d * alpha)

        x = _inverted_res_block(x, 1, depth(16), 3, 1, None, relu, 0)
        x = _inverted_res_block(x, 4, depth(24), 3, 2, None, relu, 1)
        x = _inverted_res_block(x, 3, depth(24), 3, 1, None, relu, 2)
        x = _inverted_res_block(x, 3, depth(40), kernel, 2, se_ratio, relu, 3)
        x = _inverted_res_block(x, 3, depth(40), kernel, 1, se_ratio, relu, 4)
        x = _inverted_res_block(x, 3, depth(40), kernel, 1, se_ratio, relu, 5)
        x = _inverted_res_block(x, 6, depth(80), 3, 2, None, activation, 6)
        x = _inverted_res_block(x, 2.5, depth(80), 3, 1, None, activation, 7)
        x = _inverted_res_block(x, 2.3, depth(80), 3, 1, None, activation, 8)
        x = _inverted_res_block(x, 2.3, depth(80), 3, 1, None, activation, 9)
        x = _inverted_res_block(x, 6, depth(112), 3, 1, se_ratio, activation, 10)
        x = _inverted_res_block(x, 6, depth(112), 3, 1, se_ratio, activation, 11)
        x = _inverted_res_block(x, 6, depth(160), kernel, 2, se_ratio, activation, 12)
        x = _inverted_res_block(x, 6, depth(160), kernel, 1, se_ratio, activation, 13)
        x = _inverted_res_block(x, 6, depth(160), kernel, 1, se_ratio, activation, 14)

        return x

    return MobileNetV3(
        stack_fn,
        1280,
        input_shape,
        alpha,
        "large",
        minimalistic,
        include_top,
        weights,
        input_tensor,
        classes,
        pooling,
        dropout_rate,
        classifier_activation,
        include_preprocessing,
        name=name,
    )


MobileNetV3Small.__doc__ = BASE_DOCSTRING.format(name="MobileNetV3Small")
MobileNetV3Large.__doc__ = BASE_DOCSTRING.format(name="MobileNetV3Large")


def relu(x):
    return layers.ReLU()(x)


def hard_sigmoid(x):
    return layers.ReLU(6.0)(x + 3.0) * (1.0 / 6.0)

# ReLU6にとって変わった h-swish 
def hard_swish(x):
    return layers.Activation("hard_swish")(x)


# α値によってチャンネルを削減する関数。すべての層に0.5、0.75を掛けて一律に減らす。
def _depth(v, divisor=8, min_value=None):
    if min_value is None:
        min_value = divisor
    new_v = max(min_value, int(v + divisor / 2) // divisor * divisor)
    # Make sure that round down does not go down by more than 10%.
    if new_v < 0.9 * v:
        new_v += divisor
    return new_v


# これがSE層。チャンネルごとに重要度を取り決めている。
def _se_block(inputs, filters, se_ratio, prefix):
    # GAP でサイズの縮小+特徴抽出
    x = layers.GlobalAveragePooling2D(keepdims=True, name=f"{prefix}squeeze_excite_avg_pool")(inputs)

    # 1x1畳み込みでチャンネル調整。ReLUで活性化
    x = layers.Conv2D(_depth(filters * se_ratio),kernel_size=1,padding="same",name=f"{prefix}squeeze_excite_conv",)(x)
    x = layers.ReLU(name=f"{prefix}squeeze_excite_relu")(x)

    # 1x1畳み込みでチャンネル調整 h-sigmoid で活性化
    x = layers.Conv2D(filters,kernel_size=1,padding="same",name=f"{prefix}squeeze_excite_conv_1",)(x)
    x = hard_sigmoid(x)

    # 重要度によるフィルタリング(スケーリング)。各チャンネルの重要度を 0.0 ~ 1.0 の範囲で算出をする。
    x = layers.Multiply(name=f"{prefix}squeeze_excite_mul")([inputs, x])

    return x


# インバーテッド残差構造 (MobileNetV2から登場) 
# 1x1(pointwise) でチャンネル増やし、depthwise で 空間畳み込み、1x1でチャンネル戻す。
def _inverted_res_block(x, expansion, filters, kernel_size, stride, se_ratio, activation, block_id):

    channel_axis = 1 if backend.image_data_format() == "channels_first" else -1
    shortcut = x
    prefix = "expanded_conv_"
    infilters = x.shape[channel_axis]

    if block_id:
        # ここでチャンネル拡張
        prefix = f"expanded_conv_{block_id}_"
        x = layers.Conv2D(_depth(infilters * expansion),kernel_size=1,padding="same",use_bias=False,name=f"{prefix}expand",)(x)
        x = layers.BatchNormalization(axis=channel_axis,epsilon=1e-3,momentum=0.999,name=f"{prefix}expand_bn",)(x)

        x = activation(x)

    if stride == 2:
        x = layers.ZeroPadding2D(padding=imagenet_utils.correct_pad(x, kernel_size),name=f"{prefix}depthwise_pad",)(x)

    # depthwise で空間方向に畳み込み
    x = layers.DepthwiseConv2D(kernel_size,strides=stride,padding="same" if stride == 1 else "valid",use_bias=False,name=f"{prefix}depthwise",)(x)
    x = layers.BatchNormalization(axis=channel_axis,epsilon=1e-3,momentum=0.999,name=f"{prefix}depthwise_bn",)(x)
    x = activation(x)

    # ここでSE層を呼び出しチャンネルの重要度を考慮して 0.0 ~ 1.0 の範囲で算出
    if se_ratio:
        x = _se_block(x, _depth(infilters * expansion), se_ratio, prefix)

    # 重要度を考慮してのチャンネル削減
    x = layers.Conv2D(filters,kernel_size=1,padding="same",use_bias=False,name=f"{prefix}project",)(x)
    x = layers.BatchNormalization(axis=channel_axis,epsilon=1e-3,momentum=0.999,name=f"{prefix}project_bn",)(x)

    # 解像度とチャンネル数が変わっていない場合に限り、残差接続を行う。
    if stride == 1 and infilters == filters:
        x = layers.Add(name=f"{prefix}add")([shortcut, x])

    return x


@keras_export("keras.applications.mobilenet_v3.preprocess_input")
def preprocess_input(x, data_format=None):
    return x


@keras_export("keras.applications.mobilenet_v3.decode_predictions")
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)


decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__
```

## DenseNet

DenseNetは残差接続ではなく、結合によって入力値をそのまま後続に引き渡す。残差接続と違って、情報をロスなく引き継ぐことができる。だが、メモリ消費量が多い。これがDense Blockである。

この値の結合時、各層でどれぐらいのチャンネルを生成するかが問題になる。成長率(k)で調整を行う。チャンネルを増やしすぎれば幅は太くなり表現力は増すが、計算コストは一気に増える。

結合を繰り返すことでチャンネル数はどんどん増えていくため、適度に削減をしなければならない。これがTransition Layerである。1x1畳み込みと2x2平均プーリングを使う。

DenseNetはこのDenseBlockとTransitionLayerの2つで作られている。

https://github.com/keras-team/keras/blob/master/keras/src/applications/densenet.py



```
from keras.src import backend
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

BASE_WEIGHTS_PATH = ("https://storage.googleapis.com/tensorflow/keras-applications/densenet/")
DENSENET121_WEIGHT_PATH = (f"{BASE_WEIGHTS_PATH}densenet121_weights_tf_dim_ordering_tf_kernels.h5")
DENSENET121_WEIGHT_PATH_NO_TOP = (f"{BASE_WEIGHTS_PATH}"
    "densenet121_weights_tf_dim_ordering_tf_kernels_notop.h5")
DENSENET169_WEIGHT_PATH = (f"{BASE_WEIGHTS_PATH}densenet169_weights_tf_dim_ordering_tf_kernels.h5")
DENSENET169_WEIGHT_PATH_NO_TOP = (f"{BASE_WEIGHTS_PATH}"
    "densenet169_weights_tf_dim_ordering_tf_kernels_notop.h5")
DENSENET201_WEIGHT_PATH = (f"{BASE_WEIGHTS_PATH}densenet201_weights_tf_dim_ordering_tf_kernels.h5")
DENSENET201_WEIGHT_PATH_NO_TOP = (f"{BASE_WEIGHTS_PATH}"
    "densenet201_weights_tf_dim_ordering_tf_kernels_notop.h5")


# DenseBlockで入力値を結合して後続の層に引き渡す。
def dense_block(x, blocks, name):
    for i in range(blocks):
        x = conv_block(x, 32, name=f"{name}_block{i + 1}")
    return x


# TransitionLayer で チャンネル数を削減する。
def transition_block(x, reduction, name):
    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1

    # バッチ正規化とReLU
    x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_bn")(x)
    x = layers.Activation("relu", name=f"{name}_relu")(x)

    # 1x1でチャンネル圧縮、平均プーリングで空間圧縮
    x = layers.Conv2D(int(x.shape[bn_axis] * reduction),1,use_bias=False,name=f"{name}_conv", )(x)
    x = layers.AveragePooling2D(2, strides=2, name=f"{name}_pool")(x)

    return x


def conv_block(x, growth_rate, name):

    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1
    x1 = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_0_bn")(x)
    x1 = layers.Activation("relu", name=f"{name}_0_relu")(x1)
    x1 = layers.Conv2D(4 * growth_rate, 1, use_bias=False, name=f"{name}_1_conv")(x1)
    x1 = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name=f"{name}_1_bn")(x1)
    x1 = layers.Activation("relu", name=f"{name}_1_relu")(x1)
    x1 = layers.Conv2D(growth_rate, 3, padding="same", use_bias=False, name=f"{name}_2_conv")(x1)
    x = layers.Concatenate(axis=bn_axis, name=f"{name}_concat")([x, x1])
    return x


def DenseNet(
    blocks,
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="densenet",
):

    if backend.image_data_format() == "channels_first":
        raise ValueError(
            "DenseNet does not support the `channels_first` image data "
            "format. Switch to `channels_last` by editing your local "
            "config file at ~/.keras/keras.json"
        )
    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), `imagenet` "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded."
        )

    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            'If using `weights` as `"imagenet"` with `include_top`'
            " as true, `classes` should be 1000"
        )

    # Determine proper input shape
    input_shape = imagenet_utils.obtain_input_shape(
        input_shape,
        default_size=224,
        min_size=32,
        data_format=backend.image_data_format(),
        require_flatten=include_top,
        weights=weights,
    )

    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor

    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1

    x = layers.ZeroPadding2D(padding=((3, 3), (3, 3)))(img_input)
    x = layers.Conv2D(64, 7, strides=2, use_bias=False, name="conv1_conv")(x)
    x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name="conv1_bn")(x)
    x = layers.Activation("relu", name="conv1_relu")(x)
    x = layers.ZeroPadding2D(padding=((1, 1), (1, 1)))(x)
    x = layers.MaxPooling2D(3, strides=2, name="pool1")(x)

    # DenseBlock(結合)とTransitionLayer(チャンネル削減)の繰り返し
    x = dense_block(x, blocks[0], name="conv2")
    x = transition_block(x, 0.5, name="pool2")
    x = dense_block(x, blocks[1], name="conv3")
    x = transition_block(x, 0.5, name="pool3")
    x = dense_block(x, blocks[2], name="conv4")
    x = transition_block(x, 0.5, name="pool4")
    x = dense_block(x, blocks[3], name="conv5")

    x = layers.BatchNormalization(axis=bn_axis, epsilon=1.001e-5, name="bn")(x)
    x = layers.Activation("relu", name="relu")(x)

    if include_top:
        x = layers.GlobalAveragePooling2D(name="avg_pool")(x)

        imagenet_utils.validate_activation(classifier_activation, weights)
        x = layers.Dense(
            classes, activation=classifier_activation, name="predictions"
        )(x)
    else:
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D(name="max_pool")(x)

    # 入力値の扱い
    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input

    # モデル作成
    model = Functional(inputs, x, name=name)


    # 重みの読み込み
    if weights == "imagenet":
        if include_top:
            if blocks == [6, 12, 24, 16]:
                weights_path = file_utils.get_file(
                    "densenet121_weights_tf_dim_ordering_tf_kernels.h5",
                    DENSENET121_WEIGHT_PATH,
                    cache_subdir="models",
                    file_hash="9d60b8095a5708f2dcce2bca79d332c7",
                )
            elif blocks == [6, 12, 32, 32]:
                weights_path = file_utils.get_file(
                    "densenet169_weights_tf_dim_ordering_tf_kernels.h5",
                    DENSENET169_WEIGHT_PATH,
                    cache_subdir="models",
                    file_hash="d699b8f76981ab1b30698df4c175e90b",
                )
            elif blocks == [6, 12, 48, 32]:
                weights_path = file_utils.get_file(
                    "densenet201_weights_tf_dim_ordering_tf_kernels.h5",
                    DENSENET201_WEIGHT_PATH,
                    cache_subdir="models",
                    file_hash="1ceb130c1ea1b78c3bf6114dbdfd8807",
                )
            else:
                raise ValueError("weights_path undefined")
        else:
            if blocks == [6, 12, 24, 16]:
                weights_path = file_utils.get_file(
                    "densenet121_weights_tf_dim_ordering_tf_kernels_notop.h5",
                    DENSENET121_WEIGHT_PATH_NO_TOP,
                    cache_subdir="models",
                    file_hash="30ee3e1110167f948a6b9946edeeb738",
                )
            elif blocks == [6, 12, 32, 32]:
                weights_path = file_utils.get_file(
                    "densenet169_weights_tf_dim_ordering_tf_kernels_notop.h5",
                    DENSENET169_WEIGHT_PATH_NO_TOP,
                    cache_subdir="models",
                    file_hash="b8c4d4c20dd625c148057b9ff1c1176b",
                )
            elif blocks == [6, 12, 48, 32]:
                weights_path = file_utils.get_file(
                    "densenet201_weights_tf_dim_ordering_tf_kernels_notop.h5",
                    DENSENET201_WEIGHT_PATH_NO_TOP,
                    cache_subdir="models",
                    file_hash="c13680b51ded0fb44dff2d8f86ac8bb1",
                )
            else:
                raise ValueError("weights_path undefined")
        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)

    return model


@keras_export(
    [
        "keras.applications.densenet.DenseNet121",
        "keras.applications.DenseNet121",
    ]
)
def DenseNet121(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="densenet121",
):
    """Instantiates the Densenet121 architecture."""
    return DenseNet(
        [6, 12, 24, 16],
        include_top,
        weights,
        input_tensor,
        input_shape,
        pooling,
        classes,
        classifier_activation,
        name=name,
    )


@keras_export(
    [
        "keras.applications.densenet.DenseNet169",
        "keras.applications.DenseNet169",
    ]
)
def DenseNet169(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="densenet169",
):
    """Instantiates the Densenet169 architecture."""
    return DenseNet(
        [6, 12, 32, 32],
        include_top,
        weights,
        input_tensor,
        input_shape,
        pooling,
        classes,
        classifier_activation,
        name=name,
    )


@keras_export(
    [
        "keras.applications.densenet.DenseNet201",
        "keras.applications.DenseNet201",
    ]
)
def DenseNet201(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="densenet201",
):
    """Instantiates the Densenet201 architecture."""
    return DenseNet(
        [6, 12, 48, 32],
        include_top,
        weights,
        input_tensor,
        input_shape,
        pooling,
        classes,
        classifier_activation,
        name=name,
    )


@keras_export("keras.applications.densenet.preprocess_input")
def preprocess_input(x, data_format=None):
    return imagenet_utils.preprocess_input(
        x, data_format=data_format, mode="torch"
    )


@keras_export("keras.applications.densenet.decode_predictions")
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)


preprocess_input.__doc__ = imagenet_utils.PREPROCESS_INPUT_DOC.format(
    mode="",
    ret=imagenet_utils.PREPROCESS_INPUT_RET_DOC_TORCH,
    error=imagenet_utils.PREPROCESS_INPUT_ERROR_DOC,
)
decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__

DOC = "省略"

if DenseNet121.__doc__ is not None:
    setattr(DenseNet121, "__doc__", DenseNet121.__doc__ + DOC)
if DenseNet169.__doc__ is not None:
    setattr(DenseNet169, "__doc__", DenseNet169.__doc__ + DOC)
if DenseNet201.__doc__ is not None:
    setattr(DenseNet201, "__doc__", DenseNet201.__doc__ + DOC)
```







## EfficientNet

EfficientNetは幅と深さと解像度を考慮してスケールする。

下記コードの末端には、B0~B7まで、Width, Depth, Resolution の3つをそれぞれ指定し、最適なものを用意している。

https://github.com/keras-team/keras/blob/master/keras/src/applications/efficientnet.py

この無印のEfficientNetはMobileNetV3のリニアボトルネック、インバーテッド残差構造をそのまま利用している。

つまり、EfficientNetとMobileNetV3の大まかな違いは、スケールしているか否かの違いぐらいでそれ以外はほぼ同じようなもの。

```
import copy
import math

from keras.src import backend
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

BASE_WEIGHTS_PATH = "https://storage.googleapis.com/keras-applications/"

WEIGHTS_HASHES = {
    "b0": (
        "902e53a9f72be733fc0bcb005b3ebbac",
        "50bc09e76180e00e4465e1a485ddc09d",
    ),
    "b1": (
        "1d254153d4ab51201f1646940f018540",
        "74c4e6b3e1f6a1eea24c589628592432",
    ),
    "b2": (
        "b15cce36ff4dcbd00b6dd88e7857a6ad",
        "111f8e2ac8aa800a7a99e3239f7bfb39",
    ),
    "b3": (
        "ffd1fdc53d0ce67064dc6a9c7960ede0",
        "af6d107764bb5b1abb91932881670226",
    ),
    "b4": (
        "18c95ad55216b8f92d7e70b3a046e2fc",
        "ebc24e6d6c33eaebbd558eafbeedf1ba",
    ),
    "b5": (
        "ace28f2a6363774853a83a0b21b9421a",
        "38879255a25d3c92d5e44e04ae6cec6f",
    ),
    "b6": (
        "165f6e37dce68623721b423839de8be5",
        "9ecce42647a20130c1f39a5d4cb75743",
    ),
    "b7": (
        "8c03f828fec3ef71311cd463b6759d99",
        "cbcfe4450ddf6f3ad90b1b398090fe4a",
    ),
}

DEFAULT_BLOCKS_ARGS = [
{ "kernel_size": 3,"repeats": 1,"filters_in": 32,"filters_out": 16,"expand_ratio": 1,"id_skip": True,"strides": 1,"se_ratio": 0.25, },
{ "kernel_size": 3,"repeats": 2,"filters_in": 16,"filters_out": 24,"expand_ratio": 6,"id_skip": True,"strides": 2,"se_ratio": 0.25,},
{ "kernel_size": 5,"repeats": 2,"filters_in": 24,"filters_out": 40,"expand_ratio": 6,"id_skip": True,"strides": 2,"se_ratio": 0.25,},
{ "kernel_size": 3,"repeats": 3,"filters_in": 40,"filters_out": 80,"expand_ratio": 6,"id_skip": True,"strides": 2,"se_ratio": 0.25,},
{ "kernel_size": 5,"repeats": 3,"filters_in": 80,"filters_out": 112,"expand_ratio": 6,"id_skip": True,"strides": 1,"se_ratio": 0.25,},
{ "kernel_size": 5,"repeats": 4,"filters_in": 112,"filters_out": 192,"expand_ratio": 6,"id_skip": True,"strides": 2,"se_ratio": 0.25,},
{ "kernel_size": 3,"repeats": 1,"filters_in": 192,"filters_out": 320,"expand_ratio": 6,"id_skip": True,"strides": 1,"se_ratio": 0.25,},
]

CONV_KERNEL_INITIALIZER = {
    "class_name": "VarianceScaling",
    "config": {
        "scale": 2.0,
        "mode": "fan_out",
        "distribution": "truncated_normal",
    },
}

DENSE_KERNEL_INITIALIZER = {
    "class_name": "VarianceScaling",
    "config": {
        "scale": 1.0 / 3.0,
        "mode": "fan_out",
        "distribution": "uniform",
    },
}

BASE_DOCSTRING = "省略"
IMAGENET_STDDEV_RGB = [0.229, 0.224, 0.225]


# EfficientNet の本体
def EfficientNet(width_coefficient,depth_coefficient,default_size,dropout_rate=0.2,drop_connect_rate=0.2,depth_divisor=8,activation="swish",blocks_args="default",name="efficientnet",include_top=True,weights="imagenet",input_tensor=None,input_shape=None,pooling=None,classes=1000,classifier_activation="softmax",weights_name=None,):


    # 引数のバリデーション
    if blocks_args == "default":
        blocks_args = DEFAULT_BLOCKS_ARGS

    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), `imagenet` "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded."
        )

    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            'If using `weights="imagenet"` with `include_top`'
            " as true, `classes` should be 1000"
        )

    # 引数のバリデーション


    # 入力値の扱い
    input_shape = imagenet_utils.obtain_input_shape(
        input_shape,
        default_size=default_size,
        min_size=32,
        data_format=backend.image_data_format(),
        require_flatten=include_top,
        weights=weights,
    )

    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor

    # 入力値の扱い

    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1

    def round_filters(filters, divisor=depth_divisor):
        """Round number of filters based on depth multiplier."""
        filters *= width_coefficient
        new_filters = max(divisor, int(filters + divisor / 2) // divisor * divisor)
        # Make sure that round down does not go down by more than 10%.
        if new_filters < 0.9 * filters:
            new_filters += divisor
        return int(new_filters)

    def round_repeats(repeats):
        """Round number of repeats based on depth multiplier."""
        return int(math.ceil(depth_coefficient * repeats))


    # Build stem
    x = img_input
    x = layers.Rescaling(1.0 / 255.0)(x)
    x = layers.Normalization(axis=bn_axis)(x)

    if weights == "imagenet":
        x = layers.Rescaling([1.0 / math.sqrt(stddev) for stddev in IMAGENET_STDDEV_RGB])(x)

    x = layers.ZeroPadding2D(padding=imagenet_utils.correct_pad(x, 3), name="stem_conv_pad")(x)
    x = layers.Conv2D(round_filters(32),3,strides=2,padding="valid",use_bias=False,kernel_initializer=CONV_KERNEL_INITIALIZER,name="stem_conv",)(x)
    x = layers.BatchNormalization(axis=bn_axis, name="stem_bn")(x)
    x = layers.Activation(activation, name="stem_activation")(x)

    # Build blocks
    blocks_args = copy.deepcopy(blocks_args)

    b = 0
    blocks = float(sum(round_repeats(args["repeats"]) for args in blocks_args))
    for i, args in enumerate(blocks_args):
        if args["repeats"] <= 0:
            raise ValueError(
                f"The number of repeats in `EfficientNet` must be > 0. "
                f"Received: repeats={args['repeats']}"
            )
        # Update block input and output filters based on depth multiplier.
        args["filters_in"] = round_filters(args["filters_in"])
        args["filters_out"] = round_filters(args["filters_out"])

        for j in range(round_repeats(args.pop("repeats"))):
            # The first block needs to take care of stride and filter size
            # increase.
            if j > 0:
                args["strides"] = 1
                args["filters_in"] = args["filters_out"]
            x = block(x,activation,drop_connect_rate * b / blocks,name=f"block{i + 1}{chr(j + 97)}_",**args,)
            b += 1

    x = layers.Conv2D(round_filters(1280),1,padding="same",use_bias=False,kernel_initializer=CONV_KERNEL_INITIALIZER,name="top_conv",)(x)
    x = layers.BatchNormalization(axis=bn_axis, name="top_bn")(x)
    x = layers.Activation(activation, name="top_activation")(x)

    if include_top:
        x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
        if dropout_rate > 0:
            x = layers.Dropout(dropout_rate, name="top_dropout")(x)

        imagenet_utils.validate_activation(classifier_activation, weights)
        x = layers.Dense(classes,activation=classifier_activation,kernel_initializer=DENSE_KERNEL_INITIALIZER,name="predictions",)(x)
    else:
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D(name="max_pool")(x)


    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input


    # モデルを作る
    model = Functional(inputs, x, name=name)

    # 重みをロード
    if weights == "imagenet":
        if include_top:
            file_suffix = ".h5"
            file_hash = WEIGHTS_HASHES[weights_name][0]
        else:
            file_suffix = "_notop.h5"
            file_hash = WEIGHTS_HASHES[weights_name][1]
        file_name = name + file_suffix
        weights_path = file_utils.get_file(file_name,BASE_WEIGHTS_PATH + file_name,cache_subdir="models",file_hash=file_hash, )
        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)


    return model


# V2の MBConv とFusedMBConvに当たる。
# 下記BlockはMobileNetV3の仕組みとほぼ同じ。
def block(inputs,activation="swish",drop_rate=0.0,name="",filters_in=32,filters_out=16,kernel_size=3,strides=1,expand_ratio=1,se_ratio=0.0,id_skip=True,):

    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1
    
    # 1: 1x1畳み込みで チャンネル数を一気に増やす。
    filters = filters_in * expand_ratio
    if expand_ratio != 1:
        x = layers.Conv2D(filters,1,padding="same",use_bias=False,kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}expand_conv",)(inputs)
        x = layers.BatchNormalization(axis=bn_axis, name=f"{name}expand_bn")(x)
        x = layers.Activation(activation, name=f"{name}expand_activation")(x)
    else:
        x = inputs

    # 2: Depthwise で 空間方向にのみ畳み込みをする。
    if strides == 2:
        x = layers.ZeroPadding2D(
            padding=imagenet_utils.correct_pad(x, kernel_size),
            name=f"{name}dwconv_pad",
        )(x)
        conv_pad = "valid"
    else:
        conv_pad = "same"
    x = layers.DepthwiseConv2D(kernel_size,strides=strides,padding=conv_pad,use_bias=False,depthwise_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}dwconv",)(x)
    x = layers.BatchNormalization(axis=bn_axis, name=f"{name}bn")(x)
    x = layers.Activation(activation, name=f"{name}activation")(x)

    # 3: SE層(Squeeze and Excitation ) チャンネルの重要度を計測
    if 0 < se_ratio <= 1:
        filters_se = max(1, int(filters_in * se_ratio))
        se = layers.GlobalAveragePooling2D(name=f"{name}se_squeeze")(x)

        if bn_axis == 1:
            se_shape = (filters, 1, 1)
        else:
            se_shape = (1, 1, filters)

        se = layers.Reshape(se_shape, name=f"{name}se_reshape")(se)
        se = layers.Conv2D(filters_se,1,padding="same",activation=activation,kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}se_reduce",)(se)
        se = layers.Conv2D(filters,1,padding="same",activation="sigmoid",kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}se_expand",)(se)
        x = layers.multiply([x, se], name=f"{name}se_excite")

    # 4: 1x1畳み込みで重要度に応じてチャンネル数を圧縮する。
    x = layers.Conv2D(filters_out,1,padding="same",use_bias=False,kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}project_conv",)(x)
    x = layers.BatchNormalization(axis=bn_axis, name=f"{name}project_bn")(x)

    if id_skip and strides == 1 and filters_in == filters_out:
        if drop_rate > 0:
            x = layers.Dropout(drop_rate, noise_shape=(None, 1, 1, 1), name=f"{name}drop")(x)

        x = layers.add([x, inputs], name=f"{name}add")

    return x


# 以下、B0~B7までの定義。

@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB0",
        "keras.applications.EfficientNetB0",
    ]
)
def EfficientNetB0(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb0",
):
    return EfficientNet(
        1.0,
        1.0,
        224,
        0.2,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b0",
    )


@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB1",
        "keras.applications.EfficientNetB1",
    ]
)
def EfficientNetB1(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb1",
):
    return EfficientNet(
        1.0,
        1.1,
        240,
        0.2,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b1",
    )


@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB2",
        "keras.applications.EfficientNetB2",
    ]
)
def EfficientNetB2(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb2",
):
    return EfficientNet(
        1.1,
        1.2,
        260,
        0.3,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b2",
    )


@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB3",
        "keras.applications.EfficientNetB3",
    ]
)
def EfficientNetB3(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb3",
):
    return EfficientNet(
        1.2,
        1.4,
        300,
        0.3,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b3",
    )


@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB4",
        "keras.applications.EfficientNetB4",
    ]
)
def EfficientNetB4(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb4",
):
    return EfficientNet(
        1.4,
        1.8,
        380,
        0.4,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b4",
    )


@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB5",
        "keras.applications.EfficientNetB5",
    ]
)
def EfficientNetB5(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb5",
):
    return EfficientNet(
        1.6,
        2.2,
        456,
        0.4,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b5",
    )


@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB6",
        "keras.applications.EfficientNetB6",
    ]
)
def EfficientNetB6(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb6",
):
    return EfficientNet(
        1.8,
        2.6,
        528,
        0.5,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b6",
    )


@keras_export(
    [
        "keras.applications.efficientnet.EfficientNetB7",
        "keras.applications.EfficientNetB7",
    ]
)
def EfficientNetB7(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    name="efficientnetb7",
):
    return EfficientNet(
        2.0,
        3.1,
        600,
        0.5,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        weights_name="b7",
    )


EfficientNetB0.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB0")
EfficientNetB1.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB1")
EfficientNetB2.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB2")
EfficientNetB3.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB3")
EfficientNetB4.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB4")
EfficientNetB5.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB5")
EfficientNetB6.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB6")
EfficientNetB7.__doc__ = BASE_DOCSTRING.format(name="EfficientNetB7")

@keras_export("keras.applications.efficientnet.preprocess_input")
def preprocess_input(x, data_format=None):
    return x


@keras_export("keras.applications.efficientnet.decode_predictions")
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)


decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__
```

EfficientNetは、スケールしている点を除いてMobileNetV3とほぼ変わらず。

EfficientNetV2 からはMBConvとFusedMBConv の2つを導入し先ほどのblock関数の部分を2分している。

https://github.com/keras-team/keras/blob/master/keras/src/applications/efficientnet_v2.py



```
import copy
import math

from keras.src import backend
from keras.src import initializers
from keras.src import layers
from keras.src.api_export import keras_export
from keras.src.applications import imagenet_utils
from keras.src.models import Functional
from keras.src.ops import operation_utils
from keras.src.utils import file_utils

BASE_WEIGHTS_PATH = "https://storage.googleapis.com/tensorflow/keras-applications/efficientnet_v2/"  # noqa: E501

WEIGHTS_HASHES = {
    "b0": (
        "21ecbf6da12460d5c40bb2f29ceb2188",
        "893217f2bb855e2983157299931e43ff",
    ),
    "b1": (
        "069f0534ff22adf035c89e2d9547a9dc",
        "0e80663031ca32d657f9caa404b6ec37",
    ),
    "b2": (
        "424e49f28180edbde1e94797771950a7",
        "1dfe2e7a5d45b6632553a8961ea609eb",
    ),
    "b3": (
        "1f1fc43bd98a6e4fd8fdfd551e02c7a0",
        "f6abf7b5849ac99a89b50dd3fd532856",
    ),
    "-s": (
        "e1d88a8495beba45748fedd0cecbe016",
        "af0682fb74e8c54910f2d4393339c070",
    ),
    "-m": (
        "a3bf6aa3276309f4fc6a34aa114c95cd",
        "1b8dc055df72dde80d614482840fe342",
    ),
    "-l": (
        "27e6d408b53c7ebc868fefa357689935",
        "b0b66b5c863aef5b46e8608fe1711615",
    ),
}

DEFAULT_BLOCKS_ARGS = {
"efficientnetv2-s": [
{"kernel_size":3,"num_repeat":2,"input_filters":24,"output_filters":24,"expand_ratio":1,"se_ratio":0.0,"strides":1,"conv_type":1,},
{"kernel_size":3,"num_repeat":4,"input_filters":24,"output_filters":48,"expand_ratio":4,"se_ratio":0.0,"strides":2,"conv_type":1,},
{"conv_type":1,"expand_ratio":4,"input_filters":48,"kernel_size":3,"num_repeat":4,"output_filters":64,"se_ratio":0,"strides":2,},
{"conv_type":0,"expand_ratio":4,"input_filters":64,"kernel_size":3,"num_repeat":6,"output_filters":128,"se_ratio":0.25,"strides":2,},
{"conv_type":0,"expand_ratio":6,"input_filters":128,"kernel_size":3,"num_repeat":9,"output_filters":160,"se_ratio":0.25,"strides":1,},
{"conv_type":0,"expand_ratio":6,"input_filters":160,"kernel_size":3,"num_repeat":15,"output_filters":256,"se_ratio":0.25,"strides":2,},],
"efficientnetv2-m":[
{"kernel_size":3,"num_repeat":3,"input_filters":24,"output_filters":24,"expand_ratio":1,"se_ratio":0,"strides":1,"conv_type":1,},
{"kernel_size":3,"num_repeat":5,"input_filters":24,"output_filters":48,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":5,"input_filters":48,"output_filters":80,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":7,"input_filters":80,"output_filters":160,"expand_ratio":4,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":14,"input_filters":160,"output_filters":176,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},
{"kernel_size":3,"num_repeat":18,"input_filters":176,"output_filters":304,"expand_ratio":6,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":5,"input_filters":304,"output_filters":512,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},],
"efficientnetv2-l":[
{"kernel_size":3,"num_repeat":4,"input_filters":32,"output_filters":32,"expand_ratio":1,"se_ratio":0,"strides":1,"conv_type":1,},
{"kernel_size":3,"num_repeat":7,"input_filters":32,"output_filters":64,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":7,"input_filters":64,"output_filters":96,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":10,"input_filters":96,"output_filters":192,"expand_ratio":4,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":19,"input_filters":192,"output_filters":224,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},
{"kernel_size":3,"num_repeat":25,"input_filters":224,"output_filters":384,"expand_ratio":6,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":7,"input_filters":384,"output_filters":640,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},],
"efficientnetv2-b0":[
{"kernel_size":3,"num_repeat":1,"input_filters":32,"output_filters":16,"expand_ratio":1,"se_ratio":0,"strides":1,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":16,"output_filters":32,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":32,"output_filters":48,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":3,"input_filters":48,"output_filters":96,"expand_ratio":4,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":5,"input_filters":96,"output_filters":112,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},
{"kernel_size":3,"num_repeat":8,"input_filters":112,"output_filters":192,"expand_ratio":6,"se_ratio":0.25,"strides":2,"conv_type":0,},],
"efficientnetv2-b1":[
{"kernel_size":3,"num_repeat":1,"input_filters":32,"output_filters":16,"expand_ratio":1,"se_ratio":0,"strides":1,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":16,"output_filters":32,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":32,"output_filters":48,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":3,"input_filters":48,"output_filters":96,"expand_ratio":4,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":5,"input_filters":96,"output_filters":112,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},
{"kernel_size":3,"num_repeat":8,"input_filters":112,"output_filters":192,"expand_ratio":6,"se_ratio":0.25,"strides":2,"conv_type":0,},],
"efficientnetv2-b2":[
{"kernel_size":3,"num_repeat":1,"input_filters":32,"output_filters":16,"expand_ratio":1,"se_ratio":0,"strides":1,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":16,"output_filters":32,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":32,"output_filters":48,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":3,"input_filters":48,"output_filters":96,"expand_ratio":4,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":5,"input_filters":96,"output_filters":112,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},
{"kernel_size":3,"num_repeat":8,"input_filters":112,"output_filters":192,"expand_ratio":6,"se_ratio":0.25,"strides":2,"conv_type":0,},],
"efficientnetv2-b3":[
{"kernel_size":3,"num_repeat":1,"input_filters":32,"output_filters":16,"expand_ratio":1,"se_ratio":0,"strides":1,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":16,"output_filters":32,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":2,"input_filters":32,"output_filters":48,"expand_ratio":4,"se_ratio":0,"strides":2,"conv_type":1,},
{"kernel_size":3,"num_repeat":3,"input_filters":48,"output_filters":96,"expand_ratio":4,"se_ratio":0.25,"strides":2,"conv_type":0,},
{"kernel_size":3,"num_repeat":5,"input_filters":96,"output_filters":112,"expand_ratio":6,"se_ratio":0.25,"strides":1,"conv_type":0,},
{"kernel_size":3,"num_repeat":8,"input_filters":112,"output_filters":192,"expand_ratio":6,"se_ratio":0.25,"strides":2,"conv_type":0,},],}

CONV_KERNEL_INITIALIZER = {
    "class_name": "VarianceScaling",
    "config": {
        "scale": 2.0,
        "mode": "fan_out",
        "distribution": "truncated_normal",
    },
}

DENSE_KERNEL_INITIALIZER = {
    "class_name": "VarianceScaling",
    "config": {
        "scale": 1.0 / 3.0,
        "mode": "fan_out",
        "distribution": "uniform",
    },
}

BASE_DOCSTRING = "省略"

def round_filters(filters, width_coefficient, min_depth, depth_divisor):
    """Round number of filters based on depth multiplier."""
    filters *= width_coefficient
    minimum_depth = min_depth or depth_divisor
    new_filters = max(
        minimum_depth,
        int(filters + depth_divisor / 2) // depth_divisor * depth_divisor,
    )
    return int(new_filters)


def round_repeats(repeats, depth_coefficient):
    """Round number of repeats based on depth multiplier."""
    return int(math.ceil(depth_coefficient * repeats))



# MBConv 層 (チャンネル数の調整→ 空間方向への畳み込み、チャンネル重要度取得、出力) 
def MBConvBlock(
    input_filters,
    output_filters,
    expand_ratio=1,
    kernel_size=3,
    strides=1,
    se_ratio=0.0,
    bn_momentum=0.9,
    activation="swish",
    survival_probability=0.8,
    name=None,
):
    """MBConv block: Mobile Inverted Residual Bottleneck."""
    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1

    if name is None:
        name = backend.get_uid("block0")

    def apply(inputs):

        # 1x1でチャンネル数を増やす。
        filters = input_filters * expand_ratio
        if expand_ratio != 1:

            x = layers.Conv2D(filters=filters,kernel_size=1,strides=1,kernel_initializer=CONV_KERNEL_INITIALIZER,padding="same",data_format=backend.image_data_format(),use_bias=False,name=f"{name}expand_conv",)(inputs)
            x = layers.BatchNormalization(axis=bn_axis,momentum=bn_momentum,name=f"{name}expand_bn",)(x)
            x = layers.Activation(activation, name=f"{name}expand_activation")(x)
        else:
            x = inputs

        # Depthwise で空間方向にのみ畳み込み
        x = layers.DepthwiseConv2D(kernel_size=kernel_size,strides=strides,depthwise_initializer=CONV_KERNEL_INITIALIZER,padding="same",data_format=backend.image_data_format(),use_bias=False,name=f"{name}dwconv2",)(x)
        x = layers.BatchNormalization(axis=bn_axis, momentum=bn_momentum, name=f"{name}bn")(x)
        x = layers.Activation(activation, name=f"{name}activation")(x)


        # Squeeze and Excitation SE層でチャンネル重要度の決定
        if 0 < se_ratio <= 1:
            filters_se = max(1, int(input_filters * se_ratio))
            se = layers.GlobalAveragePooling2D(name=f"{name}se_squeeze")(x)
            if bn_axis == 1:
                se_shape = (filters, 1, 1)
            else:
                se_shape = (1, 1, filters)
            se = layers.Reshape(se_shape, name=f"{name}se_reshape")(se)

            se = layers.Conv2D(filters_se,1,padding="same",activation=activation,kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}se_reduce", )(se)
            se = layers.Conv2D(filters,1,padding="same",activation="sigmoid",kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}se_expand", )(se)

            x = layers.multiply([x, se], name=f"{name}se_excite")

        
        # 1x1畳み込みでチャンネル戻す
        x = layers.Conv2D(filters=output_filters,kernel_size=1,strides=1,kernel_initializer=CONV_KERNEL_INITIALIZER,padding="same",data_format=backend.image_data_format(),use_bias=False,name=f"{name}project_conv",)(x)
        x = layers.BatchNormalization(axis=bn_axis, momentum=bn_momentum, name=f"{name}project_bn")(x)

        if strides == 1 and input_filters == output_filters:
            if survival_probability:
                x = layers.Dropout(survival_probability, noise_shape=(None, 1, 1, 1),name=f"{name}drop",)(x)

            x = layers.add([x, inputs], name=f"{name}add")

        return x

    return apply


# Fused-MBConv 3x3畳み込み → 1x1 チャンネル圧縮 
def FusedMBConvBlock(
    input_filters,
    output_filters,
    expand_ratio=1,
    kernel_size=3,
    strides=1,
    se_ratio=0.0,
    bn_momentum=0.9,
    activation="swish",
    survival_probability=0.8,
    name=None,
):
    """Fuses the proj conv1x1 and depthwise_conv into a conv2d."""
    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1

    if name is None:
        name = backend.get_uid("block0")

    def apply(inputs):

        # 3x3畳み込みをする。
        filters = input_filters * expand_ratio
        if expand_ratio != 1:
            x = layers.Conv2D(filters,kernel_size=kernel_size,strides=strides,kernel_initializer=CONV_KERNEL_INITIALIZER,data_format=backend.image_data_format(),padding="same",use_bias=False,name=f"{name}expand_conv",
            )(inputs)
            x = layers.BatchNormalization(axis=bn_axis, momentum=bn_momentum, name=f"{name}expand_bn" )(x)
            x = layers.Activation( activation=activation, name=f"{name}expand_activation" )(x)
        else:
            x = inputs


        # SE 層でチャンネル間の重要度の決定
        if 0 < se_ratio <= 1:
            filters_se = max(1, int(input_filters * se_ratio))
            se = layers.GlobalAveragePooling2D(name=f"{name}se_squeeze")(x)
            if bn_axis == 1:
                se_shape = (filters, 1, 1)
            else:
                se_shape = (1, 1, filters)

            se = layers.Reshape(se_shape, name=f"{name}se_reshape")(se)

            se = layers.Conv2D(filters_se,1,padding="same",activation=activation,kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}se_reduce",)(se)
            se = layers.Conv2D(filters,1,padding="same",activation="sigmoid",kernel_initializer=CONV_KERNEL_INITIALIZER,name=f"{name}se_expand",)(se)

            x = layers.multiply([x, se], name=f"{name}se_excite")


        # 1x1でチャンネル圧縮
        x = layers.Conv2D(output_filters,kernel_size=1 if expand_ratio != 1 else kernel_size,strides=1 if expand_ratio != 1 else strides,kernel_initializer=CONV_KERNEL_INITIALIZER,padding="same",use_bias=False,name=f"{name}project_conv",)(x)
        x = layers.BatchNormalization(axis=bn_axis, momentum=bn_momentum, name=f"{name}project_bn")(x)

        if expand_ratio == 1:
            x = layers.Activation(activation=activation, name=f"{name}project_activation")(x)

        if strides == 1 and input_filters == output_filters:
            if survival_probability:
                x = layers.Dropout(survival_probability,noise_shape=(None, 1, 1, 1),name=f"{name}drop",)(x)

            x = layers.add([x, inputs], name=f"{name}add")
        return x

    return apply


# EfficientNetV2 本体
def EfficientNetV2(
    width_coefficient,
    depth_coefficient,
    default_size,
    dropout_rate=0.2,
    drop_connect_rate=0.2,
    depth_divisor=8,
    min_depth=8,
    bn_momentum=0.9,
    activation="swish",
    blocks_args="default",
    name="efficientnetv2",
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    weights_name=None,
):

    if blocks_args == "default":
        blocks_args = DEFAULT_BLOCKS_ARGS[name]

    if not (weights in {"imagenet", None} or file_utils.exists(weights)):
        raise ValueError(
            "The `weights` argument should be either "
            "`None` (random initialization), `imagenet` "
            "(pre-training on ImageNet), "
            "or the path to the weights file to be loaded."
            f"Received: weights={weights}"
        )

    if weights == "imagenet" and include_top and classes != 1000:
        raise ValueError(
            'If using `weights="imagenet"` with `include_top`'
            " as true, `classes` should be 1000"
        )

    # Determine proper input shape
    input_shape = imagenet_utils.obtain_input_shape(
        input_shape,
        default_size=default_size,
        min_size=32,
        data_format=backend.image_data_format(),
        require_flatten=include_top,
        weights=weights,
    )

    if input_tensor is None:
        img_input = layers.Input(shape=input_shape)
    else:
        if not backend.is_keras_tensor(input_tensor):
            img_input = layers.Input(tensor=input_tensor, shape=input_shape)
        else:
            img_input = input_tensor

    bn_axis = 3 if backend.image_data_format() == "channels_last" else 1

    x = img_input

    if include_preprocessing:
        # Apply original V1 preprocessing for Bx variants
        # if number of channels allows it
        num_channels = input_shape[bn_axis - 1]
        if name.split("-")[-1].startswith("b") and num_channels == 3:
            x = layers.Rescaling(scale=1.0 / 255)(x)
            mean = [0.485, 0.456, 0.406]
            variance = [0.229**2, 0.224**2, 0.225**2]
            x = layers.Normalization(
                mean=mean,
                variance=variance,
                axis=bn_axis,
            )(x)
        else:
            x = layers.Rescaling(scale=1.0 / 128.0, offset=-1)(x)

    # Build stem
    stem_filters = round_filters(
        filters=blocks_args[0]["input_filters"],
        width_coefficient=width_coefficient,
        min_depth=min_depth,
        depth_divisor=depth_divisor,
    )

    x = layers.Conv2D(filters=stem_filters,kernel_size=3,strides=2,kernel_initializer=CONV_KERNEL_INITIALIZER,padding="same",use_bias=False,name="stem_conv", )(x)
    x = layers.BatchNormalization(axis=bn_axis,momentum=bn_momentum,name="stem_bn", )(x)
    x = layers.Activation(activation, name="stem_activation")(x)

    # Build blocks
    blocks_args = copy.deepcopy(blocks_args)
    b = 0
    blocks = float(sum(args["num_repeat"] for args in blocks_args))

    for i, args in enumerate(blocks_args):
        if args["num_repeat"] <= 0:
            raise ValueError(
                f"The number of repeats in `EfficientNetV2` must be > 0. "
                f"Received: num_repeat={args['num_repeat']}"
            )

        # Update block input and output filters based on depth multiplier.
        args["input_filters"] = round_filters(
            filters=args["input_filters"],
            width_coefficient=width_coefficient,
            min_depth=min_depth,
            depth_divisor=depth_divisor,
        )
        args["output_filters"] = round_filters(
            filters=args["output_filters"],
            width_coefficient=width_coefficient,
            min_depth=min_depth,
            depth_divisor=depth_divisor,
        )

        # Determine which conv type to use:
        block = {0: MBConvBlock, 1: FusedMBConvBlock}[args.pop("conv_type")]
        repeats = round_repeats(
            repeats=args.pop("num_repeat"), depth_coefficient=depth_coefficient
        )
        for j in range(repeats):
            # The first block needs to take care of stride and filter size
            # increase.
            if j > 0:
                args["strides"] = 1
                args["input_filters"] = args["output_filters"]

            x = block(
                activation=activation,
                bn_momentum=bn_momentum,
                survival_probability=drop_connect_rate * b / blocks,
                name=f"block{i + 1}{chr(j + 97)}_",
                **args,
            )(x)
            b += 1

    # Build top
    top_filters = round_filters(
        filters=1280,
        width_coefficient=width_coefficient,
        min_depth=min_depth,
        depth_divisor=depth_divisor,
    )
    x = layers.Conv2D(
        filters=top_filters,
        kernel_size=1,
        strides=1,
        kernel_initializer=CONV_KERNEL_INITIALIZER,
        padding="same",
        data_format=backend.image_data_format(),
        use_bias=False,
        name="top_conv",
    )(x)
    x = layers.BatchNormalization(
        axis=bn_axis,
        momentum=bn_momentum,
        name="top_bn",
    )(x)
    x = layers.Activation(activation=activation, name="top_activation")(x)

    if include_top:
        x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
        if dropout_rate > 0:
            x = layers.Dropout(dropout_rate, name="top_dropout")(x)
        imagenet_utils.validate_activation(classifier_activation, weights)
        x = layers.Dense(
            classes,
            activation=classifier_activation,
            kernel_initializer=DENSE_KERNEL_INITIALIZER,
            bias_initializer=initializers.Constant(0.0),
            name="predictions",
        )(x)
    else:
        if pooling == "avg":
            x = layers.GlobalAveragePooling2D(name="avg_pool")(x)
        elif pooling == "max":
            x = layers.GlobalMaxPooling2D(name="max_pool")(x)

    # Ensure that the model takes into account
    # any potential predecessors of `input_tensor`.
    if input_tensor is not None:
        inputs = operation_utils.get_source_inputs(input_tensor)
    else:
        inputs = img_input

    # Create model.
    model = Functional(inputs, x, name=name)

    # Load weights.
    if weights == "imagenet":
        if include_top:
            file_suffix = ".h5"
            file_hash = WEIGHTS_HASHES[weights_name][0]
        else:
            file_suffix = "_notop.h5"
            file_hash = WEIGHTS_HASHES[weights_name][1]
        file_name = name + file_suffix
        weights_path = file_utils.get_file(
            file_name,
            BASE_WEIGHTS_PATH + file_name,
            cache_subdir="models",
            file_hash=file_hash,
        )
        model.load_weights(weights_path)
    elif weights is not None:
        model.load_weights(weights)

    return model


@keras_export(
    [
        "keras.applications.efficientnet_v2.EfficientNetV2B0",
        "keras.applications.EfficientNetV2B0",
    ]
)
def EfficientNetV2B0(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="efficientnetv2-b0",
):
    return EfficientNetV2(
        width_coefficient=1.0,
        depth_coefficient=1.0,
        default_size=224,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        include_preprocessing=include_preprocessing,
        weights_name="b0",
    )


@keras_export(
    [
        "keras.applications.efficientnet_v2.EfficientNetV2B1",
        "keras.applications.EfficientNetV2B1",
    ]
)
def EfficientNetV2B1(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="efficientnetv2-b1",
):
    return EfficientNetV2(
        width_coefficient=1.0,
        depth_coefficient=1.1,
        default_size=240,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        include_preprocessing=include_preprocessing,
        weights_name="b1",
    )


@keras_export(
    [
        "keras.applications.efficientnet_v2.EfficientNetV2B2",
        "keras.applications.EfficientNetV2B2",
    ]
)
def EfficientNetV2B2(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="efficientnetv2-b2",
):
    return EfficientNetV2(
        width_coefficient=1.1,
        depth_coefficient=1.2,
        default_size=260,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        include_preprocessing=include_preprocessing,
        weights_name="b2",
    )


@keras_export(
    [
        "keras.applications.efficientnet_v2.EfficientNetV2B3",
        "keras.applications.EfficientNetV2B3",
    ]
)
def EfficientNetV2B3(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="efficientnetv2-b3",
):
    return EfficientNetV2(
        width_coefficient=1.2,
        depth_coefficient=1.4,
        default_size=300,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        include_preprocessing=include_preprocessing,
        weights_name="b3",
    )


@keras_export(
    [
        "keras.applications.efficientnet_v2.EfficientNetV2S",
        "keras.applications.EfficientNetV2S",
    ]
)
def EfficientNetV2S(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="efficientnetv2-s",
):
    return EfficientNetV2(
        width_coefficient=1.0,
        depth_coefficient=1.0,
        default_size=384,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        include_preprocessing=include_preprocessing,
        weights_name="-s",
    )


@keras_export(
    [
        "keras.applications.efficientnet_v2.EfficientNetV2M",
        "keras.applications.EfficientNetV2M",
    ]
)
def EfficientNetV2M(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="efficientnetv2-m",
):
    return EfficientNetV2(
        width_coefficient=1.0,
        depth_coefficient=1.0,
        default_size=480,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        include_preprocessing=include_preprocessing,
        weights_name="-m",
    )


@keras_export(
    [
        "keras.applications.efficientnet_v2.EfficientNetV2L",
        "keras.applications.EfficientNetV2L",
    ]
)
def EfficientNetV2L(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classes=1000,
    classifier_activation="softmax",
    include_preprocessing=True,
    name="efficientnetv2-l",
):
    return EfficientNetV2(
        width_coefficient=1.0,
        depth_coefficient=1.0,
        default_size=480,
        name=name,
        include_top=include_top,
        weights=weights,
        input_tensor=input_tensor,
        input_shape=input_shape,
        pooling=pooling,
        classes=classes,
        classifier_activation=classifier_activation,
        include_preprocessing=include_preprocessing,
        weights_name="-l",
    )

EfficientNetV2B0.__doc__ = BASE_DOCSTRING.format(name="EfficientNetV2B0")
EfficientNetV2B1.__doc__ = BASE_DOCSTRING.format(name="EfficientNetV2B1")
EfficientNetV2B2.__doc__ = BASE_DOCSTRING.format(name="EfficientNetV2B2")
EfficientNetV2B3.__doc__ = BASE_DOCSTRING.format(name="EfficientNetV2B3")
EfficientNetV2S.__doc__ = BASE_DOCSTRING.format(name="EfficientNetV2S")
EfficientNetV2M.__doc__ = BASE_DOCSTRING.format(name="EfficientNetV2M")
EfficientNetV2L.__doc__ = BASE_DOCSTRING.format(name="EfficientNetV2L")

@keras_export("keras.applications.efficientnet_v2.preprocess_input")
def preprocess_input(x, data_format=None):
    return x

@keras_export("keras.applications.efficientnet_v2.decode_predictions")
def decode_predictions(preds, top=5):
    return imagenet_utils.decode_predictions(preds, top=top)

decode_predictions.__doc__ = imagenet_utils.decode_predictions.__doc__
```


- MBConv : 重要とされる特徴を見つける工程
- FusedMBConv : 見つけた重要な特徴を一気に計算する工程。


この点はPytorchのEfficientNetV2と変わらず。

異なる点は、Pytorch版はSiLU関数を使用し、Keras版はSwish関数を使っている点。と思いきやSiLU関数とSwish関数は等価である点に注意。(GoogleによってSwishと呼ばれている。)

```
数式: f(x)=x⋅σ(x) （σ はシグモイド関数）
```

