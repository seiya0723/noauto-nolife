---
title: "動画の扱い方の学習ロードマップ"
date: 2025-11-29T11:23:42+09:00
lastmod: 2025-11-29T11:23:42+09:00
draft: false
thumbnail: "images/ffmpeg.jpg"
categories: [ "映像処理" ]
tags: [ "メモ","追記予定" ]
---

動画の扱い方の学習手順と方針をまとめる。

よりリアルタイムで、より高画質で、より便利で扱いやすいアプリ開発をバックアップする。

## 動画の基本単位

動画はコーデックとコンテナによって作られている。

動画を構成しているのは、映像と音声。これらをひとまとめにするため、圧縮と保存を行う。

その圧縮と保存が、コーデックとコンテナである。

### コーデック (映像と音声の圧縮)

コーデックには映像用のコーデックと、音声用のコーデックの2種類がある。

#### 映像用コーデック

- H.264/AVC : 高圧縮で汎用性が高い。ほぼすべてのブラウザとデバイスで再生可能
- H.265/HEVC : 4K動画配信などにも使用される。対応ソフトが限定的
- VP8 : WebRTC、HTML5などで使用されている。ウェブ向けに最適化
- VP9 : VP8の後継。高圧縮・高画質。
- AV1 : 次世代

一般的にウェブカメラから取得できるデータは、YUYV(YUY2) や MJPEG などの未圧縮の生データであり、そのままでは配信・保存はできない。

H.264などの映像用コーデックで圧縮をした上で保存と配信をする。保存されたファイルを開いたり、配信を受け取って再生するには、これらのコーデックに対応したソフトを用意しておく必要がある。

ちなみに、cheese や opencv などの表示をするだけのアプリにおいては圧縮は不要。生データを色空間の並び替えなどの変換するだけでそのまま表示できる。

まとめるとこうなる。

- 映像を保存・配信するには、映像用コーデックを使って圧縮が必要。
- 保存・配信した映像を視聴するには、映像用コーデックに対応したソフトが必要。
- そのまま表示をする場合は、映像用コーデックでの圧縮は不要

#### 音声用コーデック

- MP3 : サイズを小さくするため音を一部捨てている
- AAC : mp3よりも高音質
- Opus : 音声会話に最適化されている
- FLAC : データを完全保持。ロスレス圧縮により高音質化されている
- WAV : 非圧縮。圧縮無しで音をそのまま保存している。

これらの音声用コーデックはそのまま音声ファイルとして利用されている。

今回は動画を扱う観点から、コーデックとして見ている。

### コンテナ (動画の保存) 

圧縮された映像と音声を、動画として保存するのがコンテナ。ファイル形式でもある。

- MP4 : 汎用
- TS : HLS で使われる分割ファイル
- MKV : 柔軟、でもウェブ向きではない
- WebM : VP 系と相性良。H.264コーデックに対応していない問題も

## 配信プロトコル

- HLS(m3u8 + ts)…安定・非低遅延。Webで最強に扱いやすい。
- DASH(m3u8の仲間、fMP4 ベース)
- WebRTC …超低遅延(最速)。だが難易度は高い。
- RTMP …古いが今も配信現場で使われる


## ffmpeg コマンドを使いこなす

まずは、USB接続されているウェブカメラを通して、ffmpeg で動画を生成するところから始める。

ちなみに、ffmpegコマンドはOSによって大きく異なる。今回はUbuntu 22.04 LTS を使用しているという前提で解説をする。(※Windowsでは以下の解説コマンドは使用できない。)

### mp4 の生成

/dev/video0 にウェブカメラが接続されている前提。

一般的に最小限度のコマンドとして、以下コマンドでもmp4は作れる。

- `-i` : 入力元
- `-c:v` : ビデオコーデックの指定
- `-c:a` : オーディオコーデックの指定

```
ffmpeg -i /dev/video0 -c:v libx264 output.mp4
```

しかし、使用するウェブカメラによっては何も表示されない。(真っ黒画面になる)

以下のコマンドであれば、取得はできるだろう。

```
ffmpeg -f v4l2 -i /dev/video0 -c:v libx264 -pix_fmt yuv420p output.mp4
```

#### ピクセルフォーマットの指定

ピクセルフォーマットとは、デジタル画像や映像の色の表現方法を定義する規則のこと。動画ファイルをデコードして表示をするときに参照される。

以下のコマンドのように、ffmpeg でピクセルフォーマットを明示的に指定をしていない場合。生成されるファイルのピクセルフォーマットは、入力のウェブカメラに依存する。(ウェブカメラがyuv422 の場合、生成されるmp4ファイルもyuv422 になる。)

```
ffmpeg -i /dev/video0 -c:v libx264 -c:a aac output.mp4
```

一般的にmp4ファイルのピクセルフォーマットはyuv420。結果、yuv422のmp4を再生しても、映像は正常に表示されない。

