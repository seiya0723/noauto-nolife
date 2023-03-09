---
title: "【Vimでスニペット】snipmateプラグインをインストールして使ってみる【爆速コーディング】"
date: 2023-03-09T13:33:55+09:00
lastmod: 2023-03-09T13:33:55+09:00
draft: false
thumbnail: "images/vim.jpg"
categories: [ "others" ]
tags: [ "vim","作業効率化","tips","ubuntu" ]
---

vim-snipmateはVimのスニペットプラグイン。スニペットとは、コードの断片のこと。このプラグインは、スニペットを即時呼び出して貼り付けできる。

同じようなコードを何度も何度も書くのは大変。だからスニペットプラグインを使用して爆速コーディングを実現させる。

環境はUbuntu22.04より

## インストール方法

snipmateはtlibとvim-addon-mw-utilsに依存しているので、まとめてクローンしておく。ホームディレクトリの`.vim`ディレクトリで実行する。

    cd ~/.vim/
    git clone https://github.com/tomtom/tlib_vim.git
    git clone https://github.com/MarcWeber/vim-addon-mw-utils.git
    git clone https://github.com/garbas/vim-snipmate


.vimrcにて、下記を追加しておく

    let g:snipMate = { 'snippet_version' : 1 } 

これで準備完了。


## Django(Python)のスニペットを登録してみる

スニペットの登録用ファイルを作る

    vi ~/.vim/after/snippets/python.snippets

内容を下記とする。


```
snippet django-view-class
    class IndexView(View):
        def get(self, request, *args, **kwargs):
            return render(request, "bbs/index.html")
    
    index   = IndexView.as_view()
```

この状態で、.pyファイルを作って

    django-view-class<tab>

と入力すると、先程指定したスニペットが出てくる。

これで同じ内容を何度もコピペして持ってくる必要が無くなる。


## 【補足1】スニペットの例

下記サイトにて各言語ごとのスニペットの例が掲載されている。

https://github.com/honza/vim-snippets/tree/master/snippets


## 【補足2】grepで登録されているsnippetsの一覧を出力する。

    grep -h "snippet" ~/.vim/after/snippets/*

Pythonファイルだけなら

    grep -h "snippet" ~/.vim/after/snippets/python*

snippetの表示が邪魔ならawkコマンドで切り取る。

    grep -h "snippet" ~/.vim/after/snippets/python* | awk '{print $2}'


長くてコマンド入力が面倒なら、これをbashのaliasにでも登録しておくと良いだろう。

    alias python_snip="grep -h 'snippet' ~/.vim/after/snippets/python* | awk '{print $2}'"



## 結論

NeoBundleはなくてもプラグインのインストールはできる。



## 参照元

https://zenn.dev/shougo/articles/snippet-plugins-2020
https://yhara.jp/2021/05/31/vim-snipmate


