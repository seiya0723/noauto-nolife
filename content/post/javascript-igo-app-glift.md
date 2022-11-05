---
title: "【JavaScript】囲碁ライブラリGliftを使ってSGF形式の詰碁WEBアプリを作る"
date: 2022-11-05T10:02:21+09:00
lastmod: 2022-11-05T10:02:21+09:00
draft: false
thumbnail: "images/Screenshot from 2022-11-05 10-15-30.png"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","JavaScriptライブラリ","HTML","囲碁" ]
---


## gliftとは

gliftはJavaScript囲碁ライブラリである。

http://www.gliftgo.com/

囲碁のルールに加え、SGFに対応しているので、棋譜の入出力ができる。

## ソースコード

glift.jsは https://github.com/artemispax/glift/releases/tag/v1.1.2 からDL

SGFは[ここから拝借](http://www.kihuu.net/sgf/k00000107984.sgf)した。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hello World test!!</title>

    <script src="glift_1_1_2.min.js"></script>

</head>
<body>

    <div id="test" style="height: 500px;"></div>

<script>
gliftWidget = glift.create({
  sgf: {
    sgfString: "(;AW[is]AW[ir]AW[iq]AW[ip]AB[js]AB[jr]AB[jq]AB[kp]AB[lp]AB[lq]AB[lr]AB[ms]AW[mr]AW[mq]AW[ks]AW[mp]AW[mo]AW[lo]AW[ko]AW[jp]AW[or]C[Can black live?]AP[goproblems](;B[kr]C[];W[ns]C[Yes, white can't pushRIGHT](;B[ls]C[RIGHT])(;B[nq];W[ls];B[ms];W[ls]))(;B[ls];W[kr]C[No, this is mistake. Black can't make 2 eyes at now.])(;B[nr];W[ls](;B[kr];W[ls];B[ks];W[nq];B[ns];W[os];B[ls];W[kq])(;B[ns];W[nq];B[kr];W[ls];B[ks];W[os];B[ls];W[kq])))",
    widgetType: 'CORRECT_VARIATIONS_PROBLEM',
  },
  divId: "test"
});
</script>

</body>
</html>
```

## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-11-05 10-12-53.png" alt=""></div>

## 結論

これで棋譜や詰碁を管理するウェブアプリが作れる。

DBにSGFを文字列かファイルで保存させ、JavaScriptでそれを読む。

スタンドアロンで動作する囲碁アプリでも良いが、あえてウェブアプリとして動作させることで、PCでもスマホでも動作する。

フレームワークに組み込めば、棋譜管理サイトや詰碁レビューサイトが作れる。

SGFはユーザー投稿型にしてもよいし、別のサイトからスクレイピングして集めても良いだろう。


## デモ

https://seiya0723.github.io/javascript-tsumego/