<div class="img-center"><img src="/images/Screenshot from 2025-11-29 14-44-32.png" alt=""></div>

そこで、一般的なmp4ファイルのピクセルフォーマットになるよう、ffmpeg側で明示的に指定をする。

#### フォーマットの指定

ffmpegでは、デバイスを読み込みするとき、フォーマットを自動推測するようになっている。

しかし、システムによっては推測が失敗し、カクつきや映像が不安定になってしまうことがある。

そこで、フォーマットを明示的に指定することで、最初からv4l2(Video4Linux2ドライバ)で読み込みされ、デバイスとの通信が安定化する。

以上を踏まえ、以下のコマンドでmp4ファイルの生成ができる。停止する場合はCtrl+Cで良い。

```
ffmpeg -f v4l2 -i /dev/video0 -c:v libx264 -pix_fmt yuv420p output.mp4
```

#### 音声出力対応

前項から、オーディオコーデックの指定によりウェブカメラ(マイク付き)から得られる音声データは圧縮され、動画ファイルを生成できる。

しかし、Linuxにおいてデバイスが取得した音声情報は、/dev/video ではなく alsaから取得をする。

```
ffmpeg -f v4l2 -input_format yuyv422 -i /dev/video0 -f alsa -i default -c:v libx264 -vf format=yuv420p -c:a aac output.mp4
```

このように音声の保存まで対応するとコマンドがかなり複雑になってしまう。

### mkv の生成

コンテナを変更するには、ファイルの拡張子を変更すれば良いだけである。

```
ffmpeg -f v4l2 -i /dev/video0 -c:v libx264 -pix_fmt yuv420p output.mkv
```


### webm の生成

webm は h264コーデックに対応していないため、vp8コーデックを利用する。

```
ffmpeg -f v4l2 -i /dev/video0 -c:v libvpx -pix_fmt yuv420p output.webm
```

### ts の生成

```
ffmpeg -f v4l2 -i /dev/video0 -c:v libx264 -pix_fmt yuv420p output.ts
```


### ffplay でリアルタイム表示

ちなみにとにかく表示したい場合はffplayを使う。

```
ffplay -f v4l2 -i /dev/video0
```

### 解像度の指定

これまでのffmpegコマンドでは解像度の指定はされていない。デバイスのデフォルト設定がそのまま使用される。

解像度の指定をするには、まずはデバイスが対応している解像度を調べる。

```
v4l2-ctl --list-formats-ext -d /dev/video0
```

このコマンドを使用すると以下の出力が得られる。

```
ioctl: VIDIOC_ENUM_FMT
	Type: Video Capture

	[0]: 'YUYV' (YUYV 4:2:2)
		Size: Discrete 640x480
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 160x120
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 176x144
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 320x176
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 320x240
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 352x288
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 432x240
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 544x288
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 640x360
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 752x416
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 800x448
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 800x600
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 864x480
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 960x544
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 960x720
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1024x576
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1184x656
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1280x720
			Interval: Discrete 0.133s (7.500 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1280x960
			Interval: Discrete 0.133s (7.500 fps)
			Interval: Discrete 0.200s (5.000 fps)
	[1]: 'MJPG' (Motion-JPEG, compressed)
		Size: Discrete 640x480
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 160x120
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 176x144
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 320x176
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 320x240
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 352x288
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 432x240
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 544x288
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 640x360
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 752x416
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 800x448
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 800x600
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 864x480
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 960x544
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 960x720
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1024x576
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1184x656
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1280x720
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
		Size: Discrete 1280x960
			Interval: Discrete 0.033s (30.000 fps)
			Interval: Discrete 0.040s (25.000 fps)
			Interval: Discrete 0.050s (20.000 fps)
			Interval: Discrete 0.067s (15.000 fps)
			Interval: Discrete 0.100s (10.000 fps)
			Interval: Discrete 0.200s (5.000 fps)
```

この結果から

- このデバイスは、YUYVとMJEPGの2種類の生データの提供ができる
- MJPEGは解像度が上がってもfps値は落ちない

MJPGはYUYVと比べて、非可逆圧縮が行われ、データ量が大幅に削減されている。

故に、YUYVは高解像度になるたびにUSBのデータ転送帯域の制限がボトルネックになりfps値が下がる。一方で、非可逆圧縮されているMJPG は非可逆圧縮により、帯域制限には引っかからず高fpsが維持できている。

もし、多少低画質でも、高解像度でなめらかな映像が欲しい場合は、MJPGを使うと良い。




## ブラウザで動画を扱う技術

- `<video>` タグ
- hls.js（HLS 再生の王道）
- Media Source Extensions（MSE）…高度
- WebRTC API …超低遅延


## ストリーミングサーバー

- nginx（+ nginx-http-flv-module）
- Caddy（軽量）
- SRS（ストリーミング特化）
- Node.js + hls.js（小規模）

実際には HLS を置くだけなら nginx の「静的配信だけ」で足ります。



