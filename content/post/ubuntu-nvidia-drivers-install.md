---
title: "UbuntuでNvidiaのドライバーをインストールする"
date: 2025-03-06T14:18:53+09:00
lastmod: 2025-03-06T14:18:53+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "ubuntu","tips","AI開発" ]
---


ubuntuにNvidiaグラフィックボードを搭載した時、ドライバーのインストールで詰まったので、まとめておく

## 【基本】推奨のドライバーをインストールする。

```
ubuntu-drivers devices 
```

NvidiaグラフィックボードをPCに挿し込んだ状態で、上記コマンドを実行する。

以下のように出力がされると思うので、recommendの表示があるドライバーをインストールする。

<div class="img-center"><img src="/images/Screenshot from 2025-03-06 14-20-42.png" alt=""></div>

この場合
```
driver   : nvidia-driver-570 - third-party non-free recommended
```

ここから、nvidia-driver-570が推奨ドライバであることがわかる。プロプライエタリのパッケージになっているため、non-freeと書かれているが無料で利用できる。

```
sudo apt install nvidia-driver-570
```
を実行する。


## 【緊急】ubuntuが起動しなくなったときは？

間違ったドライバーを入れたり、ドライバーのパージ後リブートせずに再インストールした場合、正常にブートしなくなることがある。

そんなときは、PCが起動したときに、Shiftキーを連打して、recovery mode でログインをする。Advanced options for Ubuntu(recovery mode)を選んで、起動すると、Rootユーザーでのターミナル画面に遷移する。

その上で、間違ったドライバーをパージしておく。(この時rootユーザーになっているためsudoは不要。)

```
apt purge nvidia-driver*
```

後は、先の推奨ドライバーをチェックして、インストールすると良い。


## 【補足】CUDAもインストールするには？

```
sudo apt install cuda
```

8GBもストレージを消費するため、作業時間と空き領域には十分注意する。


## 【確認】ドライバーが正常にインストールされているか確認をするには？

```
nvidia-smi
```

を実行する。こんなふうに、PCに搭載したNvidiaのグラフィックボードが表示されれば、ドライバーのインストールは完了。

<div class="img-center"><img src="/images/Screenshot from 2025-03-06 14-28-14.png" alt=""></div>


## 【監視】リアルタイムでGPUの使用率を確認するには？

0.5秒おきにGPUの使用率を監視するには watchコマンドを使う。

```
watch -n 0.5 nvidia-smi
```

-l オプションでも使用率のリアルタイムな確認ができるが、標準出力を続け、ログが流れていくのであまり使い勝手は良くない。

```
nvidia-smi -l 1
```



## 【不具合】マルチモニタ構成で、VirtualBoxやViewnior 起動時にログアウトされる問題の対処


### 使用しているデスクトップ環境がX11であることを確認

```
echo $XDG_SESSION_TYPE
```
