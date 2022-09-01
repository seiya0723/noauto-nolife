---
title: "【CSS3】文字に縁取りを加えて視認性UPさせる方法【text-shadow】"
date: 2020-10-29T16:42:03+09:00
draft: false
thumbnail: "images/css3.jpg"
categories: [ "フロントサイド" ]
tags: [ "ウェブデザイン","tips" ]
---

背景色と文字色が近い場合、文字の縁取りをすることで、視認性を上げることができる。

あまり使うことは無いが、一応備忘録として。

## 縁取りの作り方

使用するのは`text-shadow`だけ。下記のコードを任意の要素に指定すれば良いだけ。

    text-shadow: 
            skyblue 1px 1px 0,  skyblue -1px -1px 0,
            skyblue -1px 1px 0, skyblue 1px -1px 0,
            skyblue 0px 1px 0,  skyblue  0-1px 0,
            skyblue -1px 0 0,   skyblue 1px 0 0;

<p style="color:white; text-shadow:skyblue 1px 1px 0,  skyblue -1px -1px 0,skyblue -1px 1px 0, skyblue 1px -1px 0,skyblue 0px 1px 0,  skyblue  0-1px 0,skyblue -1px 0 0,   skyblue 1px 0 0;">こんなふうに縁取りができる。</p>

2pxの縁取りがしたい場合はこっち。

    text-shadow:
            skyblue 2px 0px,  skyblue -2px 0px,
            skyblue 0px -2px, skyblue 0px 2px,
            skyblue 2px 2px , skyblue -2px 2px,
            skyblue 2px -2px, skyblue -2px -2px,
            skyblue 1px 2px,  skyblue -1px 2px,
            skyblue 1px -2px, skyblue -1px -2px,
            skyblue 2px 1px,  skyblue -2px 1px,
            skyblue 2px -1px, skyblue -2px -1px;
    



縦横斜め全てに影を施している。

後は、skyblueの部分を適当な色に変えていく。

## 結論

text-shadowを使うだけなのでそれほど難しくはない。原理まで覚えても仕方ないので、縁の色だけ変えて、後はコピペでも問題はないと思う。

ちなみに3px以上の縁取りをする時には下記のジェネレータを使うと良い。

http://owumaro.github.io/text-stroke-generator/

複雑なものを作ろうとするのであれば、GIMPとかで作ったほうが良いでしょう。画像にするとデータ容量が極端に大きくなって、SEO的に問題になりそうだけど。


