---
title: "【Django】バッチ処理のOpenCVが撮影した画像をDBに保存する"
date: 2021-03-16T16:15:03+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","システム管理","上級者向け","tips","AI","OpenCV","Pythonライブラリ" ]
---

Djangoのバッチ処理を実行し、DBにデータを格納させる。ただし、OpenCVで撮影した画像をDBに保存させる。本記事ではその手順を記す。

## 実行環境・やりたいこと

### 実行環境

- Django 2.2以上
- Ubuntu 18.04

### やりたいこと

流れはだいたいこんな感じ

1. OS起動時、バッチ処理がCrontabから実行される
1. バッチ処理はOpenCVを使用し、撮影した画像を保存
1. 保存した画像とコメントをDBに記録
1. 1秒経ったら、2に戻る

つまり、コマ撮りした画像をDBに次から次へと記録していく。これで監視カメラ風のウェブアプリを作ることができる。

## 問題点

バッチ処理からDBに文字列を突っ込むだけであれば簡単である。対象のモデルをインポートして、モデルオブジェクトから保存させれば良い。

しかし、画像を保存するとなるとワケが違う。普通、Linuxにデプロイした時、通常のリクエストで画像をアップロードすると画像は`/var/www/プロジェクト名/media/`に保存される。バッチ処理のOpenCVが`/var/www/プロジェクト名/media/`に保存すると、アクセス権の問題が出る可能性がある(未検証につき要注意)。つまり、OpenCVで撮影した画像を閲覧することができないのだ。

そこで、通常のリクエストからの送信と同様に、サードパーティ製のrequestsライブラリを使用した上で、画像データをサーバーに保存してもらう。ただし、サーバーにPOST文のリクエストを送る場合、CSRFトークンをセットしなければならない。今回のコードはその手法も解説する。

## バッチ処理のソースコード


下記のPythonスクリプト、observer.pyを`アプリ名/management/commands/`の中に入れる。

    from django.urls import reverse
    
    import time
    
    #撮影するウェブカメラのリスト。UUIDとOpenCVの番号を関連付ける
    CAMERA_LIST = [ { "num":0, "uuid":"uuid" },
                    { "num":1, "uuid":"uuid" },
                    ]
        
    PATH        = settings.BASE_DIR + "/devcam/management/commands/"
    MIME        = "image/jpg"
    EXT         = ".jpg"
    
    LIMIT_RECORD    = 30000
    
    import requests,cv2,time
    
    class Command(BaseCommand):
    
        def handle(self, *args, **kwargs):
    
            #========CSRFトークンを抜き取る===========
    
            #POSTリクエスト送信先のURLを逆引き、送信先のURLを生成する。
            target_app  = reverse("devcam:index")
            if settings.DEBUG:
                host    = "http://127.0.0.1:8000"
            else:
                host    = "http://" + settings.ALLOWED_HOSTS[0]
    
            URL = host + target_app
    
        
            #サイトにアクセスしてCSRFトークンを抜き取る
            client = requests.session()
            client.get(URL)
        
            if 'csrftoken' in client.cookies:
                csrftoken = client.cookies['csrftoken']
                print(csrftoken)
            else:
                print("none")
    
    
            #========カメラごとにオブジェクトを作る=================
    
            obj = {}
            for data in CAMERA_LIST:
                obj[data["uuid"]] = cv2.VideoCapture( data["num"] )
    
                #明示的に1280x720で撮影させる
                obj[data["uuid"]].set(cv2.CAP_PROP_FRAME_WIDTH,1280)
                obj[data["uuid"]].set(cv2.CAP_PROP_FRAME_HEIGHT,720)
    
            while True:
    
        
                #============カメラごとに撮影する========================
                for data in CAMERA_LIST:
    
                    ret, frame  = obj[data["uuid"]].read()
    
                    path        = PATH + data["uuid"] + EXT
                    cv2.imwrite(path, frame) 
    
                    #撮影した画像をバイナリで読み込み、filesに当てる。
                    with open(path,mode="rb") as f:
                        files   = {'img': (path, f.read(), MIME) }
    
                    #CSRFトークンをセットして送信。
                    data = { "csrfmiddlewaretoken":csrftoken,
                             "camera": data["uuid"],
                            }
    
                    #POSTリクエストを送信
                    response    = client.post(URL, data=data, files=files, headers=dict(Referer=URL))
                    time.sleep(0.1) 

これで、下記コマンドを実行すれば、動く。

    python3 manage.py observer


つまり、手順はこうなる。

- リクエスト送信先のページのURLを取得
- URLからCSRFトークンを抜き取り
- カメラごとにOpenCVのインスタンスを作る
- インスタンスごとにカメラで撮影する
- 撮影した画像をバイナリで読み込み
- 2で取得したCSRFトークンと、カメラのUUID、バイナリで読み込んだ画像を指定、POSTリクエスト送信

requestsライブラリで画像を送信するときは、一度バイナリで読み込み、files引数に指定することでファイルをアップロードできる。MIMEの指定も忘れずに。

## 結論

今回はアプリのモデルを読み込んでいるわけじゃないので、別にDjangoのバッチ処理で作らなくても問題はないが、Djangoの中に入れることでバッチ処理の取りこぼしが少なくなり、管理しやすくなるというメリットがある。

後は先程のコマンドを`/etc/crontab`などから実行させればよい。

