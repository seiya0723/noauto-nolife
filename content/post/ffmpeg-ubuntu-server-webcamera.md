---
title: "FFmpegを使ってUbuntuサーバーにUSBで接続されたウェブカメラで映像を録画する"
date: 2022-09-10T20:48:19+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "システム管理","ffmpeg","SSH","Ubuntu" ]
---

Ubuntu 22.04 Server

ハードはラズパイ3B+

## インストール

FFmpegとv4l2-utilsをインストール

    sudo apt install ffmpeg v4l-utils

## デバイスを特定する

    v4l2-ctl --list-devices

こんなふうに表示される(一部省略)

    BUFFALO BSWHD06M USB Camera
    :  (usb-3f980000.usb-1.4):
    	/dev/video0
    	/dev/video1
    	/dev/media3
    
## 対応しているフォーマットと解像度を特定する
    
    ffmpeg -f v4l2 -list_formats all -i /dev/video0

こんなふうに表示される(一部省略)

    [video4linux2,v4l2 @ 0xaaaad7c25420] Raw       :     yuyv422 :           YUYV 4:2:2 : 1280x720 800x600 640x480 640x360 352x288 320x240 176x144 160x120
    [video4linux2,v4l2 @ 0xaaaad7c25420] Compressed:       mjpeg :          Motion-JPEG : 1280x960 1280x720 800x600 640x480 640x360 352x288 320x240 176x144 160x120


## 映像を録画する

    ffmpeg -f v4l2 -framerate 30 -video_size 352x288 -i /dev/video0 output.mkv

後はこの映像をscpなどでDLして確認する。

## 結論

ラズパイ3B+だとすぐにCPU使用率が100%を超えるため、取り扱いに注意。

フレームレートは30fpsだったので、ヒートシンクでも取り付けて冷却を考慮すれば、一応RTMPサーバーとして運用はできそうだ。


もし、カメラが取得した映像をリアルタイムで配信し続けたいのであれば、下記の方法もある。

[【Django】任意のタイミングでサーバーのカメラでライブ配信する【imutils.video.VideoStreamer】](/post/django-livestreamer-custom/)


参照元: https://trac.ffmpeg.org/wiki/Capture/Webcam
