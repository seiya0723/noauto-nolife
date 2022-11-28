---
title: "【Python】virtualenvをactivateせずに、venvにインストールしたライブラリを読み込んで実行する【aliasやcrontabなどに】"
date: 2022-11-03T17:33:53+09:00
lastmod: 2022-11-03T17:33:53+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","tips","Ubuntu" ]
---

例えば、システムに直インストールするわけには行かないPythonライブラリを使うとする。

そういう時はvirtualenvを使って仮想開発環境を作り、そこにactivateしてインストールするとよいだろう。

だが、crontabやaliasなどで実行する場合はどうだろうか？ワンライナーで実行するにはactivateするわけには行かない場合もある。

そういう時は、このように実行するとよいだろう。

    venv/bin/python test.py

これで、カレントディレクトリのvenvの中に入り、test.pyを実行できる。その時インストールされているライブラリはvenvにインストールしたもので、OSに直インストールしたものではない。

