---
title: "【Ubuntu22.04】スクリーンショットのショートカットキーを修正する"
date: 2023-01-29T14:27:42+09:00
lastmod: 2023-01-29T14:27:42+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "others" ]
tags: [ "ubuntu","tips" ]
---

Ubuntu22.04は問題が多すぎる。

例えば、20.04まではPrintScreenキーを押したらすぐにPCの全画面のスクリーンショットを撮影してくれたが、`Screenshot Tool`なるふざけた機能が邪魔をしてスムーズなスクショの妨げになっている。

そこで、Ubuntuの設定からキーボードのショートカットキーを修正し、この問題を解決する。

『設定』→『キーボード』→『ショートカットの表示とカスタマイズ』を選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2023-01-29 14-31-15.png" alt=""></div>

スクリーンショットはすべて無効化させる。

独自のショートカットを割り当てる。

<div class="img-center"><img src="/images/Screenshot from 2023-01-29 14-32-26.png" alt=""></div>


コマンドは上から

```
gnome-screenshot

gnome-screenshot -a 

gnome-screenshot -w
```

でOK。これでShift+PrintScreenで以前のように範囲選択をしてのスクリーンショットが可能になる。


## 結論

Ubuntu22.04にアップグレードしたが、正直後悔している。

Firefoxがsnapで管理されるようになったので不具合が多々あり、VLCは映像が乱れて視聴できない、ターミナルのフォントはtakaoフォントを入れないと行間が広すぎて使い物にならない。

他にもまだまだ大量の不具合がありそうなので、今Ubuntu20.04を使用している場合、無理に22.04にアップグレードしないほうが良いだろう。


参照元: https://kledgeb.blogspot.com/2022/06/ubuntu-2204-203-screenshot-tool.html
