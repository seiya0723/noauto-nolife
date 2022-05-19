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

## 参照元

- https://qiita.com/gold-kou/items/7f6a3b46e2781b0dd4a0
- https://docs.github.com/ja/get-started/using-git/getting-changes-from-a-remote-repository
- https://qiita.com/Yorinton/items/e0e969d961b17a359e19


