---
title: "【保存版】追加しておくべきvimrcの設定【検索ハイライト、タブはスペース4つ、拡張子ごとの初期データ】"
date: 2019-10-10T18:21:46+09:00
draft: true
thumbnail: "images/vim.jpg"
categories: [ "others" ]
tags: [ "vim","作業効率化" ]
---



とりあえず、結論から。Ubuntuの場合、`usr/share/vim/vimrc`の末尾に下記を追加する。

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
    
    autocmd BufNewFile *.py 0r $HOME/.vim/template/python3.txt
    autocmd BufNewFile *.html 0r $HOME/.vim/template/html.txt
    autocmd BufNewFile *.css 0r $HOME/.vim/template/css.txt
    autocmd BufNewFile *.js 0r $HOME/.vim/template/javascript.txt
    autocmd BufNewFile *.c 0r $HOME/.vim/template/c.txt
    autocmd BufNewFile *.java 0r $HOME/.vim/template/java.txt
    
    set tabstop=4
    set softtabstop=4
    set shiftwidth=4
    set expandtab
    set autoindent
    set smartindent


特にautocmdは良い。htmlファイルを作る時、タグを1から入力していくと手間なので、ホームディレクトリの配下に`.vim/template/html.txt`を設置する。その中身がこれ。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Hello World test!!</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="onload.js"></script>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <p>Hello World !!</p>
    </body>
    </html>

レスポンシブデザインに必要なviewport指定の他に、Bootstrap、jQueryのURLが指定されているので、開発がスムーズに進む。


