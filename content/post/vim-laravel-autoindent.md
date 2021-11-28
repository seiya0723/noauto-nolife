---
title: "VimでLaravelのビューを書いているとき、オートインデントが発動しない問題を対処する【.vimrc】"
date: 2021-11-28T08:06:40+09:00
draft: false
thumbnail: "images/vim.jpg"
categories: [ "サーバーサイド" ]
tags: [ "vim","Laravel" ]
---

VimでLaravelのビューを書いている時、オートインデントが発動してくれない。

毎度毎度Tabキーを押してインデントをするのは時間の無駄なので、ここは.vimrcに設定を施したい。

そんな時に見つかったのが下記StackOverflow。

https://stackoverflow.com/questions/32637518/vim-auto-indentation-not-working

`.vimrc`に下記2行を追加するだけで良いらしい。

    autocmd BufNewFile,BufRead *.blade.php set syntax=html
    autocmd BufNewFile,BufRead *.blade.php set filetype=html

確かにこれだけでオートインデントが発動してくれた。これでvimを使用したLaravelの開発も捗るだろう。

