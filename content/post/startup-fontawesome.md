---
title: "fontawesomeの実装と利用例のまとめ"
date: 2020-10-29T16:48:13+09:00
draft: false
thumbnail: "images/fontawesome.jpg"
categories: [ "フロントサイド" ]
tags: [ "ウェブデザイン","スタートアップシリーズ","初心者向け" ]
---

fontawesomeを使用することで、簡単なアイコンをページ内に使用することができる。無料の場合は制限があるが、CDNをheadタグ内に書き込めばいいので実装は簡単。


## 実装方法

headタグ内に下記を追加する。

    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">

これだけでOK。

fontawesome CDN などで検索してくると、下記サイトが出てくるので、バージョンをチェックして最新版をコピペする。

https://fontawesome.com/v5.15/how-to-use/customizing-wordpress/snippets/setup-cdn-webfont#load-all-styles


### 追記

2022年9月現在、fontawesome 6.20が最新である、下記から

https://cdnjs.com/libraries/font-awesome


このCSSをコピーしてheadタグに貼り付ける

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==" crossorigin="anonymous" referrerpolicy="no-referrer" />


## 使い方

fontawesomeのアイコン一覧が掲載されているページ( https://fontawesome.com/icons?d=gallery )からアイコンを選ぶ。無料版しか選べないので、サイドバーのFreeを予めクリックして絞り込むと見やすい。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 11-14-07.png" alt="fontawesomeで使えるアイコン一覧。"></div>

この中から試しにamazonを選んでみる。すると、こんな画面が表示される。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 11-15-58.png" alt="Amazonアイコン"></div>

タイトルの下にiタグのコードが書かれてあるので、それをコピーして任意の場所に貼り付ける。

    <i class="fab fa-amazon"></i>

アイコンが表示される。デフォルトのフォントサイズだと小さいので、font-size:2remなどを指定して大きく表示させると良い。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 11-20-20.png" alt="アイコンが表示された。"></div>

## 結論

fontawesomeの用途はウェブアプリのボタンなどに使える。

ゴミ箱のアイコン、チェックボックスのアイコン、星のアイコン、編集のアイコンなど、無料でも基本的な物は揃っているので、開発に役立つ。

文字列表示だけだとパット見でわかりづらいし、日本語が読めない外国人相手にサービスを展開する時にも都合が悪い。ユーザビリティを高める上で、アイコンを使うのはいい選択だと思う。


