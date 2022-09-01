---
title: "Djangoでデフォルト数値型のid(主キー)からUUID型にする【データ移行】"
date: 2020-12-24T16:42:59+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","PostgreSQL" ]
---


PostgreSQL等のDBサーバーで、1対多等のリレーションを組んだウェブアプリを作る時、Djangoのデフォルトの数値型のidではエラーが出てしまう。つまり、UUIDの使用は不可避。

しかし、既にデータがいくらか存在しているため、DB内のデータを全削除してUUIDにマイグレーションし直すのは不可能。困った。


こういう、数値型の主キーが割り当てられた既存データを保持したまま、UUID型の主キーに書き換える方法をここに記す。同じような事をやらかす場面は多々あるため、戒めのためにも。


## 主キーを数値型からUUID型へ移行する方法の流れ

1. 該当のDBのデータをダンプ(バックアップ)する
1. DBのデータを削除する
1. models.pyを書き直す
1. マイグレーション
1. 正規表現でIDをUUIDに書き換える
1. データをDBにリストアする


## 該当のDBのデータをダンプ(バックアップ)する

モデルを書き換えるため、一旦データを退避させる。

    python3 manage.py dumpdata [バックアップしたいアプリ名] > ./data.json

`settings.py`で`DATABASE`に設定したDBからアプリのデータを抜き取り、`data.json`に全て出力する。

## DBのデータを削除する

DBのデータを削除する。次項で`models.py`のフィールドを書き換えるため、フィールド書き換え前のデータが残存してしまうためだ。

    DELETE FROM [先程バックアップしたアプリのテーブル名]

注意しなければならないのは、テーブルごと削除しないようにすることだ。テーブルごと削除してしまうとマイグレーションファイルの書き換えまで手間が掛かってしまう。そのため、`DROP TABLE`ではなく`DELETE FROM`を実行して、テーブルの全レコードを削除する。

## models.pyを書き直す

UUID化させるアプリの`models.py`に`UUIDField`を記述する。冒頭に`uuid`を`import`させ、`UUIDField`を各モデルクラスに追記すれば良い。

    import uuid


    id      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

これは、このフィールドを主キーとして扱う。デフォルト値はuuid.uuid4であり、編集は不可とする。

ちなみに、UUIDは30京個あって、ようやく1パーセントの確率で衝突する。1つのレコードが1バイトと仮定した場合、30京分のレコードだとおよそ300ペタバイト。普通にウェブアプリを作っていて、UUIDの衝突をお目にかかることは無い。

故にUUID型の主キーはただのオートインクリメントで数値型の主キーと違って、予想がされにくく、衝突の可能性も低いのでセキュリティ的にも非常に強固である。

## マイグレーション

`models.py`を書き換えたらマイグレーション。

    python3 manage.py makemigrations
    python3 manage.py migrate

このマイグレーションによって、数値型の主キーはUUID型となり、新しくデータが挿入されるたび、自動的にUUIDが作られる。

## 正規表現でIDをUUIDに書き換える

予めダンプしておいたデータはまだ数値型の主キーである。この状態でリストアすることはできない。よって、先程ダンプした`data.json`の主キーをUUIDに書き換える。

下記スクリプトを実行し、`data.json`の数値型の主キーをUUIDとする。

    #! /usr/bin/env python3
    # -*- coding: utf-8 -*-
    
    import sys,uuid,os,re
    
    PK_PATTERN  = re.compile(r'"pk": \d*,')
    
    #dumpdataしたjsonファイルを指定する
    with open("./data.json",mode="r") as obj:
    
        #(1)パターンにマッチするpkをリスト型で取得。
        data        = obj.read()
        match_list  = re.findall(PK_PATTERN,data)
        print(match_list)
        pk_uuid_dic = {}
    
        #(2)辞書型変数にpkの数値型とUUID型を関連付ける
        for pk in match_list:
            pk_uuid_dic[pk] = str(uuid.uuid4())
    
        print(pk_uuid_dic)
    
        print("#置換前")
        print(data)
            
        #(3)元データの文字列をuuidのpkに置換
        for k,v in pk_uuid_dic.items():
            pk_data = '"pk": ' + '"' + v + '",'
            data    = re.sub(k,pk_data,data)
    
        print("#置換後")
        print(data)
            
    #(4)jsonファイルを生成。これをloaddataする
    with open("./custom_data.json",mode="w") as obj:
        obj.write(data)
    

出力された`custom_data.json`を見ると、主キーが下記のようなUUID型に切り替わっている。

    "pk": "a2adea9d-44c1-47af-8821-262a4b6a8fde",

## データをDBにリストアする

先程のスクリプトを使用して出力された`custom_data.json`をDBにリストアさせる。

    python3 manage.py loaddata ./[アプリ名]/fixture/custom_data.json

予め`[アプリ名]`のディレクトリの中に`fixture`ディレクトリを作り、その中に`custom_data.json`をコピーする。その上で上記コマンドを実行し。データをリストアさせる。

## どうしてもうまく行かないときの対策

もし、どうしてもデータのリストアがうまく行かない時、誤ってDBのテーブルを削除してしまったか、あるいはdata.jsonの内容に誤りがある可能性がある。その際の対策をまとめる

- マイグレーションファイルを削除、DBのテーブルを削除する
- Seleniumを使用して管理サイトからデータを挿入する

### マイグレーションファイルを削除、DBのテーブルを削除する

本件は誤ってDROP TABLEなどを実行した場合に有効である。マイグレーションファイルに書かれてあるモデルの遷移とDBの内容が合致していないため、うまく行かない。こういうときは、一度DBのテーブルとマイグレーションファイルを全て削除して1からやり直す。

また、本件はカスタムユーザーモデルなどを実装した場合にも有効である。ユーザーモデルが一般アプリのモデルと紐付いている以上、DBを根こそぎ削除してマイグレーションを1からやり直さないといけない。

### Seleniumを使用して管理サイトからデータを挿入する

最終手段である。Seleniumを使用すれば、ブラウザの操作を自動化できる。予めダンプしておいたデータをSeleniumを使用して管理サイトから挿入していく。対象のフィールド数にもよるが、1レコード当たり、5秒から10秒程度の時間がかかる。

手作業でデータを入力していくよりは早いが、この方法はどうしてもデータをリストアしないといけないときの最終手段として考える。

## 結論

この数値型のidをUUID型に書き換える作業は、`models.py`の修正からマイグレーション、DBへSQL実行、ダンプしたデータの書き換えなども考慮しなければならないため、非常に手間がかかる上に失敗する可能性型が高い。

故に、Djangoでウェブアプリを作るときは、最初からUUIDを主キーとする、カスタムユーザーモデルを実装する事が重要であり、このような手間がかからないように開発することが求められる。


## 関連記事

このような手間が発生しないよう、Djangoで大規模なウェブアプリを開発する予定であれば、カスタムユーザーモデルの実装も必須である。下記は`Django-allauth`と連携させ、会員登録時に年齢を記入させるようにしている。

[Django-allauthでカスタムユーザーモデルを実装させる](/post/django-allauth-custom-user-model/)



