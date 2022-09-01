---
title: "JavaScriptほぼ不使用のサイトを作ってGoogle PageSpeed Insightsでスコアを調べてみた"
date: 2020-10-22T16:27:53+09:00
draft: false
thumbnail: "images/hugo.jpg"
categories: [ "web全般" ]
tags: [ "静的サイトジェネレーター","HUGO","netlify","JavaScript" ]
---


先日作った自分のサイトなんですけどね。使っているJavaScriptはせいぜいAnalyticsとAdsenceぐらいです。


## パソコンのスコア


ご覧ください。パソコンのスコア、99点です。直すべきは画像の圧縮とBootstrapの読み込み場所ぐらいでしょう。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-29-49.png" alt="パソコンのスコア99点"></div>


改善できる項目、『サーバーの応答時間を速くしてください』....。Netlifyさんなんとかできませんか？とは言え、無料だからやむなし。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-34-14.png" alt="サーバーの応答速度が遅い問題"></div>


## モバイルのスコア

モバイルはパソコンよりもやや劣るものの、それでも97点。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-38-00.png" alt="モバイルのスコア97点"></div>

やっぱり、画像とサーバーの応答速度の問題が残りました。

画像はそのうち、自動的に圧縮するスクリプトでも書く必要がありそうですね。手動で圧縮していくのは面倒ですし。


## 結論

JavaScriptというJavaScriptを削り、サイトとしての見栄えを保つためにもアニメーションはCSSで描画、そのCSSもなるべく軽量化させ、Bootstrapはグリッドシステムのみを採用しました。(そのうちBootstrapすら切るかも)

fontawesomeは実質使っていないような物なので、読み込まないようにしようか検討中。

Wordpressで作られたサイトではここまでの高いスコアは出ないでしょうね。サーバー側の処理に加え、無駄なライブラリやらJSやら満載しているようでは。

見せるためのブログなのに表示に時間がかかっているようでは仕方ない。

