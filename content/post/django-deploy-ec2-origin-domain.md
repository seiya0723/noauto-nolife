---
title: "【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager】"
date: 2021-09-05T15:32:11+09:00
draft: true
thumbnail: "images/aws.jpg"
categories: [ "サーバーサイド" ]
tags: [ "aws","ec2","システム管理" ]
---

タイトルの通り。

## 手順

1. EC2のインスタンスを作る
1. セキュリティグループを書き換える
1. ElasticIPを割り当てる
1. Route53に独自ドメインを割り当てる
1. SSHで独自ドメインでログインしてみる
1. Certificate Managerを使ってHTTPS通信を実現させる


## EC2のインスタンスを作る

まず、EC2のインスタンスを作る。インスタンスの作り方は[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)に倣う。

## セキュリティグループを書き換える

HTTPとSSHをマイIPからのインバウンドのアクセスを許可する。詳細は[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)から。

## ElasticIPを割り当てる

EC2にはパブリックIPアドレスが割り当てられているが、これはEC2が停止してしまうと別のパブリックIPアドレスになってしまう。この状態で独自ドメインとすぐに変わるEC2のパブリックIPアドレスをくっつけると、すぐに独自ドメインでアクセスできない問題が発生してしまう。

これを防ぐために、EC2に停止しても変わらないIPアドレスを割り当てる。

EC2の右サイドバーの当たりにElasticIPのリンクがあるのでそれをクリック。

<div class="img-center"><img src="" alt=""></div>




ElasticIPを割り当てた後にEC2へアクセスする際には、EC2のパブリックIPとパブリックDNSを使うのではなく、ElasticIPのパブリックIP及びパブリックDNSを使う。

## Route53に独自ドメインを割り当てる

続いて、Route53に独自ドメインを割り当てる。まずはホストゾーンを作成する。先ほどムームードメインで取得しておいたドメインで作成を行う。説明は適当でOK。


<div class="img-center"><img src="" alt=""></div>

ホストゾーンを作成すると、NSレコード、SOAレコードの2つが自動的に作られる。この内NSレコードの4つの値をムームードメインに貼り付ける

ムームードメインから割り当てる予定のドメイン名の『ネームサーバ設定変更』にある、『取得したドメインで使用する ※上級者向け』を選んで、ネームサーバ1~4に上から順にネームサーバのドメイン名をコピペしていく。ホストゾーンに書かれてあるネームサーバのドメイン名には、末尾に.が含まれているので含めないようにコピペ。


<div class="img-center"><img src="" alt=""></div>

続いて。Aレコードを追加する。ムームードメインで取得したドメインと、EC2と繋がっているElasticIPのパブリックIPをくっつける。これでEC2とドメイン名が繋がる。

<div class="img-center"><img src="" alt=""></div>


## SSHで独自ドメインでログインしてみる

ここまで間違えずに設定を施せたら、独自ドメインでSSHログインができるようになる。

ただ、独自ドメインが使えるようになるまで小一時間程度かかるので、下記コマンドを実行して放置する。3分おきにSSHログインを試みるワンライナーコマンドである。適宜書き換えて使う。

    while true; do ssh -i "seiya0723-test4.pem" ubuntu@seiya0723-20210905.xyz; date; sleep 3m; done

一時間ほどかかったが無事ログインできた。

<div class="img-center"><img src="" alt=""></div>

ちなみに、`http://独自ドメイン` でアクセスすると、普通にウェブページにサイトが表示される。ただし、AWSのセキュリティにHTTPを許可している場合に限る。

## Certificate Managerを使ってHTTPS通信を実現させる







## 結論

Route53からドメインを取得する場合、今回やったムームードメインのNSコピペの作業は行わなくて良い。

ただ、Route53のドメインの料金はやや高め。今回のようにテストで独自ドメイン割り当てを行うのであれば、安い.xyz等のドメイン(年間66円)をムームドメインなどから買ったほうが良い。更新には普通に1600円以上かかるので、1年で解約する使い捨てとして扱う。

また、独自ドメインを取得する時、冒頭に`www.`をつけるなどと書かれたサイトがいくらかあるが、別に無くても良い。URLが冗長に見える場合はあえて付けなくても良いだろう。





### 参照元

この手の問題は『EC2 独自ドメイン』とかで検索するといっぱい出てくる。以下参照元

https://mel.onl/onamae-domain-aws-route-53/

https://avinton.com/academy/route53-dns-vhost/

https://qiita.com/_y_s_k_w/items/f3ec202acbac17ae2929

https://qiita.com/OPySPGcLYpJE0Tc/items/4a141a880351cf655de9

https://qiita.com/nakanishi03/items/3a514026acc7abe25977