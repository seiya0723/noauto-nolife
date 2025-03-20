---
title: "【Python】サーボモーターを非同期で動かす、初期化する"
date: 2025-03-20T09:45:01+09:00
lastmod: 2025-03-20T09:45:01+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "ロボット開発" ]
tags: [ "Python","サーボモーター","非同期処理" ]
---


ロボット開発、始めました。

ロボット開発でまず最初にやることは、サーボモーターの初期化。

サーボモーターは工場で作られた時点で、常に角度が0度になっているとは限らない。その状態で90度や-90度の回転を指示してしまうと簡単に壊れる。

そこで、まずはロボットHATのPWMソケットに接続し、サーボモーターを0度に初期化する。

ただし、同期的にしかサーボモーターの制御できないのは問題なので、非同期でサーボモーターの初期化をしてみた。

## 環境構築

今回は、 [Sunfounder のPiCar-x](https://www.amazon.co.jp/dp/B0CGLPF29H/?tag=m68371ti-22) というロボットのサンプルコードから一部を非同期化させることで対応している。

そのため、リポジトリをクローンしてインストールを実行しておく。

```
sudo apt install git python3-pip python3-setuptools python3-smbus
cd ../
git clone -b v2.0 https://github.com/sunfounder/robot-hat.git
cd robot-hat
ls
sudo python3 setup.py install
```

## ソースコード

```
from robot_hat import Servo
from robot_hat.utils import reset_mcu
from time import sleep

print("起動中....")

reset_mcu()
sleep(0.2)

print("非同期サーボ動作開始")

import asyncio

async def async_servo_init(servo_num):
    Servo(servo_num).angle(-20)
    await asyncio.sleep(0.2)
    Servo(servo_num).angle(0)
    await asyncio.sleep(0.2)
    Servo(servo_num).angle(20)
    await asyncio.sleep(0.2)
    Servo(servo_num).angle(0)

    return "done !!"

async def main():
    tasks   = [ async_servo_init(i) for i in range(12) ]
    results = await asyncio.gather(*tasks)
    print(results)


# 同期処理からイベントループの起動
asyncio.run(main())
```

Servoクラスは特段の設定は必要なく、そのまま非同期処理内で動作した。

そのため、Djangoだけでなく、FastAPIから動作させることも可能であると考えている。


## 参考文献

https://docs.sunfounder.com/projects/picar-x/ja/latest/python/python_start/py_servo_adjust.html#id1
