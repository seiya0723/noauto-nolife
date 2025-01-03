---
title: "フレームワークと言語の学習方法"
date: 2022-05-03T11:45:50+09:00
lastmod: 2022-05-03T11:45:50+09:00
draft: true
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "私見","初心者向け" ]
---

最近の私は、自習を怠り気味で遅れている。

エンジニアたるもの、休日も学習に費やすべき。

そういった意識や、周りの動きから危機感を覚えて再学習しようとしても、なかなかうまく行かない。

そこで、昔やっていた学習方法を本記事でまとめ、今の再学習に活かそうと思う。

## 学習の流れ

1. 【第1段階】まずは速やかに動くものを目指す(サンプルのコピペもOK)
1. 【第2段階】動くものを解析する
1. 【第3段階】解析した上で、改造する
1. 【第4段階】まったく新しいものを作る
1. 【第5段階】知らないメソッドやクラスなどを積極的に調べてみる
1. 【第6段階】更に高度なものを作る



## 【第1段階】まずは速やかに動くものを目指す(サンプルのコピペもOK)



この段階で目指すことは、まず動くものを作ること。

内容の理解は後回し。まずは何が正しいかを明確にしていくため、動くコードを用意する必要がある。

サンプルのコピペでも、GitHubからのコードのクローンでも問題はない。

逆に、ここでコードの一つ一つに注目して、解説サイトを巡っているようではかえって時間がかかると思う。

いつまでも完成に近づかないので、モチベーションも次第に下がるだろう。

### 目的

- 何が正しいコードかを明確にする
- コードの全体を俯瞰し、流れを理解する
- 完成形を手に入れ、モチベーションを上げる


## 【第2段階】動くものを解析する

第1段階で動くコードを手に入れた後は、この段階で解析を行う。

使用しているクラス、関数、メソッド、変数の命名法や詳細な処理の流れを注視する。

この動くコードに必要不可欠なものを明確にしていく工程でもある。

ただし、検索してもすぐに出てこないものは無理して調べようとせず、コメントを書いて後でじっくり調べる。

不要だと思われるコードはどんどんコメントアウトして無駄を削ぎ落としてみる。


### 目的

- 使用しているクラスや関数などを調べる
- より詳細な処理の流れを知る
- このコードに必要不可欠なものを明確にする


## 【第3段階】解析した上で、改造する

例えば、投稿機能しか用意されていないのであれば、削除や編集などの機能を実装させる。

この改造の工程で、後の新しいアプリの作成につなげることもできるだろう。

ただし、自分で思いつく方法でやっているだけでは最適解にたどり着けないので、しっかり検索して機能実装の一番良い方法を調べておく。

### 目的

- 検索して情報収集
- 新しいアプリの機能実装の布石
- 一番良い機能実装方法を明確にする


## 【第4段階】まったく新しいものを作る

前の段階でコードの改造にとどめていたが、この段階ではコードを元にして全く新しいものを作る

例えば、TodoリストのReactのアプリであれば、プロジェクトを別に作り、簡易掲示板にしてみるなどがこの段階。

新しいアプリを作れば、必要となる機能は全く別物になる。

そこから、これからの学習で必要なものが明確になっていくだろう。

また、1からアプリを作ることで、俯瞰した全体像がよりわかりやすくなる。前段階で改造をし続けるだけではコードは覚えられない。

### 目的

- 別のアプリを作って、新しい機能の実装方法を調べる
- 作成に必要なコードを覚える


## 【第5段階】知らないメソッドやクラスなどを積極的に調べてみる

公式のドキュメントなどを眺めて、知らないメソッドやクラスなどがあれば調べてみる。

すぐに使う予定がない、他のメソッドやクラスなどで代用できる場合であっても、覚えておいて損はないだろう。

なぜなら、状況によって機能実装の方法は制限されることがあるからだ。

例えば、Djangoでどんなページでも同じ情報を表示させたい場合、


- 埋め込み型カスタムテンプレートタグを使って表示
- MIDDLEWAREを編集してリクエストオブジェクトにデータを追加して表示
- context_processerを使って表示
- ビュークラスの継承機能を使って表示
- テンプレートの継承を使って表示
- AjaxとAPIを使って表示

など、機能実装の方法論が豊富にあるだけで、問題解決がしやすくなる。

いつ使うのかわからないものでも、覚えておいたほうが良いのがそういう事。

### 目的

- 機能実装の方法論を豊富にさせる
- 状況に応じて適した機能実装を実現させる
- 公式のドキュメントの読み方を覚える


## 【第6段階】更に高度なものを作る

ここまで来ると、ある程度はフレームワークや新言語の扱いに慣れていると思われる。

そこで、自分の作りたいものや、まだ実現できていない高度な機能を有したアプリの作成に力を入れる。

例えば、SPA、WebSocket、AIなどがこれに当たる。

単純なアプリの作成でとどまってしまうようでは、いずれ扱わなくなり、次第に忘れていく。

フレームワークや新言語を扱う理由を作っておくためにも、高度なものを作ろうという気概を忘れてはいけない。

### 目的

- 継続的なフレームワークや言語のコーディング
- 習得した技術を忘れないようにする
- モチベーションの維持



