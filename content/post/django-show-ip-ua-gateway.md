---
title: "DjangoでサイトにアクセスしたクライアントのIPアドレス、ユーザーエージェント(UA)、プロバイダ名(ゲートウェイ名)を表示する【犯罪・不正行為の抑止とセキュリティ】"
date: 2021-09-13T07:21:22+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","システム管理","セキュリティ","ec2" ]
---

不正行為や犯罪などの抑止力として効果を発揮する、クライアントのUA、IPアドレス及びプロバイダ名の表示。その方法をここに記す。

## グローバルIPアドレスを表示

ビュー側で以下のように取得する。

    ip_list = request.META.get('HTTP_X_FORWARDED_FOR')
    if ip_list:
        ip  = ip_list.split(',')[0]
    else:
        ip  = request.META.get('REMOTE_ADDR')

もし、`ip_list`に記録されたIPアドレスが複数ある場合は、ネットワーク構成などを考慮して添字を指定する。

## ユーザーエージェント(UA)を表示

ビュー側で以下のように取得する。

    user_agent  = request.META.get('HTTP_USER_AGENT')

リクエストの送信元のクライアントが申告したブラウザ、OSが記録されている。


## プロバイダ名(ゲートウェイ名)を表示

プロバイダ名(ゲートウェイ名)はDjangoのリクエストオブジェクトからは参照できない。しかし、グローバルIPアドレスとゲートウェイ名は紐付いているため、DNSリバースルックアップ(ドメインの逆引き)を実行することで特定することができる。

`dnspython`というライブラリを使用する等の方法がある。

参照元: https://stackoverflow.com/questions/19867548/python-reverse-dns-lookup-in-a-shared-hosting


## その他の情報を表示

テンプレート上で `{{ request.META }}` を記述すると、色々と情報が出てくる。ただ、中にはサーバーの構成などに関わる情報も出てくるので、あくまでも開発段階で使う。

## 【注意】UAはあくまでも自己申告、IPはプロキシサーバーを経由されると無意味

ここで注意しておきたいのが、UAはあくまでも自己申告である点、IPはプロキシサーバーを経由されると効果が無い点。

UAはアドオンのUser-Agent Switcher and Managerなどを使うと、誰でも簡単に自分が使っているOSやブラウザを偽ってサーバー側へ申告できる。PythonのライブラリであるrequestsやSeleniumの他に、curlやwgetコマンドでも自由に任意のUAを指定できるので、UAはあくまでも自己申告制であり、不正行為の抑止力にはやや力不足である点に留意しておく。

ただ、UAはユーザーモデルにフィールドとして記録しておくことで、いつもとは違うブラウザ・OSからのログインを検知したと、アカウントの保有者のメールアドレスに通知することである程度のセキュリティ対策になる。

そして、IPアドレスはプロキシサーバーを経由されると効果は無い。特にTorを使ったアクセスは予め禁止しておく等の対策が必要。

## 結論

このIPアドレスを表示させる方法はEC2にデプロイした場合でも有効である。

犯罪や不正行為の抑止として、表示させるだけでなく、モデルにIPアドレスやプロバイダ名を保存するフィールドを用意して、コメント投稿と同時に記録すれば、どこの誰が投稿したのかよくわかる。

ただ、プロバイダから割り当てられたIPアドレスは常に変化するため、日時フィールドもセットで入れておくと、尚効果的であろう。

参照元: https://docs.djangoproject.com/en/3.2/ref/request-response/

