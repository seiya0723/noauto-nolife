---
title: "独自ドメインのサイトにreCAPTCHAを実装させる方法と理屈【ボット対策】"
date: 2021-09-19T18:21:31+09:00
draft: false
thumbnail: "images/security.jpg"
categories: [ "サーバーサイド" ]
tags: [ "セキュリティ","認証" ]
---

CAPTCHAとして特に名高いGoogleのreCAPTCHAを使用する。これで不正なアカウントの大量作成や、Selenium等のスクレイピングツールの使用をある程度制限させることができる。


## reCAPTCHA実装までの流れ

1. カードの登録を済ませたグーグルアカウントを用意
1. 独自ドメインを取得してサイトに設定
1. グーグルアカウントからreCAPTCHAを使用する
1. サイトにreCAPTCHAのscriptタグ、フォーム用のdivタグを設置
1. サーバー側にリクエスト送信時の処理を書く

[GoogleのreCAPTCHA](https://www.google.com/recaptcha/about/)からGet Started with Enterpriseをクリック。クレジットカードの登録を済ませたアカウントが必要。

100万件までは無料で処理できるが、それ以上は課金されてしまう。


## reCAPTCHAでボット対策ができる理屈

1. クライアントがreCAPTCHAの問題を解く
1. reCAPTCHAの問題に正解した場合、Googleからコードが付与される
1. クライアントがリクエストを送信する(コードが含まれている)
1. サーバーはリクエストのボディ内に含まれているコードをGoogleにアクセスして判定
1. Googleからサーバーへレスポンスが届き、サーバーはレスポンスの内容によって条件分岐する

問題に正解するとコードが付与され、サーバーはクライアントから送られたコードをGoogleに問い合わせることで真贋を確かめる。それで処理を分岐させる。


## 結論

reCAPTCHAのやっていることはとてもシンプル。問題を表示させ、正解すればコードを付与。サーバー側はコードをチェックして条件分岐しているだけ。

つまり、問題のパターンをいくらか用意してしまえば、自前でも似たようなボット対策のシステムを作ることはできると思われる。どうしてもreCAPTCHAが使用できない環境にある場合はそれも一考かと。

ただ、reCAPTCHAも万能ではない。ネット上にはお金さえ支払えば、reCAPTCHAの問題回答を人力で行う組織があるらしい。名の知れたCAPTCHAだけに対策はされているようだ。だからこそ、reCAPTCHAに頼りきりではなく、いかにして、ボットによる攻撃からサイトを守るのかを考える必要があると思う。

また、CAPTCHAがあるだけで離脱してしまうユーザーも一定数は存在する。例えば、会員登録画面でCAPTCHAを搭載すると、それだけで新規会員登録者数は減る。商用で運営しているサイトであれば、離脱は死活問題だろう。

- 参照元: https://syncer.jp/how-to-introduction-recaptcha
- 参照元: https://ja.wikipedia.org/wiki/CAPTCHA

