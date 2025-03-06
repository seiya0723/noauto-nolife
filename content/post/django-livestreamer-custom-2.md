---
title: "Djangoでサーバーのウェブカメラを使ってライブ配信、クライアント側からON・OFF操作"
date: 2025-03-05T10:03:22+09:00
lastmod: 2025-03-05T10:03:22+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---

[【Django】任意のタイミングでサーバーのカメラでライブ配信する【imutils.video.VideoStreamer】](/post/django-livestreamer-custom/) 

ここで、クライアント側からサーバーのウェブカメラの電源をON/OFFできるようにしたが、コードがやや煩雑でわかりにくい。

不要な処理も含まれていたため、まずはサーバー側にあるウェブカメラの映像をブラウザに表示・非表示できるようにした。


## ビューのソースコード

要になるビューのソースコードは以下。

クラスを使ってグローバル変数と関数をひとまとめにすることで、[以前のもの](/post/django-livestreamer-custom/)よりもシンプルにリファクタリングできた。

```
from django.shortcuts import render,redirect
from django.views import View

from imutils.video import VideoStream
from django.http import StreamingHttpResponse

import imutils
import os 
import cv2
import time
import threading

# ウェブカメラの動作を管理するクラス。
class CameraManager:
    def __init__(self):
        self.vs             = None
        self.thread         = None

        # TIPS: threading.Event() は他のスレッドに何かしらの合図を送りたいときに使う。フラグ変数のようなもの。
        #       .set()    : フラグを立てる(Trueにする)
        #       .clear()  : フラグを下ろす(Falseにする)
        #       .is_set() : フラグをチェックする(TrueかFalseか)
        self.stop_event     = threading.Event()

        # TIPS: threading.Lock() は 複数のスレッドで同一のデータにアクセスしないようにするための仕組み
        #       with self.lock: を使えば排他制御できる。
        self.lock           = threading.Lock()
        self.output_frame   = None

    def start(self):
        with self.lock:
            if self.vs is not None:
                return

            # ここのUSBカメラ番号指定はコンストラクタで引数を受け取るように
            self.vs = VideoStream(src=0).start()
            #time.sleep(1)

            self.stop_event.clear()
            self.thread = threading.Thread(target=self._capture_loop)
            self.thread.daemon = True
            self.thread.start()

    def stop(self):
        with self.lock:
            if self.vs is None:
                return

            # ここで停止指示を出しても停止しないので、タイムアウトを用意して停止している。
            self.stop_event.set()
            self.thread.join(timeout=0.1)
            print("終了")

            self.vs.stop()
            self.vs = None
            self.output_frame = None


    def _capture_loop(self):

        # ここで停止指示を受けてもループを続けてしまう？
        while not self.stop_event.is_set():
            frame = self.vs.read()

            # カメラのフレームが取得できない場合は停止
            if frame is None:
                break

            # リサイズ
            frame = imutils.resize(frame, width=400)
            with self.lock:
                self.output_frame = frame.copy()

            print("キャプチャーしています。")


# ウェブカメラの管理をグローバル化して、すべてのビューでウェブカメラの起動と停止ができるようにしている。
camera_manager = CameraManager()


# トップページ
class IndexView(View):
    def get(self, request, *args, **kwargs):
        global camera_manager

        context = {}

        if camera_manager.vs is None:
            context["is_active"] = False
        else:
            context["is_active"] = True

        return render(request,"bbs/index.html", context)

index   = IndexView.as_view()


# ウェブカメラの起動と停止をするビュー
class VideoControlView(View):
    def post(self, request, *args, **kwargs):

        if camera_manager.vs is None:
            camera_manager.start()
        else:
            camera_manager.stop()

        return redirect("bbs:index")

video_control = VideoControlView.as_view()


# 最新のフレームをjpgに変換して返却している
def generate():

    global camera_manager

    while True:
        with camera_manager.lock:
            if camera_manager.output_frame is None:
                continue
            (flag, encodedImage) = cv2.imencode(".jpg", camera_manager.output_frame)
            if not flag:
                continue

        # バイナリでyieldを返す。
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')


# jpgデータを配信している
class StreamView(View):
    def get(self, request, *args, **kwargs):
        return StreamingHttpResponse(generate(), content_type="multipart/x-mixed-replace; boundary=frame")

stream   = StreamView.as_view()
```

まず、このコードは以下の4つで構成されている

- CameraManager : ウェブカメラの動作を管理するクラス
- IndexView : ただのトップページの表示をするビュークラス
- VideoControlView : ウェブカメラの起動と停止をするビュークラス
- StreamViewとgenerate : ウェブカメラからコマ撮りした、jpg画像を配信するビュークラスと関数

IndexViewでトップページを表示する。この時、表示をするのはウェブカメラの起動と停止をするボタンだけ。

<div class="img-center"><img src="/images/Screenshot from 2025-03-05 17-58-30.png" alt=""></div>

ここでボタンを押すと、VideoControlView 動作。

CameraManagerのオブジェクト(グローバル変数)であるcamera_managerを使ってウェブカメラの電源が入り、カメラ映像がコマ撮りされ続ける。

IndexViewにリダイレクトされ、 contextの is_active にTrueが入る。以下のimgタグがレンダリングされ、StreamViewが起動する。
```
        {% if is_active %}
        <img src="{% url 'bbs:stream' %}">
        {% endif %}
```

StreamViewでは、generate関数を動かし、yieldでループのたびにcamera_managerオブジェクトが所持しているカメラ映像をコマ撮りした画像を返す。

CamaeraManagerでは、ウェブカメラの映像を取得、リサイズ、ストリーマーに引き渡す。これらの処理をバックグラウンドで行うため、マルチスレッドで仕立てた。

もちろん、generate関数内に収めて、直列的に動作させた場合も動作はするが、上記の処理(映像取得、リサイズ、引き渡し)を行った上での配信になるため、環境によってはややラグが出てしまう可能性がある。

そのラグを最小限にするためにも、マルチスレッドを使って配信する一歩手前までは別スレッドで動作、generate関数は配信に関わる最小限の処理だけでyieldで返すようにした。


## 質問コーナー

### 質問1: このコードで、複数のウェブカメラを同時に配信するには？

今回のCameraManegerはインスタンスを作った時点でスレッドを作る仕様になっている。

そのため、例えば、camera_manager が複数作られたとしてもマルチスレッドは成立する。

だから、インスタンス引数に、カメラのidを指定してすることで、1個のウェブカメラを表示する場合でも、複数個のウェブカメラを指定する場合でも両方対応できる。


### 質問2: なんで cv2.VideoCapture を使わない？

どうやら、cv2.VideoCapture マルチスレッドに対応していないらしい。

更に今回、ウェブカメラの起動と停止(IO待機)を繰り返すため、非同期でカメラ制御ができるimutilsのほうが有利。

今回、generate関数内でフレームをjpg画像に変換する時にcv2を使っているが、そもそも物体検出などをしない場合Pillowなどでも間に合う。

よって、今回のリアルタイムでウェブカメラの映像を表示させたいだけであればOpenCVは無くても実現はできる。そして、マルチスレッドでリアルタイム性を確保するには、OpenCVでは力不足だ。


## ソースコード

https://github.com/seiya0723/django_livestreamer_custom


