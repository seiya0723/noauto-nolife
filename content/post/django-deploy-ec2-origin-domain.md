---
title: "【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】"
date: 2021-09-05T15:32:11+09:00
draft: false
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
1. Certificate Managerとロードバランサを使ってHTTPS通信を実現させる


## EC2のインスタンスを作る

まず、EC2のインスタンスを作る。インスタンスの作り方は[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)に倣う。

## セキュリティグループを書き換える

HTTPとSSHをマイIPからのインバウンドのアクセスを許可する。詳細は[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)から。

## ElasticIPを割り当てる

EC2にはパブリックIPアドレスが割り当てられているが、これはEC2が停止してしまうと別のパブリックIPアドレスになってしまう。この状態で独自ドメインとすぐに変わるEC2のパブリックIPアドレスをくっつけると、すぐに独自ドメインでアクセスできない問題が発生してしまう。

これを防ぐために、EC2に停止しても変わらないIPアドレスを割り当てる。

EC2の右サイドバーの当たりにElasticIPのリンクがあるのでそれをクリック。ElasticIPアドレスの割り当てというオレンジのボタンが右上にあるのでそれをクリックする。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 13-09-43.png" alt=""></div>

クリックしたらそのままの設定で作成する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 13-09-58.png" alt=""></div>

ElasticIPアドレスが付与される。このIPアドレスがEC2と関連付けられ、固定のIPアドレスとして機能する。そのため、作ったElasticIPアドレスをクリックしてEC2と関連付けを行う。

ElasticIPアドレスの関連付けというオレンジのボタンがあるのでそれをクリック。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 13-10-45.png" alt=""></div>

リソースタイプはインスタンスを選択。関連付けるEC2インスタンスを選ぶ。関連付けるのオレンジのボタンを押す。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 13-11-24.png" alt=""></div>

これで割り当ては完了。

ElasticIPを割り当てた後にEC2へアクセスする際には、EC2のパブリックIPとパブリックDNSを使うのではなく、ElasticIPのパブリックIP及びパブリックDNSを使う。

## Route53に独自ドメインを割り当てる

続いて、Route53に独自ドメインを割り当てる。まずはホストゾーンを作成する。先ほどムームードメインで取得しておいたドメインで作成を行う。説明は適当でOK。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 16-28-50.png" alt=""></div>

ホストゾーンを作成すると、NSレコード、SOAレコードの2つが自動的に作られる。この内NSレコードの4つの値をムームードメインに貼り付ける

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 16-29-37.png" alt=""></div>

ムームードメインから割り当てる予定のドメイン名の『ネームサーバ設定変更』にある、『取得したドメインで使用する ※上級者向け』を選んで、ネームサーバ1~4に上から順にネームサーバのドメイン名をコピペしていく。ホストゾーンに書かれてあるネームサーバのドメイン名には、末尾に.が含まれているので含めないようにコピペ。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 16-37-54.png" alt=""></div>

続いて。Aレコードを追加する。ムームードメインで取得したドメインと、EC2と繋がっているElasticIPのパブリックIPをくっつける。これでEC2とドメイン名が繋がる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 16-41-27.png" alt=""></div>

レコード作成のボタンを押すとAレコードが追加される。

<div class="img-center"><img src="/images/Screenshot from 2021-09-07 16-44-24.png" alt=""></div>

## SSHで独自ドメインでログインしてみる

ここまで間違えずに設定を施せたら、独自ドメインでSSHログインができるようになる。

ただ、独自ドメインが使えるようになるまで小一時間程度かかるので、下記コマンドを実行して放置する。3分おきにSSHログインを試みるワンライナーコマンドである。適宜書き換えて使う。

    while true; do ssh -i "XXXXXXXXXXX.pem" ubuntu@独自ドメイン; date; sleep 3m; done

一時間ほどかかったが無事ログインできた。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-42-24.png" alt=""></div>

ちなみに、`http://独自ドメイン` でアクセスすると、普通にウェブページにサイトが表示される。ただし、AWSのセキュリティにHTTPを許可している場合に限る。

## Certificate Managerとロードバランサを使ってHTTPS通信を実現させる

CertificateManager、ロードバランサを使ってHTTPS通信を実現させる。一言で言うと、CertificateManagerは電子証明書を管理する係、ロードバランサはHTTPS/HTTP通信のリソースを振り分ける係。

