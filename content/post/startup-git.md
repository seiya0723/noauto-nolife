---
title: "【git/GitHub】コマンドと使い方の一覧"
date: 2022-05-08T10:58:15+09:00
draft: false
thumbnail: "images/git.jpg"
categories: [ "others" ]
tags: [ "git","GitHub" ]
---

後に追記予定あり。

必要と思われるものから順に、解説サイトから抜粋して並べている。

## 基本操作編

これができれば、作ったコードをGitHubに公開できる。

### リポジトリを作る

    git init 

### インデックスする(コミットするファイルを記録)

全てのファイルをインデックスする場合はこうする

    git add .

### コミットする

    git commit -m "ここにコミットのメッセージを記録する"

#### 【補足1】ユーザー情報を入力していないため、コミットできない

gitコマンドでコミットするとき、コミットするユーザーの情報を記録しておく必要がある。

    git config --global user.name [ここにユーザー名を書く]
    git config --global user.email [ここにメールアドレスを書く(実在しないドメインも可)]

これでコミットできるようになる。

gitをインストールしてすぐの状態ではコミットできないため、注意。


## コミット編

これができれば、前のコミットに遡ったり、コミットのログの確認ができる。

### コミットのログを見る。

    git log 

これまでのコミットログが記録されている。

    commit XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

などと表示されているのはコミットのハッシュ値

### 特定のコミットまで戻す

    git reset --hard XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

実際にはハッシュ値の途中まで入力すればOK

これで特定のコミットまで戻れる。


## リモートリポジトリ編

GitHubやHerokuなどのリモートリポジトリと連携させ、成果物を送信(プッシュ)する。

### リモートリポジトリを追加する

例えば、GitHubにて作られたリモートリポジトリを追加したい場合、下記のようにする。

    git remote add origin [リモートリポジトリのURL]


### リモートリポジトリに対してプッシュする

例えば、GitHubで作ったリモートリポジトリにmasterブランチをプッシュする場合、下記のようにする。

    git push origin master 


### リモートリポジトリの一覧を表示する。

下記でリモートリポジトリのURLもまとめて表示される。

    git remote -v 


### リモートリポジトリの追加を取り消す

    git remote -v 

により、下記が表示される場合、

    origin	[リモートリポジトリ名] (fetch)
    origin	[リモートリポジトリ名] (push)

下記コマンドで追加を取り消せる。

    git remote rm origin 

もう一度一覧を表示すると、消えている。


### リモートリポジトリの内容を複製する(クローン)

    git clone https://github.com/ユーザ名/REPOSITORY.git

GitHubのページからZipでDLする場合と違って、.gitが作られる。つまり前のコミットに遡ってコードを手に入れることができるというわけだ。


## ブランチ編

ブランチを作ることで、開発版と安定版を分離させ、開発途中でもコミットをすることができるようになる。

まずはmasterブランチとdevelopブランチを使い分けるところから始めると良いだろう。


- 参照元1: https://qiita.com/y-okudera/items/0b57830d2f56d1d51692
- 参照元2: https://qiita.com/sf213471118/items/557c3335fc40aab857c9

### 新しくブランチを作る

既にmasterブランチが存在している状態(`git init`から`git commit -m`までやっている状態)で下記を実行することで、新しいブランチを作ることができる。

    git branch [ブランチ名]

下記のようにdevelopブランチを作ると良いだろう。

    git branch develop


### ブランチの切り替え

先ほどブランチを作ったので、そのブランチへコミットするよう切り替える。

例えばdevelopブランチに切り替えしたい場合はこうする。

    git checkout develop


### ブランチの一覧表示

    git branch 

これで一覧が表示される。

*が付いているものは現在操作中のブランチ。


### 新しく作ったブランチをプッシュする

ローカルで作ったブランチはリモートには存在しない。

そのため、新しく作ったブランチをリモートにプッシュする時、下記のように引数を指定。

    git push --set-upstream origin develop

二回目以降のコミットからのプッシュは下記のようになる。

    git push origin develop

### ブランチをマージする

まず、masterブランチに切り替える

    git checkout master 

