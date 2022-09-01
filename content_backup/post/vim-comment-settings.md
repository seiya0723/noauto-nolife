---
title: "Vimのコメントの自動補完を無効化させる【JavaScriptやCSS、シェルスクリプトでコメントアウトした後、Enter押すと自動で出てくるアレ】"
date: 2021-11-15T07:39:25+09:00
draft: false
thumbnail: "images/vim.jpg"
categories: [ "others" ]
tags: [ "vim","tips" ]
---

例えばJavaScriptでコメントを書く時、

    //

と書く。だが、その後Enterキーを押すと

    //
    //

こうなる。これがすごい鬱陶しい。

頼んでもいないのにコメント行が勝手に増えて行くのは、消す手間も同時に増えるということ。だから無効化させる。

## 環境

- Ubuntu 18.04
- VIM version 8.0.1453

下記プラグインを使っている状態

- emmet.vim
- surround.vim

## コメントの自動補完を無効化する

通常、このようなコメントの自動補完を無効化させるには、下記コマンドを実行して無効化させる。

    set formatoptions-=ro

vimが起動すると同時に、このコマンドを実行させるには、`~/.vimrc`に

    autocmd FileType * setlocal formatoptions-=ro

と書けば良い。だが、これでもうまく発動してくれない。どうやらプラグインがvimrcの後に読み込まれ、設定が上書きされている模様。

そこで、プラグインを読み込んだ後に上記設定を実行してもらう。下記コマンドを実行する。

    mkdir -p ~/.vim/after/plugin/
    echo "autocmd FileType * setlocal formatoptions-=ro" >> ~/.vim/after/plugin/kill-auto-commentout.vim

これでOK。

後はこれでJavaScriptやCSS、シェルスクリプトなどを開き、コメント自動補完の無効化を確認する。

## 結論

もっと早く知るべきだった。