また、HTTPS通信を行うために、セキュリティとRoute53の設定も同時に施す。まずはCertificateManagerで電子証明書を作る。証明書のプロビジョニングをクリック。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-52-35.png" alt=""></div>

パブリックの証明書をリクエスト。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-52-44.png" alt=""></div>

先ほどRoute53に指定した独自ドメインを指定。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-53-35.png" alt=""></div>

検証方法はDNSの検証。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-54-04.png" alt=""></div>

タグはいらない。確認して作成する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-54-22.png" alt=""></div>

検証保留中になっている。CNAMEタイプのレコードをRoute53に追加する。Route53でのレコード作成の青いボタンを押すと、即作られて便利。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-55-20.png" alt=""></div>

CNAMEタイプのレコードが追加された。これでOK

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 16-56-00.png" alt=""></div>

続いてロードバランサを作成する。EC2の左サイドバーからロードバランサをクリック、下記の表示される画面から『ロードバランサの作成』の青いボタンをクリック。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 17-09-02.png" alt=""></div>

ロードバランサの種類の選択ではApplication Load Balancerを作成する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 17-09-19.png" alt=""></div>

名前をつける。ドメインの名前そのままでいい。リスナーにHTTPSを指定する。ポート番号は自動的に443になる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-07-43.png" alt=""></div>

上記の画像からスクロールして表示されるアベイラビリティーゾーンに追加を施す。2つのチェックボタンをつける。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-07-56.png" alt=""></div>

セキュリティ設定の構成を行う。証明書タイプはACMから証明書を選択するをチェック。証明書の名前は先ほどCertificateManagerで作った証明書を選択。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-08-21.png" alt=""></div>

ロードバランサのセキュリティグループの設定。新しいセキュリティグループを作るをチェック。HTTPS通信を許可する。ここで、自分以外のアクセスを拒否したいのであれば、ソースにマイIPを選択する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-08-55.png" alt=""></div>

ルーティングの設定を行う。これはロードバランサがEC2にアクセスを振り分けするための設定。ロードバランサとEC2の間はHTTP通信を行う。新しいターゲットグループを選択。名前は自由に。

ターゲットの種類はインスタンス。プロトコルはHTTPでポート番号は80番。ここでHTTPSと443を指定してしまうと動かなくなるので注意。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-09-40.png" alt=""></div>

ターゲットとして割り当てるインスタンスを指定する。もちろんEC2のインスタンスをここで選択する。ただし、繰り返しになるが、ロードバランサとEC2間はHTTP通信なので、インスタンスのポートは80のままにしておく。

インスタンスを選んで青色の『登録済みに追加』ボタンを押す。後は確認してロードバランサの作成完了。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-10-20.png" alt=""></div>

EC2のセキュリティ設定から、インバウンドルールを編集。ロードバランサからのHTTP通信を許可する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-09 09-01-51.png" alt=""></div>

Route53にて、エイリアスを設定する。Aレコードをクリックして、右側に表示されるダイアログからエイリアスをチェック。アプリケーションロードバランサ、アジアパシフィックのリージョンを選択。先ほど作ったロードバランサを指定する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-13-45.png" alt=""></div>

この状態でHTTPSで独自ドメインに対してアクセスを行い、ページが表示されれば完了。ただし、表示までに時間がかかる可能性がある。

<div class="img-center"><img src="/images/Screenshot from 2021-09-09 09-43-23.png" alt=""></div>


## 質問コーナー

おそらくよくあると思われる質問を列挙する。

### このEC2とCertificateManagerとロードバランサの関係ってどういう？

だいたいこんな感じ。クライアントからロードバランサーまではHTTPS通信が行われている。ロードバランサがHTTPS通信を解析して完全性などを確認。ロードバランサとEC2は解読されたHTTP通信で処理がされる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-09 09-58-09.png" alt=""></div>

これを見て、『ロードバランサとEC2間がHTTP通信で暗号化されていないじゃないか(怒)』って思う人は冷静に考えてもらいたい。

