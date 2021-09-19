---
title: "シェルスクリプトでウェブサーバーの応答不能・ステータスコードをチェックして記録・通知する【pingとcurl、即メール送信にも有効】"
date: 2021-09-19T08:51:18+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "インフラ" ]
tags: [ "シェルスクリプト","システム管理","ウェブサーバー","ネットワーク","ubuntu" ]
---

サーバーが応答不能になった時、すぐに対処できるよう、通知機能が欲しい。そういうときのシェルスクリプト。

## pingで応答不能をチェックする

    #! /bin/bash
    
    while true ; do
        ping -c 1 192.168.11.99
        rc=$?
        if [[ $rc -eq 0 ]] ; then
            echo "正常です"
        else
            echo "失敗しました"
        fi  
        sleep 1
    done

後は『正常です』『失敗しました』のいずれかに任意の処理を書き込む。


## curlで応答不能をチェックする

curlはHTTPのステータスコードも手に入るので、それも考慮しつつ分岐させる。


    #! /bin/bash

    while true ; do
        code=`curl -LI 192.168.11.1 -o /dev/null -w '%{http_code}\n' -s`
        echo "ステータスコードは" $code
    
        if [[ $code -eq 200 ]] ; then
            echo "200の処理"
        elif [[ $code -eq 503 ]] ; then
            echo "サーバーダウン"
        fi  
    
        sleep 1
    done

if文を追加すれば、サーバーダウンの他に、502のゲートウェイエラー、504のゲートウェイタイムアウト等の判定もできる。サーバー側のエラーステータスコードは500系なので必要な分だけ設定しておく。

400系はクライアントエラーなので、チェックする端末がネットワークから切り離されたときなどに対応できる。


## 結論

後はこのシェルスクリプトをサーバーとは違う、別端末のcrontabなどにブートしたら実行させる。

PythonやRubyなどの言語でも良いが、どんなLinuxサーバーでも動作する上に負担の少ないシェルスクリプトを選んだ。

- 参照元1:https://stackoverflow.com/questions/6118948/bash-loop-ping-successful
- 参照元2:https://superuser.com/questions/272265/getting-curl-to-output-http-status-code


