---
title: "【Pillow】画像をまとめてクロッピング(トリミング)する【マルチスレッド高速化】"
date: 2025-05-03T11:17:54+09:00
lastmod: 2025-05-03T11:17:54+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "pillow","python","画像加工" ]
---

自炊した画像データには、余白がある。そこでPillowを使って必要な部分だけトリミングしていく。

ただし、「画像を読み込んで、クロッピング(トリミング)をして保存をする」という処理を、大量に繰り返すのでマルチスレッドで高速化させる。

速度差を意識するため、処理時間も計測する。

## まずはforループで直列実行

まずは直列実行してみる。

```
from PIL import Image
import os

input_dir   = "images"
output_dir  = "cropped_images"

# 出力先が存在しない場合はつくる。
os.makedirs(output_dir, exist_ok=True)

# 切り抜き範囲の各座標を指定する。
crop_box    = (38, 242, 997, 1600)

# 指定したディレクトリ内のすべての画像を処理
for filename in os.listdir(input_dir):
    if filename.lower().endswith((".png", ".jpg", ".jpeg")):  # 画像ファイルのみ対象
        img_path    = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename)

        # 画像を開いて切り抜き
        with Image.open(img_path) as img:
            cropped_img = img.crop(crop_box)  # 指定座標で切り抜き
            cropped_img.save(output_path)  # 新しいフォルダに保存

print("すべての画像の切り抜きが完了しました！")
```

画像枚数 523枚で処理時間は

```
開始
すべての画像の切り抜きが完了しました！
終了: 60.39220905303955 秒
```

こうなった。ここから高速化していく。

## threading.Thread でのマルチスレッド

```
from PIL import Image
import os
import threading

input_dir   = "images"
output_dir  = "cropped_images"
crop_box    = (38, 242, 997, 1600)

os.makedirs(output_dir, exist_ok=True)

def crop_task(file_name):
    img_path    = os.path.join(input_dir, file_name)
    output_path = os.path.join(output_dir, file_name)

    # 画像を開いて切り抜き
    with Image.open(img_path) as img:
        cropped = img.crop(crop_box)
        cropped.save(output_path)


files = os.listdir(input_dir)

# 画像のみを対象として、スレッドのリストをつくる。
threads = [ threading.Thread( target=crop_task, args=(f,) ) for f in files if f.lower().endswith((".png", ".jpg", ".jpeg"))  ]

# スレッドの開始
for thread in threads:
    thread.start()

# スレッドの終了を待機
for thread in threads:
    thread.join()

print("すべての画像の切り抜きが完了しました！")
```

このマルチスレッドにより、523枚の画像加工は 12秒で終わった。
```
開始
すべての画像の切り抜きが完了しました！
終了: 12.577816486358643 秒
```

およそ5倍の高速化である。更にこのコードを短く表現するため、ThreadPoolExecutor を使う。

## ThreadPoolExecutor でのマルチスレッド

ThreadPoolExecutor を使えば更に短く表現することができる。

```
from PIL import Image

from concurrent.futures import ThreadPoolExecutor
import os

input_dir   = "images"
output_dir  = "cropped_images"
crop_box    = (38, 242, 997, 1600)

os.makedirs(output_dir, exist_ok=True)

def crop_task(file_name):
    img_path    = os.path.join(input_dir, file_name)
    output_path = os.path.join(output_dir, file_name)

    with Image.open(img_path) as img:
        cropped = img.crop(crop_box)
        cropped.save(output_path)

files = os.listdir(input_dir)

# TIPS: max_worker は同時に処理する数を指定する。CPUのスレッド数以上を指定してもOK。
with ThreadPoolExecutor(max_workers=6) as executor:
    futures = [ executor.submit( crop_task, f ) for f in files if f.lower().endswith((".png", ".jpg", ".jpeg")) ]

print("すべての画像の切り抜きが完了しました！")
```

処理時間は 523枚の画像で
```
開始
すべての画像の切り抜きが完了しました！
終了: 12.247633457183838 秒
```
こうなった。若干ではあるが、threading.Thread よりも高速化できた。

仕組み的には、以下の箇所が省略され、executor.submit() でキューにセットされ、スレッドは実行されるようになる。

```
# スレッドの開始
for thread in threads:
    thread.start()

# スレッドの終了を待機
for thread in threads:
    thread.join()
```

## 結論

fileaio + ByteIO の組み合わせ技で非同期処理にしてしまえば、さらなる高速化も期待できる模様。

とはいえ、クロッピングはCPUバウンドの処理の上、コードも複雑になるため、今回は見送った。

これで処理時間が気になることがあれば、非同期画像加工も追記する。

また、今回はクロッピングの位置を手動で指定しているが、画像認識を使えばその座標位置の指定さえも自動化できるのではないか？と考えている。


## 参照元

[Pythonのthreading.Thread と concurrent.futures.Threadpoolexecutor の違い【マルチスレッド処理】](/post/python-threading-vs-threadpoolexecutor/)



