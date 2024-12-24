---
title: "DjangoをWindowsServerへデプロイする【EC2】"
date: 2023-11-23T15:55:18+09:00
lastmod: 2023-11-23T15:55:18+09:00
draft: true
thumbnail: "images/django.jpg"
categories: [ "インフラ" ]
tags: [ "デプロイ","Django","WindowsServer" ]
---

## 流れ

- WindowsServerのインスタンスを作成
- RDP用のパスワードを作る
- RDPクライアントツールを使って、RDP接続する。
- Pythonのインストール


## WindowsServerのインスタンスを作成


以下の構成でインスタンスを作成する。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-02-59.png" alt=""></div>
<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-05-12.png" alt=""></div>

まとめると

- WindowsServerの無料利用枠を指定
- インスタンスタイプも無料利用枠
- キーペアを作って割り当て
- セキュリティグループを作って、自分のIPアドレスのみRDPを許可する
- ストレージはそのまま

このインスタンスタイプの場合、低性能なためブラウザの動作に難がある。


無料でやることを優先しているため、操作を不自由に感じる場合はインスタンスタイプを高性能なものに変えると良いだろう(※要課金)


## RDP用のパスワードを作る

インスタンスの『接続』をクリックする。

RDPクライアントのタブをクリックして、パスワードの取得をクリックする。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-08-48.png" alt=""></div>

先程DLした.pemファイルをアップロードして、パスワードを作る。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-09-49.png" alt=""></div>

## RDPクライアントツールを使って、RDP接続する。

Remminaにすべてを貼り付ける。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-12-07.png" alt=""></div>

これで保存して接続をクリックする。

するとRDPでログインができるようになる。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-13-47.png" alt=""></div>

解像度が低い場合は、Remminaの設定からクライアントの解像度を使用するに変更すると良い。

デフォルトでは英語になっているため、日本語をWindowsの設定から追加する。

タイムゾーンも日本時間に設定しておく。

ちなみに、この日本時間、日本語の設定にやや時間がかかってしまう(15分ぐらい？)ので、お急ぎの場合は前もってやっておく。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-27-14.png" alt=""></div>


## Pythonのインストール

まずはPythonをインストールする。

EdgeでPythonの公式サイトへアクセスして、インストーラーをDLしてインストール。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-47-34.png" alt=""></div>

その際に、 全ユーザーに対してインストール、パスを追加 にチェックを入れておく。

インストール完了したらチェックしておく。

<div class="img-center"><img src="/images/Screenshot from 2023-11-22 15-40-23.png" alt=""></div>



## 必要なライブラリのインストール

仮想環境を構築して活性化。

```
python -m venv venv

.\venv\Scripts\activate
```

IISに必要なライブラリをインストールしておく。

```
pip install wfastcgi
```


## ウェブサーバーIIS(Internet Information Services)のインストール

- https://www.youtube.com/watch?v=sv1pwQFnFMI

上記動画に倣ってインストールする。

サーバーマネージャーを開き、ダッシュボードから役割と機能の追加を選ぶ。

Web Server(IIS) にチェックを入れてインストールする


## ウェブサーバーIIS(Internet Information Services)の設定

ツール からインターネットインフォメーション(ISS)サービスマネージャーを起動する。

WEBサイトの追加をクリック。任意のサイト名を指定し、Djangoのmanage.pyがあるプロジェクトのディレクトリを指定する。



Pythonのハンドラーマッピングを追加する。




この時、IISにFastCGIモジュールがインストールされていないと、『このハンドラーに対して指定されたモジュールが、モジュールの一覧にありません.....』などとひょうじされる。

サーバーマネージャーのダッシュボードからCGIをインストールする。

参照：https://www.ipentec.com/document/windows-windows-server-install-fast-cgi-module




wfastcgi を使用するためロックを解除する。

```
%windir%\system32\inetsrv\appcmd unlock config -section:system.webServer/handlers
```

仮想環境に入っている状態で。

```
wfastcgi-enable
```

を実行する。


## 結論

情報源に限りがあるため、検証にとても時間がかかった。

おそらく仕様が頻繁に変わっているものと思われる。

サーバーやミドルウェアにこだわりが無いのであれば、Ubuntu+Nginx+PostgreSQL+gunicorn+Djangoの構成のほうが良さそうだ。

[DjangoをAWSのEC2(Ubuntu)にデプロイする](/post/django-deploy-ec2/)


## 参照元

- https://qiita.com/reinexxx/items/ad60261815a5555e914e
- https://qiita.com/hakomasu/items/cf8da96ebb1a6204fc47
- https://www.youtube.com/watch?v=sv1pwQFnFMI
- https://www.ipentec.com/document/windows-iis-error-the-specified-module-required-by-this-handler-is-not-in-the-module-list
- https://www.ipentec.com/document/windows-windows-server-install-fast-cgi-module



<div class="img-center"><img src="" alt=""></div>
<div class="img-center"><img src="" alt=""></div>
<div class="img-center"><img src="" alt=""></div>
<div class="img-center"><img src="" alt=""></div>
<div class="img-center"><img src="" alt=""></div>

