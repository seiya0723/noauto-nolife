---
title: "DjangoをRender.comへデプロイする【Herokuの代替クラウド、アカウント作成から解説】"
date: 2022-11-24T15:50:04+09:00
lastmod: 2022-11-26T15:50:04+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "インフラ" ]
tags: [ "Django","render.com","デプロイ","クラウド","追記予定" ]
---

2022年11月28日、Herokuのサービスが完全無料で利用できなくなる。

そこで、代替のクラウドクラウドサービスとして最有力候補の[Render.com](https://render.com/)を使用する。

90日間しかDBは持たないとは言え、就活用のポートフォリオとしてウェブアプリを公開するには十分かと思われる。

本記事では、DjangoをRender.comへデプロイする方法を解説する。

## Render.comの基本情報

箇条書きで並べる。最近知ったので、一部間違いがあるかも。

- ウェブサーバーとDBサーバー(PostgreSQL)が無料で利用できる
- PostgreSQLは90日間無料、それ以降は要課金
- サーバーサイド三大フレームワークに対応(Rails、Laravel、Django)
- 静的サイトジェネレーターにも対応(HUGO、Gatsby)で完全無料
- dockerにも対応
- 有料だが、cron(タスクスケジューラー)が用意されている
- アカウントはGitHubのアカウントから簡単に作ることができる(パスワード不要)
- デプロイはHerokuとは違い、GitHubからリポジトリを登録してデプロイする



## Render.comのアカウント作成

下記URLへアクセスする。

https://dashboard.render.com/register

<div class="img-center"><img src="/images/Screenshot from 2022-11-24 15-49-39.png" alt=""></div>

GitHubをクリックすると、お手元のGitHubアカウントを使ってアカウント作成ができる。持っていない場合はグーグルアカウントか、EmailとPasswordを入力

アカウントアクティベート用のメールが送信されるので、URLをクリックする。

<div class="img-center"><img src="/images/Screenshot from 2022-11-24 16-06-21.png" alt=""></div>

アカウント作成後、ダッシュボードが表示される。

<div class="img-center"><img src="/images/Screenshot from 2022-11-24 16-08-48.png" alt=""></div>


## Render.comにて、リポジトリを追加する

ウェブサービスを作る。ダッシュボードから、`Web Service`をクリックする。

https://dashboard.render.com/select-repo?type=web

右の欄から、GitHubの連携が指定できるので、下記画面に移動して、

<div class="img-center"><img src="/images/Screenshot from 2022-11-24 16-56-39.png" alt=""></div>

送信する。

そうすると、このように、GitHubのリポジトリが選べるようになる。

<div class="img-center"><img src="/images/Screenshot from 2022-11-24 16-57-24.png" alt=""></div>



## Djangoをデプロイする

### 流れ

1. poetryをインストール
1. poetryを使って、djangoをインストール、poetryファイルの修正
1. settings.pyをRender.com仕様に変更
1. デプロイに必要なライブラリのインストール
1. ビルド用のシェルスクリプトを作る
1. デプロイ用の設定を施す(render.yamlもしくはマニュアルデプロイ?)
1. リポジトリにプッシュする(デプロイ完了 .onrender.comをチェック)



### poetryをインストール

Render.comではpoetryを使ってDjangoプロジェクト、Python、及びライブラリの管理を行う。

そのため、前もってpoetryをインストールする。Renderのドキュメントに書かれてあるインストール方法は古いので、下記を参照。

https://python-poetry.org/docs/

Ubuntuの場合は、下記コマンドを実行してインストールするだけ。

```
curl -sSL https://install.python-poetry.org | python3
```

<div class="img-center"><img src="/images/Screenshot from 2022-11-24 17-27-48.png" alt=""></div>



以降、近日追記予定。


### poetryを使って、djangoをインストール、poetryファイルの修正
### settings.pyをRender.com仕様に変更
### デプロイに必要なライブラリのインストール
### ビルド用のシェルスクリプトを作る
### デプロイ用の設定を施す(render.yamlもしくはマニュアルデプロイ?)
### リポジトリにプッシュする(デプロイ完了 .onrender.comをチェック)


## 結論




### 参照元

- https://render.com/docs/deploy-django
- https://render.com/docs/github



