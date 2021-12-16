---
title: "【GitHub】gitコマンドでリモートリポジトリへプッシュするためのトークンをジェネレートする"
date: 2021-12-16T15:07:28+09:00
draft: false
thumbnail: "images/github.jpg"
categories: [ "others" ]
tags: [ "git","github" ]
---

gitコマンドでGitHubにプッシュする時、アカウントのパスワードではプッシュすることはできない。前もってアカウント内に作っておいたトークンを入力する必要がある。

本記事ではその作り方を解説する。

## トークン生成手順

下記リンク、もしくは`Settings`から`Developer settings`をクリック、`Personal access tokens`をクリックする。

https://github.com/settings/tokens

`Generate new token`をクリック。パスワードの入力を要求されるので入力。有効期限と`repo`にチェックを入れる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-16 15-12-13.png" alt=""></div>

`generate token`をクリックするとトークンが表示される(下記画像の赤い部分)ので、適当な場所にコピーしておき、gitコマンドでパスワードを入力する際に入力する。

<div class="img-center"><img src="/images/Screenshot from 2021-12-16 15-14-04.png" alt=""></div>

削除したい時は、`Delete`ボタンを押すだけ。

