---
title: "【JavaScript】.replace()で検索した文字列すべてを置換したい場合は正規表現を使う"
date: 2022-07-14T17:30:20+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","アンチパターン","tips" ]
---


例えば、以下の文字列の`,`を` `に書き換えたいとする。


    let data    = "aaa,bbb,ccc";

文字列の置換処理は`.replace()`で実現できるから、こうすれば良いと思いがちだが実は違う。


    console.log(data.replace(","," ")); // aaa bbb,ccc


デフォルトでは最初にヒットした文字列しか置換してくれない。検索した文字列を全て置換したい場合、このようにする。

    console.log(data.replace( /,/g , " ")); // aaa bbb ccc


ちなみにPythonでは.replace()を使うと全て置換してくれる。だから、Pythonでreplaceを使った後にJavaScriptでも同じような感覚でreplaceを使うと、こんなふうにハマる。

<div class="img-center"><img src="/images/Screenshot from 2022-07-14 17-24-55.png" alt=""></div>

