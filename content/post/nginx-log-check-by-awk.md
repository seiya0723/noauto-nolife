---
title: "Nginxのログをawkコマンドを使用して調べる【crontabで特定の条件下のログを管理者へ報告】"
date: 2021-09-23T13:51:44+09:00
draft: false
thumbnail: "images/nginx.jpg"
categories: [ "インフラ" ]
tags: [ "Nginx","bash","シェルスクリプト","crontab","システム管理","セキュリティ","awk"]
---

Nginxのログはスペース区切りで送信元IPアドレス、アクセス対象のURLなどが書かれてある。これはスペース区切りで文字を扱うことができる`awk`コマンドと相性が良い。

本記事では、awkコマンドを使用して、特定の条件下のログを報告したり、ログの情報を見やすくさせる方法を記す。


## awkコマンドを使用して、表示する情報を絞る

基本。
    
    cat access.log | awk '{print $1}'

これで送信元IPアドレス(スペース区切りで1番目のデータ)が表示される。

## 【応用1】IPアドレスごとにリクエスト数を計算して表示

`sort`コマンドと`uniq`コマンドを使用する。これはワンライナーで簡単に書ける。

    cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn 

## 【応用2】HTTPレスポンスごとに発生回数を調べる

先ほどと同様。`$9`がHTTPレスポンスなので`sort`して`uniq`する。

    cat access.log | awk '{print $9}' | sort | uniq -c | sort -rn 

## 【応用3】アクセスの多いページ順に表示

これも同様。`$11`を指定するだけ

    cat access.log | awk '{print $11}' | sort | uniq -c | sort -rn 


## 【応用4】管理サイトにアクセスしたIPアドレスの中から管理者のものと不一致であれば報告

シェルスクリプトで書く。awk内のif文はshellscriptの構文とは違う点に注意。

管理者のIPアドレスではないものが、管理サイトのURLにアクセスしたとき、データを配列に格納する。

    #配列を作る
    declare -a doubt=()

    #条件に一致したデータを配列に入れる
    mapfile -t doubt <<< $( awk '{
    if ($1 != "管理者のIPアドレス" && $11 ~ /管理サイトのURL/) 
        print $1" "$11
    }' <<< cat access.log )

    #配列の長さが0以上であれば報告
    if [ ${#doubt[@]} -gt 0 ]; then
        echo "管理者へ通知"
    fi

一旦、配列として受け取り、長さを測る。0よりも多ければ管理者へ通知の処理を書く。問題ありの`$doubt`をセットで送るもよし。
    
`print $1" "$11`で送信元IPアドレスとURLを記録しているので、時間も入れると良いだろう。

## 【応用5】1分以内に一定回数以上のリクエストを送ったIPアドレスを表示

下記シェルスクリプトをcrontabで毎分実行する。

    target=`date -d '1 minute ago' +'%Y:%H:%M'`
    echo $target
    grep $target ./access.log | awk '{print $1}' | sort | uniq -c | sort -rn 
    declare -a requests=()
    mapfile -t requests <<< $( grep $target access.log | awk '{print $1}' | sort | uniq -c | sort -rn | awk '{
    if ($1 >= 100 )
        print $2
    }')
    
    #ここはif文で配列の長さが0以上であればメールで通知する。
    echo ${requests[@]} "は1分間に100回以上のアクセスがある。"

こんなふうになる。

<div class="img-center"><img src="/images/Screenshot from 2021-09-23 18-26-23.png" alt=""></div>

dateとgrepと組み合わせることで、予め(分単位で)現在時刻と同じログを抽出。後はソートして重複除去、awkのif文で回数を超過したものを配列に追加。

配列に含まれているデータを通知する。

分をまたいだアクセスには対応できないが、毎分crontabで実行すればある程度の効果はあると思われる。Nginxのログは1つのファイルに1日以上(24時間以上)のデータが含まれることは無いので、日は気にしなくて良い。

ログを取得する期間を引き伸ばしたいなど、ログの設定を行いたい場合は下記

[Nginxのログをチェックする、ログの出力設定を変更する](/post/nginx-log-check/)


特定IPアドレスの拒否がしたい場合は下記。

[Nginxで特定IPアドレスのリクエストを拒否する](/post/nginx-deny-ip-address/)
