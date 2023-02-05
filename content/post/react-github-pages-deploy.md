---
title: "【React】GithubPagesへデプロイする【ビルドしてプッシュする】"
date: 2023-02-02T17:27:41+09:00
lastmod: 2023-02-02T17:27:41+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","github","デプロイ" ]
---

ReactはJavaScriptのライブラリであり、サーバーレスなのでGitHubPagesへのデプロイが可能。

端的に言うと、ビルドしてGitHubにプッシュするだけ。

## 【前提知識】package.jsonを編集して独自のnpmコマンドを作る

`package.json`を編集して独自のnpmコマンドを作る。

例えば、 以下のように`scripts`に`"hoge" : "echo 'hoge' "`と追加しておく。

```
~略~

  "scripts": {
    ~ 省略 ~ 

    "hoge" : "echo 'hoge' "
  },  

~略~
```
この状態で、下記コマンドを実行すると

```
npm run hoge 
```

このように表示される。

<div class="img-center"><img src="/images/Screenshot from 2023-02-05 15-55-37.png" alt=""></div>


## githubへデプロイをする独自のnpmコマンドを作る

前項の仕様を使って、ビルドからGitHubへプッシュするまでのコマンドを作る。

また、`homepage`にデプロイ先のURLを書いておく。(アカウント名とリポジトリ名を指定)

```
~ 略 ~ 
  "homepage": "https://seiya0723.github.io/react-githubpages/",
  ~ 略 ~
  "scripts": {

    ~ 略 ~

    "rm": "rm -rf docs",
    "mv": "mv build docs",
    "git": "git add . && git commit -m 'add' && git push origin master",
    "deploy": "npm run rm && npm run build && npm run mv && npm run git"
  },  
~ 略 ~
```

デプロイをするときには
```
npm run deploy
```
を実行するだけ。 その内容は

- docsを削除する
- ビルドする(buildディレクトリが作られる)
- buildディレクトリをdocsに改名
- git ステージング → コミット → プッシュ

一旦docsを削除することで、以前ビルドした内容から削除されたものが残存しないようにできる。


## GithubPages の設定

GitHubPagesの設定から、公開するパスは`docs/`を指定する。

<div class="img-center"><img src="/images/Screenshot from 2023-02-05 16-03-28.png" alt=""></div>

## 結論

これでReactで作られたサイトをデプロイできる。

基本的には`package.json`を書き換えて、ビルドすれば良いだけなので、それほど難しくはない。

Reactのフレームワークである、Next.jsなどを使えば更に楽に静的サイトを作ることができるのでは？と考えている。

参照元

- https://qiita.com/tat_mae084/items/745761eee6cd1d42949d
- https://qiita.com/hashrock/items/15f4a4961183cfbb2658

公開先 : https://seiya0723.github.io/react-githubpages/

