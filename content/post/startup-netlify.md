---
title: "Netlifyと静的サイトジェネレーターHUGOで1ヶ月約100円でブログ運営をする方法【独自ドメイン使用】"
date: 2020-10-22T14:28:18+09:00
draft: false
thumbnail: "images/hugo.jpg"
categories: [ "web全般" ]
tags: [ "スタートアップシリーズ","netlify","静的サイトジェネレーター","HUGO" ]
---


世間ではWordpressだとか有料版レンタルブログだとかで、一ヶ月に1000円以上かけてブログを運営している人も多々いますが、実際にはそこまでお金をかけなくてもブログ運営は可能です。

もっとも、運営者のスキルが要求されますが....。


## 方法

結論から言うと、静的サイトジェネレーターとGitHub、Netlify、それからムームドメインを使えばOKです。


### 静的サイトジェネレーターとは

静的サイトジェネレーター(Static Site Generator)とは、静的なコンテンツ(HTML,CSS,JS)だけで構成されたサイトを簡単に生成してくれるツールです。

Wordpressなどとは違って、サーバー側で動作するコードが存在しないので、高速で処理が可能です。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 14-55-24.png" alt="Wordpressと静的サイトジェネレーターの違い"></div>

静的サイトジェネレーターの代表的なものに、Next.js、Gatsby、Jekyllなどが存在します。私は中でもブログ内の記事が増えすぎてもジェネレートが比較的高速なHUGOをおすすめします。

【参考サイト】[Static Site Generators - Top Open Source SSGs | Jamstack](https://jamstack.org/generators/)


Ubuntuの方の場合、hugoのインストールは下記コマンドから。

    sudo apt install hugo

ね、簡単でしょ？[公式サイト](https://gohugo.io/getting-started/quick-start/)にはmacOSでの実装方法が書かれてあります。


### GitHubとは

エンジニア御用達、ソースコードのホスティングサイト。

ローカルで作成した記事をGitHubに公開し、それをNetlifyが検知してサイトが更新される仕組み。

GitHubは1ファイルの上限容量が100MBの制約があるものの、基本無料でコードのやりとりができる。

### Netlifyとは

[Netlify(ねっとりふぁい)](https://www.netlify.com/)は静的ファイルのホスティングサービスを展開するサイト。さくらサーバーとか、Xサーバーの無料版みたいなものだと思ってくれれば話が早い。

ただ、サイト内は普通に英語だし、日本語でのサポートはされていないので英語アレルギーのある方は注意。

基本無料で利用できて、アカウントの作成もGitHubのアカウントを使えばいいので、新たにパスワードを考えたり、メールアドレスを選んだりする必要はない。

レスポンスも高速だし、Let's Encryptを使ったHTTPS通信に対応していて、独自ドメインの指定も可能。

### ムームードメインとは

この記事においての唯一の課金要素、それが[ムームードメイン](https://muumuu-domain.com/)。ムームードメインはサイトに独自ドメインを指定する際に必要だけど、独自ドメイン要らないっていう人は別にお金払わなくても良いんじゃないかな。

.comドメインであれば1年で1100円〜1400円程度で入手可能。1ヶ月でおよそ100円前後。

.xyzドメインなら最初の1年は69円(2020年10月時点)だから1ヶ月につき5.75円....。うまい棒よりも安いサイト運営とは....。


支払い方法は、銀行振込の他にコンビニ決済、クレジット払いなどに対応。


## 実装の流れと全体像

GitHubのアカウント作成と静的サイトジェネレーターのインストールは完了済みとして説明します。

1. Netlifyのアカウントを作る(GitHubアカウントで)
1. GitHubのリポジトリと連携させる
1. ムームードメインとNetlifyのサイトのドメインを関連付け
1. Let'EncryptでHTTPS通信できるようにする


全体像的にはこんな感じ。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 15-47-02.png" alt="全体像"></div>

NetlifyにGitHubのリポジトリの変化を監視させ、変化があればサイトに反映。ユーザーはムームードメインを使用したサイトにアクセスすれば見れる。


## Netlifyのアカウントを作る(GitHubアカウントで)

まず、[ここから](https://app.netlify.com/signup)Netlifyのアカウントを作る。こんな感じの画面が見れるのでGithubをクリック

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 15-56-54.png" alt="Netlifyのアカウント作成"></div>

途中でNetlifyによるリポジトリのアクセスを認めるか否かを聞いてくるので、認める。


## GitHubのリポジトリと連携させる

新しくサイトを作り、GitHubリポジトリと連携させる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-01-04.png" alt="New site from Git"></div>

New site from Gitをクリック。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-03-15.png" alt="リポジトリ指定"></div>

githubアイコンをクリック、リポジトリが表示されるので、公開するサイトのデータが入ったリポジトリを指定。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-05-28.png" alt="デプロイ設定"></div>

hugoのソースコードを指定した場合、自動的にビルドしてくれる。この状態でdeploy siteをクリックして完了。


## ムームードメインとNetlifyのサイトのドメインを関連付け

ムームードメインで取得したドメインのセットアップをクリック。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-08-23.png" alt="DNS設定"></div>

カスタム設定を有効にして、下記のように入力する。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-09-29.png" alt="DNS設定"></div>

Netlifyで先程作ったサイトのDomain Settingsをクリック。Add domain aliasをクリックして、ムームードメインで取得したドメインを指定する。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-11-23.png" alt="DNS設定"></div>

## Let'EncryptでHTTPS通信できるようにする

ドメイン設定が終わったら、HTTPSの項目のボタンをクリックする。Let'EncryptのHTTPS設定が完了するまでに数分かかるのに注意。

<div class="img-center"><img src="/images/Screenshot from 2020-10-22 16-12-43.png" alt="HTTPS通信設定"></div>

上記画像はカスタムドメイン(独自ドメイン)を指定していない状態なので、指定しろといっていますが、指定した後はLet's Encrypt certificateのボタンが表示されます。



## 結論

ブログで有名な某氏がひたすらWordpressを推しているが、事前知識や技術のある人、もしくは少し勉強すればできる人は、こういう方法を選択するのもアリだと思う。

Wordpressは構造上セキュリティ的に脆い上に、お金かかるし、遅いし、バックアップ面倒だし、あまりメリット無いかも。

試験的に運用を始めるのであれば、一ヶ月100円程度でできるこの方法が良いでしょう。


まあ、要求される技術とかかるコストはトレードオフってことで。
