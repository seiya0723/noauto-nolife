---
title: "Laravelで.env(環境変数)に指定した値をチェックする方法【コントローラ・ビュー】"
date: 2021-12-21T08:06:32+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","初心者向け","tips" ]
---

例えば、コントローラなどで開発段階とデプロイ後で処理を切り分けたい事がある。そういう時は、.env(環境変数)に指定した値を参照してif文で分岐させれば良い。

## コントローラで環境変数に指定した値を確認する。

    if ( env("APP_DEBUG") ){
        \Log::debug("APP_DEBUGはTrueです");
    }
    else{
        \Log::debug("APP_DEBUGはFalseです");
    }

これで解決する。

## ビューで環境変数に指定した値を確認する。

    @if ( env("APP_DEBUG") )
    <div>DEBUG True</div>
    @else
    <div>DEBUG False</div>
    @endif 

これでOK


## 用途

例えば、HerokuのストレージであるCloudinaryは送信先をCloudinaryに指定する必要があるが、これはコントローラやビューまで書き換えないといけない。

参照元:[LaravelをCloudinaryを使用したHerokuにデプロイ、画像やファイルをアップロードする](/post/laravel-heroku-cloudinary-deploy/)

この場合、開発中とデプロイ後の両方を書く必要がある。コントローラをハードコードして処理を分岐させるのはとても面倒なので、環境変数を元に分岐させる構造に仕立てれば開発中でもデプロイ後でも難なく動く。

他にも、環境変数内にはシークレットにするべき変数を記録するため、サービスのAPI等を環境変数内に記録し、コントローラ側から参照するようにする。コントローラにAPIをハードコードしてしまうとAPI流出の危険が高まる。

