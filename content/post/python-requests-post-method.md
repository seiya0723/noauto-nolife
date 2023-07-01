---
title: "【Python】requestsライブラリを使用して、DjangoにPOSTメソッドのHTTPリクエストを送信する(管理サイトへのログイン)【セッションを維持してCSRF問題の対策】"
date: 2021-11-26T17:03:01+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","Django","tips","スクレイピング" ]
---

Pythonのrequestsライブラリはスクレイピング(GETメソッド)で使用されているが、それだけでなくテストとしてPOSTメソッドでデータを投稿する事ができる。

ただ、ここで問題になるのが、CSRFトークンの存在。CSRFトークンをセットしなければCSRF検証に失敗してしまい、データの投稿ができなくなる。

そこで、セッションを維持した状態でCSRFトークンをリクエストボディにセットし、データを送信する。これでPythonスクリプトからの送信が実現される。

## ソースコード

下記はDjangoの管理サイトにアクセスし、ログインを行うPythonのコードである。

    import requests,bs4
    
    ID      = ""
    PASS    = ""
    
    URL     = "http://127.0.0.1:8000/"
    LOGIN   = URL + "admin/login/?next=/admin/"
    TIMEOUT = 10
    HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0'}
    
    
    #TIPS:Djangoに対してrequestsライブラリからPOST文を送信する方法
    #参照元:https://www.it-swarm-ja.com/ja/python/python-requests%e3%81%a7csrftoken%e3%82%92%e6%b8%a1%e3%81%99/1070253083/
    
    #(1) セッションを維持する(セッションメソッドからオブジェクトを作る)
    client = requests.session()
    client.get(LOGIN,timeout=TIMEOUT,headers=HEADERS)
    
    #(2) CSRFトークンを手に入れ、投稿するデータを辞書型で生成
    if 'csrftoken' in client.cookies:
        csrftoken = client.cookies['csrftoken']
    
    login_data   = { "csrfmiddlewaretoken":csrftoken,
                     "username":ID,
                     "password":PASS
                     }
    
    #(3) ログインする
    r   = client.post(LOGIN,data=login_data,headers={"Referer":LOGIN})
    print(r)


まず、(1)でログインページアクセスのGET文とログイン処理のPOST文のセッションを維持するため、`requests.session()`でオブジェクト(`client`)を作る。

(2)では手に入れたデータから`csrftoken`、即ち、CSRFトークンの文字列を手に入れ、それを元に投稿する辞書型のデータ形式を作る。

そして(3)で維持されたセッションの`client`オブジェクトでpostメソッドを指定し、ログインを行う。

コード上にはIDとパスワードの変数が直接ハードコードされているが、実運用時にはセキュリティ上の問題があるので、別ファイルに書いたほうが良いだろう。



## 管理サイトにログインした後、データを投稿したい場合はどうする？

先のPythonのコードに追記する。

例えば、ユーザーを自動的に作りたい場合は、このようにする。

```

# 前略(前項のコード)


#(4) ログインに使用したセッションでフォームにアクセス。name属性はモデルのフィールド名とほぼ同じ。
POST_URL    = URL + "/admin/auth/user/add/"


#ログインした後、新規作成フォームのページにアクセスする。(CSRFトークンを手に入れるため。)
r = client.get(POST_URL,headers=HEADERS)

#CSRFトークンをセットし直す。
if 'csrftoken' in client.cookies:
    csrftoken = client.cookies['csrftoken']
    print(csrftoken)

post_data   = { 
        "csrfmiddlewaretoken":csrftoken,
        "username":"ここにユーザー名を",
        "password1":"パスワード",
        "password2":"パスワード",
        }

r   = client.post(POST_URL,data=post_data,headers=HEADERS)
print(r)
```

`post_data`の部分の値をCSVからループして取得した値にすることで、まとめて一気にユーザーを作ることができるだろう。



## 結論

テスト以外の用途としては、Herokuのような常駐スクリプトが動作しない環境下で、サーバーに対してデータを格納したい場合などに有効。

動作させる端末を24時間稼働させ、サーバー側へ認証などのセキュリテイ対策を別途用意する手間こそあれ、常駐スクリプトが使えないHerokuでもデータを投稿できるのだ。手元で動かしておけば良いのだから、crontabでもタイムスケジューラーでも何でもOK。制約も何も無いので自由に投稿を繰り返せる。


