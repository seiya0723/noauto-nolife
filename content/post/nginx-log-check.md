---
title: "Nginxのログをチェックする、ログの出力設定を変更する"
date: 2021-09-21T07:19:18+09:00
draft: false
thumbnail: "images/nginx.jpg"
categories: [ "インフラ" ]
tags: [ "nginx","システム管理","ウェブサーバー","セキュリティ","ネットワーク","Ubuntu","Linux" ]
---

事案が発生した時、まっさきに確認するべきがサーバーのログ。とりわけウェブサーバーのNginxのログ確認方法、設定方法をここに記す。

## Nginxのログの見方

Nginxの設定ファイル(`/etc/nginx/nginx.conf`)にログのパスが書かれてある

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

ログは`/var/log/nginx/access.log`に保管されてある事がわかる。中身はこんな感じ。

<div class="img-center"><img src="/images/Screenshot from 2021-09-20 21-33-14.png" alt="ログに表示される内容"></div>

左から順にこうなっている。

    送信元IPアドレス 日付(タイムゾーンつき) メソッド URI プロトコル ステータスコード 送信バイト数 URL ユーザーエージェント

ご覧の通り、POSTメソッドでもリクエストボディは含まれていない。そのため、次項にて出力内容を書き換える。

## Nginxのログ出力を変更する(設定変更)

デフォルトではPOSTリクエストのボディが出力されない。そこでPOSTリクエストのボディも含ませる。

`/etc/nginx/nginx.conf`から設定の変更を施す。

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

これを以下のように書き換える

    ##
    # Logging Settings
    ##

    log_format  request_body '$remote_addr - $remote_user [$time_local] "$request" '
                             '$status $body_bytes_sent "$http_referer" '
                             '"$http_user_agent" "$http_x_forwarded_for" "$request_body"';
    access_log  /var/log/nginx/access.log  request_body;
    #access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

新たにログフォーマットを作り、フォーマット名を`access_log`に指定。

出力するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-21 09-20-01.png" alt="リクエストボディ出力"></div>

unicodeでエンコーディングされてはいるものの、出力されている。

文字コードをUTF-8に切り替えるには、Pythonであればこうする

    data = "ユニコードでエンコードされた文字列"
    bytes(data, "utf-8").decode("unicode_escape")

こんな感じに出力される。`form-data`の中身が見れる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-21 09-23-18.png" alt="UTF-8の表記に"></div>

これにより、SQLインジェクションやパスワードアタックなどを試みている端末のIPアドレスを特定できる。後はそのIPアドレスからのアクセスをシャットアウトするなどの対策ができる。

誹謗中傷問題などのセキュリティ以外の事件が発生したときも、リクエストボディが見えるので、ウェブアプリ側がIPアドレスを記録していなくても、Nginxのログから特定できる。

もっとも、リクエストボディをログに記録すると、かえってログが見づらくなる可能性もあるので必要に応じて設定する。

## リモートホストのNginxのログを自動的にバックアップする

これもscpコマンドとcrontabを使えば簡単。

    * *   1,10,20 * * user  scp -i [公開鍵] [リモートホストユーザー名]@[リモートホストIPアドレス]:/var/log/nginx/*.log ./

実行のスパンが少々雑(1日、10日、20日に実行)だが、これでわざわざSSHでログインしなくてもゆっくりログが見れる。

ちなみにデフォルトではログファイルは二週間前まで圧縮ファイル(.gz)にして保存する仕組みになっている。二週間以上前のログも保存しておきたい場合は、次項で設定を施す。

## ログの保存期間を長期化させる

`/etc/logrotate.d/nginx`からログ保存期間の設定ができる。

中身はこうなっている。

    /var/log/nginx/*.log {
    	daily
    	missingok
    	rotate 14
    	compress
    	delaycompress
    	notifempty
    	create 0640 www-data adm
    	sharedscripts
    	prerotate
    		if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
    			run-parts /etc/logrotate.d/httpd-prerotate; \
    		fi \
    	endscript
    	postrotate
    		invoke-rc.d nginx rotate >/dev/null 2>&1
    	endscript
    }

上から4行目のrotateの値を書き換える。

    /var/log/nginx/*.log {
    	daily
    	missingok
    	rotate 30
    	compress
    	delaycompress
    	notifempty
    	create 0640 www-data adm
    	sharedscripts
    	prerotate
    		if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
    			run-parts /etc/logrotate.d/httpd-prerotate; \
    		fi \
    	endscript
    	postrotate
    		invoke-rc.d nginx rotate >/dev/null 2>&1
    	endscript
    }

これで30日間ログを記録することができる。


## .gzファイルを展開するには？

`gunzip`コマンドを使う。Ubuntuであればデフォルトでインストールされている

    gunzip access.log.*.gz

これで全ての圧縮されたログファイルを展開できる。

## 結論

このようにウェブサーバーのログを確認するだけでウェブアプリ側には無い情報を手に入れることができる。もちろん、アプリ側が別途モデルや処理系を作って記録することもできるがとても手間がかかる。

今回はPOSTメソッドのボディの記録まで行ったが、GET文のクエリストリングはもともとデフォルトで表示されているので、特に追加の設定は必要ない。

そしてログのチェックでもgrepコマンドを多用する。正規表現が使えるので、送信元のIPアドレス、パラメータの値の表記ゆれも含めてまとめてヒットさせる際にとても便利だ。


以下、参照元

- https://qiita.com/hito3/items/0e539e82ee3c410cccf1
- https://qiita.com/nanaco/items/b30e160ab2c0ea026f3d
- https://stackoverflow.com/questions/44180125/keep-the-nginx-logs-of-the-last-30-days

