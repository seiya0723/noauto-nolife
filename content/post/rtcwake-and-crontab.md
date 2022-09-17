---
title: "rtcwakeコマンドを動かす【指定時間後に復帰、WOLが使えない時に】"
date: 2022-09-17T10:20:08+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "インフラ" ]
tags: [ "Linux","システム管理","crontab","tips" ]
---


私のサーバーは夜中は操作しないので、crontabで`shutdown`することにしている。

そして、朝になったらラズパイなどの常時動いている端末にWakeOnLanを送信して起動させている。

だが、そのサーバーが無線LANになった時、WakeOnLanは通用しない。

ではいかにして、終了と起動を指定時間に行わせるか。そこで、rtcwakeを使う。


## 今すぐ終了して7時間後に起動して欲しい場合

    sudo rtcwake -m off -s 25200

これをcrontabに書くとこうなる。

    00 23   * * *   root    rtcwake -m off -s 25200

これで午後11時にサーバーが終了し、次の日の午前7時に起動するようになる。


## 結論

rtcwakeコマンドは通電している場合に限り、起動するようになっている。

そのため、もし指定した時間に停電していると起動することはできない。

この対策として、サーバーのBIOSの設定から通電したらすぐに起動するようにしておく。

ちなみに、このrtcwakeコマンドはハードウェアの都合上、ラズパイでは動作しないらしい。

参照元: https://forums.raspberrypi.com/viewtopic.php?t=210662


