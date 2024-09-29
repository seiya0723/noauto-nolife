---
title: "【Django】任意のタイミングでサーバーのカメラでライブ配信する【imutils.video.VideoStreamer】"
date: 2024-09-27T15:18:13+09:00
lastmod: 2024-09-27T15:18:13+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django" ]
---


下記記事で、リアルタイムでブラウザ上に映像を出力することができるようになった。

[【Django】OpenCVとyieldを使い、ウェブカメラの映像をライブ配信する](/post/django-livestreamer/)

しかし、このコードはrunserverと同時に起動しているため、カメラを止めることはできない。

任意のタイミングでカメラのON・OFFをするため、改良した。



## 必要なライブラリ

```
asgiref==3.8.1
Django==5.0.6
imutils==0.5.4
numpy==1.26.4
opencv-contrib-python==4.9.0.80
sqlparse==0.5.0
typing_extensions==4.12.0
```


## views.py


```
from django.shortcuts import render,redirect
from django.views import View

from .detector import SingleMotionDetector


from imutils.video import VideoStream
from django.http import StreamingHttpResponse

import os
import cv2
import time
import imutils
import datetime
import threading


# 最新のフレームが入る変数
OUTPUT_FRAME     = None

# スレッド間でのフレームの読み書きを制御するためのロック
LOCK            = threading.Lock()

# カメラ関係
VS = None
THREAD = None
STOP_EVENT = None

# カメラの起動・停止を制御
class VideoControlView(View):
    def post(self, request, *args, **kwargs):

        global VS, THREAD, STOP_EVENT

        if VS is None:
            VS = VideoStream(src=0).start()
            time.sleep(2)

            STOP_EVENT = threading.Event()
            THREAD = threading.Thread(target=detect_motion, args=(32,))
            THREAD.daemon = True
            THREAD.start()

        else:
            STOP_EVENT.set()
            THREAD.join()
            VS.stop()
            VS = None

        return redirect("bbs:index")

video_control = VideoControlView.as_view()


# トップページ
class IndexView(View):
    def get(self, request, *args, **kwargs):
        global VS

        context = {}

        if VS is None:
            context["is_active"] = False
        else:
            context["is_active"] = True

        return render(request,"bbs/index.html", context)

    def post(self, request, *args, **kwargs):
        return redirect("bbs:index")

index   = IndexView.as_view()


# カメラからフレームを読み取り、動体検知処理をする
def detect_motion(frameCount):
    global VS, OUTPUT_FRAME, LOCK, STOP_EVENT

    # 動体検知処理を動かす
    md      = SingleMotionDetector(accumWeight=0.1)
    total   = 0

    while not STOP_EVENT.is_set():


        # カメラを読み込みして、リサイズする。
        frame       = VS.read()
        frame       = imutils.resize(frame, width=400)

        # グレースケールとぼかしを掛ける(動体検知の高速化)
        gray        = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray        = cv2.GaussianBlur(gray, (7, 7), 0)

        # 現在の時刻を表示している
        timestamp   = datetime.datetime.now()
        cv2.putText(frame, timestamp.strftime("%A %d %B %Y %I:%M:%S%p"), (10, frame.shape[0] - 10),cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)

        # ここで囲みをつけている
        if total > frameCount:
            motion = md.detect(gray)
            if motion is not None:
                (thresh, (minX, minY, maxX, maxY)) = motion
                cv2.rectangle(frame, (minX, minY), (maxX, maxY),(0, 0, 255), 2)

        # 動体検知機にフレームを更新する
        md.update(gray)

        total += 1
        with LOCK:
            # 最新のフレームをコピーする
            OUTPUT_FRAME = frame.copy()


# 最新のフレームをjpgに変換して返却している
def generate():
    global OUTPUT_FRAME, LOCK

    total = 0

    while True:

        start   = time.time()

        with LOCK:
            if OUTPUT_FRAME is None:
                continue
            (flag, encodedImage) = cv2.imencode(".jpg", OUTPUT_FRAME)
            if not flag:
                continue

        total += 1

        # 画像の保存
        """
        if total < 30:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S%f")
            filename = os.path.join(f"frame_{timestamp}.jpg")
            with open(filename, "wb") as f:
                f.write(encodedImage)

            diff    = time.time() - start
            print(f"{diff * 1000}ミリ秒")
        """

        # yield the output frame in the byte format
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')


# jpgデータを配信している
class StreamView(View):
    def get(self, request, *args, **kwargs):
        return StreamingHttpResponse(generate(), content_type="multipart/x-mixed-replace; boundary=frame")

stream   = StreamView.as_view()
```

## ソースコード

https://github.com/seiya0723/django_livestreamer/tree/621839b238b398a8cc81abee79643b8fa1cd2efa



