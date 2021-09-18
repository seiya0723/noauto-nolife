---
title: "【Django】settings.pyのSECRET_KEYを再発行(リジェネレート)する【alias登録で即生成・即実装からの再起動】"
date: 2021-09-17T11:19:11+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","システム管理","tips","bash","Ubuntu" ]
---

うっかり、`SECRET_KEY`をバージョン管理対象に含ませてしまった。このままではクラウドサーバーにデプロイした`SECRET_KEY`が予測され、CSRFトークン等が機能不全になってしまう。

そんな時に備えておきたい、`SECRET_KEY`の再発行の方法を解説する。

## ソースコード

[Qiita](https://qiita.com/frosty/items/bb5bc1553f452e5bb8ff)より拝借。

    from django.core.management.utils import get_random_secret_key
    
    secret_key = get_random_secret_key()
    text = 'SECRET_KEY = \'{0}\''.format(secret_key)
    print(text)
    
実行すると、

    SECRET_KEY = '07y^y0#_7b74jy)d6z0lu5*r$#azfyt1*1f+g1-3w+l@&hs^2!'

等の文言が出てくる。

## aliasに登録して、どこでも再発行できるようにする。

`~/.bashrc`の`alias`に登録して、いつでもどこでも再発行できるようにする。

    alias regenedjangokey='python3 [パス]/seckey_regene.py'

再読込。以降は`djangoseckey`で再発行ができる。

    source ~/.bashrc 

注意点として、virtualenvを使ってDjangoをインストールし、OSに直にインストールしていない場合、このaliasは通用しない。(djangoが無いと言われる。)

Ubuntuの環境に直にインストールすると解決する。

    sudo pip3 install django 

## 結論

既にデプロイしているDjangoに`SECRET_KEY`を書き換えた後はsettings.pyを再読込させるため、nginxとdjangoサービスを再起動させる必要がある。

    sudo systemctl restart nginx [djangoサービス]

`xsel`コマンドの`xsel --clipboard --input`も組み合わせることで、生成した`SECRET_KEY`をクリップボードに即コピーすることもできる。後は問題の箇所に貼り付けるだけ。

    alias regenedjangokey='python3 [パス]/seckey_regene.py | xsel --clipboard --input'

他にも、sedコマンド等を使うことで、デプロイ運用中のDjangoのsettings.pyに再生成した`SECRET_KEY`を書き込むこともできる。実行した後に`systemctl`を使ってNginxとDjangoのサービスを再起動すれば、丸ごと1つのコマンドで即解決できる。

    [sedコマンドもセットにして、直接settings.pyに書き込みをするコマンド]
    sudo systemctl restart nginx [djangoサービス]

