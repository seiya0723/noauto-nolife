---
title: "【LPIC】Level1で出てくるコマンドと用語の一覧"
date: 2023-03-07T13:03:51+09:00
lastmod: 2023-03-07T13:03:51+09:00
draft: false
thumbnail: "images/lpic.jpg"
categories: [ "インフラ" ]
tags: [ "LPIC","Linux","追記予定" ]
---


順不同。LPICレベル1で出たコマンドと用語の簡単な説明を一覧にしておく。

## コマンド

|コマンド|簡単な説明|
|:--:|:---|
|set|シェル変数やシェルオプションを設定・表示するコマンド|
|env|環境変数を表示するコマンド|
|history|コマンド履歴を表示するコマンド|
|mkdir|ディレクトリを作るコマンド|
|ls|カレントディレクトリのファイル、ディレクトリを表示するコマンド(list segmentsの略)|
|man|マニュアルを表示するコマンド|
|whoami|ユーザー名を表示するコマンド|
|pwd|カレントディレクトリの絶対パスを表示するコマンド|
|tar|アーカイブファイル(複数のファイルを1つにまとめたファイル)を作ったり、取り出したりできる。|
|more|1画面に収まりきらない時、1ページ毎にわけて表示させる。|
|file|指定したファイルの種類を表示する。-i オプションを指定するとMIMEタイプを表示する。|
|tr|入力した文字を指定した文字に変換して出力する。translateの略|
|tee|標準入力した文字列を標準出力し、指定したファイルにも出力する。[アルファベットのTの略](https://en.wikipedia.org/wiki/Tee_(command)) |
|iconv|指定したファイルの文字コードを変換する|
|od|ファイルを8進数もしくは16進数でダンプする|
|sed|ファイルから指定したパターンに一致する文字列を置|
|ps|Linux上で動作しているプロセスを表示するコマンド。ps ax とすることで、全てのプロセスを表示させる(ps -ef でも全て表示)|
|pstree|プロセスの改造構造を表示する|
|nice|プロセスのプライオリティをデフォルトから変更して実行する。-20~19の範囲で優先度の値を指定できる|
|renice|実行中のプロセスのプライオリティを変更する。topコマンドでも変更可能|
|split|ファイルを決まった大きさに分割する。|
|fg|バックグラウンドで動作しているジョブをフォアグラウンドで動かす。例えばvimでctrl+zの後fgで復帰できる|
|jobs|バックグラウンドで動作しているジョブを全て表示する。|
|watch|指定したコマンドを指定した秒毎に繰り返し実行する。デフォルトでは2秒毎に実行する|
|pvcreate|LVM(Logical Volume Manager)の物理ボリュームを作成するコマンド。フィジカルボリュームクリエイトの略|
|fdisk|パーティションの変更、削除、作成、情報表示ができる。|
|groups|指定したユーザーの所属グループを表示する|


## 用語

|用語|簡単な説明|
|:--:|:---|
|アーカイブファイル|複数のファイルを一つにまとめたファイル。圧縮していなくても一つにまとめられていればアーカイブファイルと言える。|
|シェル変数|シェルで使用できる変数。子プロセスからは参照できない|
|環境変数|シェルだけでなく、子プロセスからでも参照できる変数|
|LVM|Logical Volume Managerの略。論理的にパーティションを管理する。|


## ファイルパスと役割

|パス|アクセス権|役割|
|:--:|:--:|:---|
|`/etc       `|`drwxr-xr-x`|システム管理・ソフトウェアなどの設定ファイルが格納されている。|
|`/etc/passwd`|`-rw-r--r--`|OSに登録されているユーザーを表示する。一般ユーザーの他、rootやdaemon等がある。|
|`/etc/shadow`|`-rw-r-----`|OSに登録されているユーザーのパスワードをハッシュ化して格納している。|
|`/etc/hosts `|`-rw-r--r--`|IPアドレスとホスト名の対応を記述するファイル。|
|`/dev       `|`drwxr-xr-x`|デバイスファイルを配置するディレクトリ。<br>システム起動時に接続されているデバイスファイルをチェックして自動的に作成される。|
|`/dev/null  `|`crw-rw-rw-`|特殊なデバイスファイル。ファイルに書かれたものは全て消去される。|
|`/var       `|`drwxr-xr-x`|システム運用中にサイズが変化するファイルが配置される。|
|`/var/log   `|`drwxrwxr-x`|システムやアプリケーションのログファイルが配置される。|
|`/bin       `|`lrwxrwxrwx`|一般ユーザー、管理者が使用するコマンドが配置されている。 <br>/usr/bin のシンボリックリンク。binはバイナリの略。バイナリでコマンドが保存されているため。|
|`/lib       `|`lrwxrwxrwx`|各種コマンドが使用するライブラリが配置されている。 /usr/lib のシンボリックリンク。 |
|`/lib64     `|`lrwxrwxrwx`|64bit用のライブラリが配置されている。 /usr/lib64 のシンボリックリンク。 |
|`/usr       `|`drwxr-xr-x`|ユーザーが共有するデータが配置されてある。ユーティリティやコマンド、ライブラリが配置されてある。|
|`/usr/bin   `|`drwxr-xr-x`|一般ユーザー、管理者が使用するコマンドが配置されている。|
|`/usr/lib   `|`drwxr-xr-x`|各種コマンドが使用するライブラリが配置されている。|
|`/usr/lib64 `|`drwxr-xr-x`|64bit用のライブラリが配置されている。|


