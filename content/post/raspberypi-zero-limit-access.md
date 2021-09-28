---
title: "Raspberry Pi Zeroに搭載したNginxの限界を試す【curlコマンド】"
date: 2021-09-28T10:20:02+09:00
draft: false
thumbnail: "images/rasp.jpg"
categories: [ "インフラ" ]
tags: [ "Raspberry Pi","Nginx","システム管理","シェルスクリプト" ]
---

Raspberry Pi Zeroの性能は無料プランのEC2やHerokuとほぼ同じ。Raspberry Pi Zeroの限界を知れば、ある程度EC2やHerokuの限界が予測できる。今回はウェブサーバーとして仕立てたRaspberry Pi Zeroにcurlコマンドでリクエストを大量送信し、サーバーダウンするまでのデータをここに記す。

なお、この行為は自分が管理していないサーバーで行うと、普通にDDos攻撃になってしまうので、宛先に外部のサーバーを指定しないように十分注意する。

(注意)DDos攻撃は複数の端末を使用しての攻撃なので、単体での攻撃は厳密にはDDos攻撃とは言わない。

## コマンド

    while true;do curl -LI 192.168.11.XXX -o /dev/null -w '%{http_code}\n' -s && sleep 0.001; done

上記IPアドレスを書き換え、実行する。

並列化はさせていない。タブを多重起動して動かす。

## 結果

ターミナルのタブを多重起動して同時に上記コマンドを実行すると、タブ10個辺りで目に見えてわかるほどレスポンスが遅くなった。

SSHでログインして、topコマンドを実行すると、NginxのCPU使用率が25%に到達。

<div class="img-center"><img src="/images/Screenshot from 2021-09-28 10-32-28.png" alt=""></div>

それと同時にリクエストを送信している側もCPU使用率が60%に。

<div class="img-center"><img src="/images/Screenshot from 2021-09-28 10-33-43.png" alt=""></div>

送信を終えるとNginxのCPU使用率は数パーセントに戻る。

<div class="img-center"><img src="/images/Screenshot from 2021-09-28 10-37-56.png" alt=""></div>

## ログを見る

こんなふうにベットリとログが残る。

<div class="img-center"><img src="/images/Screenshot from 2021-09-28 10-38-57.png" alt=""></div>

興味本位でも他人のサーバーへの攻撃はやめましょう。

『[Nginxのログをawkコマンドを使用して調べる【crontabで特定の条件下のログを管理者へ報告】](/post/nginx-log-check-by-awk/)』でも対策できる。

## 結論

30個ほどタブを起動して多重リクエストを送信したが、それでも落ちることは無かった。とは言え、今回はインストールしてすぐのNginxを使用している。

ウェブアプリケーションフレームワークなどを使用している場合、別途処理が必要になるので、これ以上のCPU使用率になることが予測される。ありえないレベルのアクセスを検知したら早めに対処したほうが良いと思われる。

