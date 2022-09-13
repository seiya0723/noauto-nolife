---
title: "vimの操作方法"
date: 2022-09-11T18:24:04+09:00
draft: false
thumbnail: "images/vim.jpg"
categories: [ "インフラ" ]
tags: [ "vim","システム管理","エディタ" ]
---


## 前提

vimは通常のテキストエディタと違って、主に3つのモードを使い分けて編集を行う

- コマンドモード
- 挿入モード
- ビジュアルモード

### コマンドモード

vimを起動した時、デフォルトでこのモードになっている。

保存や終了、検索やマクロなどのコマンドを実行する事ができる。


### 挿入モード

テキスト入力をするモード。`i`、`o`、`a`キーのいずれかでこのモードに入る。

挿入モードを終了してコマンドモードに移行するにはEscキーを押す。

### ビジュアルモード

文字を選択してヤンク(コピー)したりペーストしたりする事ができる。

vキーに加え、ShiftやCtrlを組み合わせることで、行ビジュアルや矩形選択もできる。

ビジュアルモードを終了してコマンドモードに移行するにはEscキーを押す。


## 使えるプラグイン

- emmet.vim
- surround.vim


- emment.vim: https://github.com/mattn/emmet-vim
- surround.vim: https://www.vim.org/scripts/script.php?script_id=1697

`~/.vim/`に解凍する。


## おすすめ設定

`vimrc`を編集する

    sudo vi /usr/share/vim/vimrc


内容を下記とする。


    "行番号表示
    set number
    "タイトルの表示
    set title
    "検索時にハイライト表示
    set hlsearch
    "マークダウンを書くときに斜体を禁止する
    autocmd! FileType markdown hi! def link markdownItalic Nomal
    "全角記号の重なりの修正
    set ambiwidth=double

    set tabstop=4
    set softtabstop=4
    set shiftwidth=4
    set expandtab
    set autoindent
    set smartindent
    
## 結論

インフラ系にも進みたい場合、vimを覚えておいて損はないだろう。

最近のサーバーは扱いやすいnanoエディタもデフォルトでインストールされているが、扱い慣れたvimの操作感には及ばないと思う(個人の感想)