ロードバランサとEC2間でもHTTPSを実現しようとした時、別途証明書の発行とHTTPS通信の処理が必要になる。証明書の発行ができたとしても、そのHTTPS通信の処理をロードバランサで行わなければ処理が追いつかない。よって、ロードバランサ間とEC2間でHTTPS通信を実現するのであれば、また別のロードバランサが必要になる。新しく作った別のロードバランサとEC2間はHTTP通信になる。この再帰的なループは永遠に解消されない。

以上から、ロードバランサとEC2間はHTTP通信じゃなければ実現し得ない。だからこそ、AWSに限らず、HTTPSを処理するロードバランサとウェブサーバーの間に別の端末を噛ませないように仕立て、ロードバランサ及びウェブサーバーのセキュリティは厳重にする必要がある。

### HTTPで独自ドメインにアクセスすると何も表示されない・拒否される

現状ではロードバランサはHTTPS通信しか処理をしていない。そのため、リスナーを追加して、HTTP通信が来たらHTTPS通信にリダイレクトするように仕立てる。これでHTTPのURLでアクセスしたユーザーをHTTPSに切り替えることができる。

ロードバランサーからリスナータブをクリック。リスナーを追加する。

<div class="img-center"><img src="/images/Screenshot from 2021-09-08 21-24-00.png" alt=""></div>

ロードバランサーのセキュリティから、HTTP通信を許可する。画像ではいずれもマイIPからのアクセスを許可している。

<div class="img-center"><img src="/images/Screenshot from 2021-09-09 09-36-20.png" alt=""></div>

この状態でしばらくした後、HTTPで独自ドメインにアクセスを試みた場合、HTTPSへリダイレクトされる。

### SSHでログインする際に独自ドメイン使うと拒否される

このロードバランサーとRoute53の設定を施した状態で、下記のようにSSHログインを試みると失敗する。

    ssh -i "XXXXXXXXXXX.pem" ubuntu@独自ドメイン

なぜかと言うと、Route53のエイリアスで独自ドメインを使用したアクセスはロードバランサーを経由するようになっているから。ロードバランサー側ではHTTP通信もしくはHTTPS通信しか受け付けない。つまりSSHによる独自ドメインのアクセスは拒否される。故にログイン失敗する。

そのため、EC2に対してSSHログインを試みる場合は、ElasticIPのパブリックIPアドレスを使ってログインをする。

    ssh -i "XXXXXXXXXXX.pem" ubuntu@ElasticIPのパブリックIPアドレス

ちなみに、TCPのリスナーが設定できるロードバランサであれば、下記サイトのようにリスナーの設定をすればドメインでSSHログインをすることもできるが、あえてやらなくても、ElasticIPのパブリックIPアドレスでSSHアクセスする方法でも問題はない。

https://dev.classmethod.jp/articles/aws-elb-ssh/

## 結論

Route53からドメインを取得する場合、今回やったムームードメインのNSコピペの作業は行わなくて良い。

ただ、Route53のドメインの料金はやや高め。今回のようにテストで独自ドメイン割り当てを行うのであれば、安い.xyz等のドメイン(年間66円)をムームドメインなどから買ったほうが良い。更新には普通に1600円以上かかるので、1年で解約する使い捨てとして扱う。

また、独自ドメインを取得する時、冒頭に`www.`をつけるなどと書かれたサイトがいくらかあるが、別に無くても良い。URLが冗長に見える場合はあえて付けなくても良いだろう。

ロードバランサーを経由して、HTTPS通信を行う方法にやや手間が掛かった。この辺りは、ロードバランサの役割やHTTPS通信の流れを知っていなければ、答えにたどり着くのは難しいだろう。また、[コメント欄で指摘されている間違った方法が書かれたqiita](https://qiita.com/nakanishi03/items/3a514026acc7abe25977)が検索の上位でヒットしたので要注意。[正しくはこちらを参照](https://recipe.kc-cloud.jp/archives/11084)にしたい。

### 参照元

この手の問題は『EC2 独自ドメイン』とかで検索するといっぱい出てくる。以下参照元。

https://mel.onl/onamae-domain-aws-route-53/

https://avinton.com/academy/route53-dns-vhost/

https://qiita.com/_y_s_k_w/items/f3ec202acbac17ae2929

https://qiita.com/OPySPGcLYpJE0Tc/items/4a141a880351cf655de9

https://recipe.kc-cloud.jp/archives/11084