続いて、developブランチの内容をmasterに取り込む。

    git merge develop

これで、developの内容がmasterに取り込まれた。


## その他編

### gitの設定を確認する

    git config --global --list

### gitのコミットログをvimに変更する

デフォルトではnanoエディタになっているため、vimを使いたい場合は下記を実行しておく。

    git config --global core.editor 'vim -c "set fenc=utf-8"'

### コミットしたくないファイルがある場合、.gitignoreを使う

例えば、SendgridやStripeなどの外部サービスのAPIなどは、リポジトリにはコミットしたくないだろう。(その状態でGitHubにプッシュすると、APIキーを不正利用されるため)

だから、コミットしたくないファイルは前もって`.gitignore`に追加しておくと良い。

    local_settings.py

この.gitignoreに指定したファイルにAPIなどの情報を格納し、読込する形にする。

    from .local_settings import *


## gitサーバー編

GitHubに公開できないプロジェクトで、gitを使って複数人で開発を進めたい場合、ローカルのサーバーをgitサーバーに仕立てることで対処できる。

本項ではその方法をまとめる

参照元: https://git-scm.com/book/ja/v2/Git%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%AE%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97

### 流れ

- サーバーを用意する(今回はUbuntu20.04 Server)
- サーバーにgitとopenssh-serverのインストール
- サーバーにリポジトリの作成
- クライアントがプッシュする
- サーバーがクローンする
- 別のクライアントがクローンする

### サーバーを用意する(今回はUbuntu20.04 Server)

サーバーを用意する。Ubuntu20.04 Server版のインストールは下記を参照

[サーバー版Ubuntu 20.04のインストールから設定、SSHログインまで【固定IPアドレス、タイムゾーン、bashrcなど】](/post/startup-ubuntu2004-server/)

以降、サーバーのユーザー名はdefault、IPアドレスは192.168.11.100とする。

### サーバーにgitとopenssh-serverのインストール

    sudo apt install git
    sudo apt install openssh-server

SSHはデフォルトでパスワード認証が有効になっている。

公開鍵認証方式を採用したい場合は別途設定を変更する。

### サーバーにリポジトリの作成

ホームディレクトリ配下で実行。

    mkdir ~/project.git
    cd ~/project.git
    git init --bare
    
これでリモートリポジトリが作られた。

### クライアントがプッシュする

クライアントのPCにて、ローカルリポジトリを作ってプッシュする

    echo "HelloWorld" > README.md
    git init 
    git add .
    git commit -m "first commit"

    # default@192.168.11.100:~/project.git を origin とする
    git remote add origin default@192.168.11.100:~/project.git

    #ここでSSHのパスワードの入力をする
    git push origin master 


これでプッシュできる

### サーバーがクローンする

    git clone ~/project.git

    #projectというディレクトリが作られる
    cd project 

    #この中にREADME.mdが作られている
    cat README.md


### 別のクライアントがクローンする
    
    #SSHでクローンを実行(パスワード入力)
    git clone default@192.168.11.100:~/project.git

    #projectというディレクトリが作られる
    cd project 

    #この中にREADME.mdが作られている
    cat README.md

### Q:gitサーバーを使ってデプロイをするには？

フック(hooks)を使用してプッシュされた時にスクリプトを発動させる。

スクリプトに、デプロイ先のディレクトリにコピーするなどの処理を書いておけば、プッシュ同時にデプロイができる。

詳細は下記。

- https://softwarenote.info/p2433/
- https://qiita.com/zaburo/items/8886be1a733aaf581045


## 参照元のまとめ

- https://qiita.com/gold-kou/items/7f6a3b46e2781b0dd4a0
- https://docs.github.com/ja/get-started/using-git/getting-changes-from-a-remote-repository
- https://qiita.com/Yorinton/items/e0e969d961b17a359e19
- https://qiita.com/sf213471118/items/557c3335fc40aab857c9
- https://qiita.com/y-okudera/items/0b57830d2f56d1d51692
- https://git-scm.com/book/ja/v2/Git%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%AE%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97
- https://softwarenote.info/p2433/
