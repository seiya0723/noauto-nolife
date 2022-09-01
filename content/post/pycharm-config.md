---
title: "Pycharmを使う前にやっておきたい設定と覚えておくと良い操作方法"
date: 2022-08-10T17:50:56+09:00
draft: false
thumbnail: "images/pycharm.jpg"
categories: [ "others" ]
tags: [ "pycharm","django","python","初心者向け" ]
---

Pycharmはデフォルトではやや使いづらい。そのため、本記事ではなるべく使いやすくする設定と覚えておくとよい操作方法を記す。

## 設定

### 日本語化

https://mergedoc.osdn.jp/ にアクセス。Pleiadesプラグイン・ダウンロードからOSにあった日本語用のzipをDL。

zipを展開した後、WindowsやMacの場合はマウスクリックでインストーラーを起動させれば良い。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 09-24-49.png" alt=""></div>

※日本語の表記ゆれなどを考慮し、以降の設定はインストールしてすぐの英語を基準として設定方法を解説する。

### 文字を大きく表示させる

Pycharmの設定を開く。設定はCtrl+Alt+Sを押すか、もしくはFile→Settingsから開ける

Editor内にあるFontからSizeを指定すれば、文字を大きくさせることができる。個人的には18ぐらいがちょうどいいと思う。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 09-32-17.png" alt=""></div>

### 言語ごとのコーディングスタイルの指定

インデントする時、スペース何個分取るか等の設定。

Pycharmの設定を開く。設定はCtrl+Alt+Sを押すか、もしくはFile→Settingsから開ける。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 09-46-31.png" alt=""></div>

HTMLではデフォルトでインデントのスペースは4になっているので2にしたい場合はここから変更する。

### 電球を消す

コーディングをしているとこのようにお節介な電球が現れる。表記ゆれ等を指摘しているようだが、コーディングスタイルは人それぞれなのであえて指摘はしないでもらいたい。電球がコードに覆いかぶさって表示されるのでさらに見づらい。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 09-51-02.png" alt=""></div>

Pycharmの設定を開く。設定はCtrl+Alt+Sを押すか、もしくはFile→Settingsから開ける。

続いて、Editor→General→Appearanceに行くか、もしくは設定の検索欄からbulbと検索。Show intention bulbが見えるので、それのチェックを外す。これで電球は出なくなる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 09-53-51.png" alt=""></div>

### ファイル新規作成時、デフォルトのコードを表示する

例えばHTMLファイルを新規作成するとき、何も書かれていない状態からスタートする。これではhtmlタグ、headタグ、bodyタグに加えmetaタグやBootstrapの読み込み、jQueryの読み込みなども全部手動でやらないといけない。

これはとても面倒だ。だからファイルを開いた時、予め指定しておいたコードを書いた状態でスタートさせる。

Pycharmの設定を開く。設定はCtrl+Alt+Sを押すか、もしくはFile→Settingsから開ける。

Editor→Code Style→File and Code Templatesを見る。そこには既にデフォルトでコードが用意されている。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 10-14-00.png" alt=""></div>

デフォルトで用意されたテンプレートは削除する事はできない。そこで、それらの内容を書き換える。HTMLであれば下記を丸ごとコピーして、HTML FileとHTML4 Fileにペーストする。

    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>Hello World test!!</title>
    
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" crossorigin="anonymous">
    
    	<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    
        <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/vue-router/2.2.1/vue-router.js"></script>
    
    	<script src="script.js"></script>
    	<link rel="stylesheet" href="style.css">
    </head>
    <body>
    	<p>Hello World !!</p>
    </body>
    </html>

レスポンシブデザインのviewport設定。BootstrapにjQuery、fontawesomeにVue.jsのCDN、同一ディレクトリのscript.jsとstyle.cssを読み込むことを考慮してそれぞれ追加した。

これをHTML FileとHTML4 Fileに書き込む。

このテンプレートを使うには、任意のディレクトリにて、右クリック→HTML Fileを選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 10-28-03.png" alt=""></div>

テンプレートとして指定したいテンプレートファイル(今回はHTML 5 file)と、ファイル名を入力すれば、先ほど指定したテンプレートがそのまま表示される。

<div class="img-center"><img src="/images/Screenshot from 2021-11-05 10-29-15.png" alt=""></div>

### 【Linuxユーザー限定】.bashrcにaliasを登録してターミナルからもすぐに操作できるようにする

`.bashrc`に下記を追加する。

    alias cdpycharm='cd ~/PycharmProjects/'

これで`cdpycharm`コマンドを打つと、端末から即Pycharmのディレクトリに移動できる。後は端末からvimなどで操作すると良い。vimとPycharmの二刀流が実現できる。


### インスペクションの内、警告を全て無効化する。

コーディングしていると、コメントはこんなふうに書けとか、関数名や変数名のスペルが間違っているとか、構文エラーに影響しない警告のお節介が鬱陶しいので全て消す。

<div class="img-center"><img src="/images/Screenshot from 2022-08-10 13-54-54.png" alt=""></div>

設定からエディタ→インスペクションを指定。

<div class="img-center"><img src="/images/Screenshot from 2022-08-10 13-58-45.png" alt=""></div>

ろうとのアイコンをクリックしてWarning、WeakWarning、Typoをチェックして選び、表示される警告のチェックを外す。

Pythonでコメントは#の後に半角スペースをつけるべきといった文言を消したい場合は、『PEP 8』と検索して出てくる項目のチェックを外すと良いだろう。


## 操作方法

近日公開


### ファイル内文字列の検索と置換

よくある検索と置換処理。

Ctrl+Rでフォームが出てくるので、検索したいワードと置換したいワードを入れて実行する。RはReplaceのR。




<!--
ファイル・ディレクトリを作る
ファイル名・ディレクトリ名を変える
ファイル内の検索と置換
ディレクトリをファイルマネージャー(Windowsであればエクスプローラー等)で開く
ターミナルの表示・独立
別のプロジェクトを開く
矩形選択


div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img
div.img-center>img

-->
