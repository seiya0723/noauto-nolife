---
title: "WindowsでPythonとPycharmをインストールする"
date: 2022-09-01T08:49:01+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "インフラ" ]
tags: [ "Windows","開発環境","Python","pycharm","初心者向け" ]
---

## Pythonのインストール

Pythonのインストーラーを配布しているサイト( https://www.python.org/downloads/ )へ行く。

Download Python 3.10.6 の部分をクリックする。インストーラーがDLされる。

( ※下記画像の赤枠部分。3.10.6は2022年9月現在のバージョンであり、今後バージョンが更新される。最新版のPythonインストーラーをDLする。 )

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 08-50-59.png" alt=""></div>


ダウンロードフォルダにて、先ほどDLしたインストーラーのファイルがあるので、ダブルクリックしてPythonインストーラーを起動させる。(※下記画像赤枠の部分)

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 08-56-56.png" alt=""></div>


Add Python 3.10 to PATHにチェックを入れた上で(1の部分)、Install Nowをクリックする(2の部分)

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 08-59-03.png" alt=""></div>

インストールが完了した。そのままcloseをクリックして終わる。

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-02-55.png" alt=""></div>

## Pycharmのインストール

PycharmのCommunity版(無料版)をインストールする。下記リンクへアクセス。

https://www.jetbrains.com/ja-jp/pycharm/download/#section=windows

Community版のダウンロード(下記画像の赤枠部分)をクリック

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-06-06.png" alt=""></div>


ダウンロードフォルダにて、先ほどDLしたインストーラーのファイルがあるので、ダブルクリックしてPycharmインストーラーを起動させる。(※下記画像赤枠の部分)

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-08-42.png" alt=""></div>

Nextをクリック

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-10-00.png" alt=""></div>

インストールする場所はデフォルトで良いので、Nextをクリック

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-10-10.png" alt=""></div>

全部にチェックを入れて、Nextをクリック

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-10-52.png" alt=""></div>

StartMenuFolderはそのままでNextをクリック

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-11-01.png" alt=""></div>

Reboot Nowを選んで、Finishをクリック。この時、再起動されるので、他のソフトやアプリは終了させておく。

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-13-30.png" alt=""></div>


## Pycharmを起動し、PythonのHelloWorldを作って動かす

下記画像のデスクトップ、もしくはスタートメニューにPycharmが追加されているので、ダブルクリックして起動する。

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-18-30.png" alt=""></div>

前に、Pycharmをインストールしたことがある場合、設定ファイルのimportを聞かれるので、インポートしないを選択

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-20-19.png" alt=""></div>

プロジェクトを作る。New Projectをクリック。

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-20-49.png" alt=""></div>

Createをクリック

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-21-06.png" alt=""></div>

pythonProjectにカーソルを合わせてで右クリック、New→Fileを選ぶ

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-26-00.png" alt=""></div>

ファイル名は、test.pyとする。Enterキーを押して作成

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-27-57.png" alt=""></div>

test.pyのエディタにて、下記を記述する

```
print("Hello World !!")
```

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-29-37.png" alt=""></div>

Altキーを押しながらF12を押して、Terminalを表示させる(※Pycharm画面下部のTerminalボタンをクリックしても良い)

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-31-29.png" alt=""></div>

このTerminalに下記コマンドを入力する。先ほど作ったtest.pyを実行するコマンドである。

```
python test.py
```

入力し終わったらEnterキーを押して実行する。下記のようにHelloWorldが表示される。

<div class="img-center"><img src="/images/Screenshot from 2022-09-01 09-31-57.png" alt=""></div>

これでPythonとPycharmのインストールは完了


ただ、このPycharm。デフォルトの設定だと文字が非常に小さく見づらい上に、お節介な補正や警告もあるので、設定を変更しておくことをおすすめする。


[Pycharmを使う前にやっておきたい設定と覚えておくと良い操作方法](/post/pycharm-config/)

