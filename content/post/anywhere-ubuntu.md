---
title: "【USBブート】NVMe SSD とUSB3.2 Gen.2 の変換器でどこでもUbuntu"
date: 2025-03-23T08:20:26+09:00
lastmod: 2025-03-23T08:20:26+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","開発環境","tips" ]
---


家のメインPCの開発環境を、外のPCでも実現させたいことがある。

これまでは、外用のPCに開発環境をインストールさせる必要があったが、とっても手間がかかる。

その上、家のメインPCの環境が変わるたび、手動で外用のPCの設定を変えていかないといけない。

そこで、メインPCでOSが入っているNVMeSSDを取り出し、USB3.2 Gen.2 に変換する変換器を用意して、以降USBブートさせる。


今回はこちらを使った。

<div class="img-center">
    <a href="https://www.amazon.co.jp/dp/B09H2LC5ZQ/?tag=m68371ti-22">
        <img src="https://m.media-amazon.com/images/I/61xUUQG6AGL._AC_SL300_.jpg" alt="">
    </a>
</div>
<a href="https://www.amazon.co.jp/dp/B09H2LC5ZQ/?tag=m68371ti-22">
 ロジテック(エレコム) LGB-PNV02UC USB3.2(Gen2)対応M.2 NVMe SSDケース 
</a>


無事問題なくブートできた。UbuntuのOSからもLogitecのUSB接続をしているということがわかる。

<div class="img-center"><img src="/images/Screenshot from 2025-03-23 08-26-32.png" alt=""></div>

下記は実際に接続をしている状態。わかりやすくUbuntuステッカーを貼り付けた。

<div class="img-center"><img src="/images/Screenshot from 2025-03-25 11-08-14.png" alt=""></div>

## メリットとデメリット


### メリット

- 開発環境のポータブル化
- 緊急避難時のデータの持ち出し
- USBブート用途以外にも、外付けSSDとしても運用できる

### デメリット

- 冷却問題
- USB3.2 Genの速度ボトルネック
- RAID構成はできない
- USBブートできないBIOSには使えない
- 別PCでブートし同じ固定IPが使えない時、すぐにDHCPに切り替えるような仕組みが必要


特に気をつけたいのがIPアドレス。

家では固定IPに設定し、出先のPCでブートしようとした時。固定IPで接続を始めるため、どうにかすぐにDHCPに切り替えるコマンドなどを用意しておく必要があるだろう。





