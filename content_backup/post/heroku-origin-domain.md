---
title: "Herokuの無料プランで独自ドメインを設定し、HTTPS通信を行う方法【ムームードメイン+Cloudflare】"
date: 2022-02-22T08:13:11+09:00
draft: false
thumbnail: "images/heroku.jpg"
categories: [ "インフラ" ]
tags: [ "Heroku","システム管理" ]
---

無料プランでは独自ドメインのセットは出来てもHTTPS通信を行うことは出来ない。

そのため、Cloudflareをリバースプロキシとして機能させ、クライアントからCloudflare間まで暗号化させる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-22-17.png" alt=""></div>

一見安全性に欠けるような形だが、[AWSにデプロイした際も、クライアントからリバースプロキシ間までしか暗号化はされない](/post/ec2-origin-domain-https/)ので、それほど問題ではない。

気になるなら、有料プランを使用してHTTPS通信を行うと良いだろう。

## 手順

Cloudflareに登録する。

メールアドレスとパスワードを入力してアカウントを作る。

https://dash.cloudflare.com/sign-up

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-30-58.png" alt=""></div>

WebsitesからAdd siteを選ぶ。ムームードメインで取得したドメインをセットする。次のページで無料を選択する。

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-31-56.png" alt=""></div>

CNAME 独自ドメイン Herokuのドメイン を順に指定して保存する。

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-31-56.png" alt=""></div>

左サイドバーのDNSをクリックして、NSを調べる。

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-36-51.png" alt=""></div>

この情報を、ムームードメインのネームサーバー設定へ記述する。

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-41-22.png" alt=""></div>

Herokuへ独自ドメインをセットする。

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-42-27.png" alt=""></div>

Nextを押す

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 14-43-06.png" alt=""></div>

後は、CloudflareのSSLからSSLを有効化しておく。

これでOK。後はウェブアプリ側から独自ドメインを使用している旨を設定に描いておく。Djangoであればsettings.pyの`ALLOWED_HOSTS`にて、独自ドメインの文字列を追加しておく。

追加しておらず、DEBUGがTrueになっている場合は下記画面が出る。この場合、Djangoの設定問題であり、ドメイン問題は無い。

<div class="img-center"><img src="/images/Screenshot from 2022-02-22 15-13-27.png" alt=""></div>


## 参照元

- https://qiita.com/kenjikatooo/items/07c3d911210a4ca96781
- https://qiita.com/healing_code/items/0e334606709fb9deae87
- https://www.serversus.work/topics/yhyqln2f0bgw2yuak8vw/
- https://blog.cloud-acct.com/posts/heroku-domain-settings/
