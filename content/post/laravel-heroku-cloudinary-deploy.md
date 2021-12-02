---
title: "LaravelをCloudinaryを使用したHerokuにデプロイ、画像やファイルをアップロードする"
date: 2021-12-02T06:59:02+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "laravel","Heroku","デプロイ","cloudinary" ]
---

画像やファイルをアップロードするLaravelウェブアプリをオンプレミスではなく、クラウド(とりわけHeroku)にデプロイしたい場合、ストレージ問題を解決する必要がある。普通のLaravelアプリのHerokuデプロイはそれほど難しくはないが、Cloudinaryを使うとなると情報が限られ、難易度も高い。

そこで本記事では限られている情報に少しでも貢献するため、画像やファイルアップロード機能のあるLaravelアプリをHeroku+Cloudinaryの環境にデプロイする方法を記す。

## 環境

- Ubuntu 18.04
- Laravel 7.x

## 流れ

1. composerを使用してcloudderをインストール
1. config/app.phpの書き換え
1. vendor/cloudinary-labs/cloudinary-laravel/config/cloudinary.php を /config/cloudinary.php にコピー
1. .envにてCloudinaryのAPIキー等を入力
1. コントローラ、ビューを書き換え
1. デプロイ

## composerを使用してcloudderをインストール

    composer require cloudinary-labs/cloudinary-laravel

## config/app.phpの書き換え

    'providers' => [

        /* 省略 */

        CloudinaryLabs\CloudinaryLaravel\CloudinaryServiceProvider::class,
    ]
    
    'aliases' => [

        /* 省略 */

        'Cloudinary' => CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class,
    ]

## vendor/cloudinary-labs/cloudinary-laravel/config/cloudinary.php を /config/cloudinary.php にコピー

    php artisan vendor:publish --provider="CloudinaryLabs\CloudinaryLaravel\CloudinaryServiceProvider" --tag="cloudinary-laravel-config"

## .envにてCloudinaryのAPIキー等を入力

    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    CLOUDINARY_CLOUD_NAME=

CloudinaryのダッシュボードにかかれてあるAPIキー等を右辺に書き、.envを保存する。

## コントローラ、ビューを書き換え

最後にコントローラ、ビューをCloudinary仕様に書き換える。

### コントローラ

下記が変更前。

    if ( $request->file("img") !== null ){
        $filename   = $request->file("img")->store("public/topics");
        $topic->img = basename($filename);
        \Log::debug(basename($filename));
        \Log::debug("画像セットOK");
    }
    else{
        $topic->img = ""; 
        \Log::debug("画像はありません");
    }

変更後。

    #コントローラ冒頭にCloudinaryをuseする。
    use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

    /* 省略 */

    if ( $request->file("img") !== null ){
        $uploaded_url       = Cloudinary::upload($request->file('img')->getRealPath())->getSecurePath();
        $topic->img         = $uploaded_url;
        \Log::debug("画像セットOK");
    }
    else{
        $topic->img = ""; 
        \Log::debug("画像はありません");
    }

つまり、Cloudinaryを使用して画像をアップロードした後、返却される`uploaded_url`を記録する。文字通り、アップロードされた画像ファイルのURLなので、そのURLにアクセスすることでアップロードした画像ファイルにアクセスできる。


### ビュー

このように保存した値を直接表示するように書き換える。

    {{--
    <div class="text-center"><img class="img-fluid" src="{{ asset('storage/topics/' . $topic->img) }}" alt="画像"></div>
    --}}

    <div class="text-center"><img class="img-fluid" src="{{  $topic->img }}" alt="画像"></div>


## 実際に動かすとこうなる

後は、[LaravelのHerokuデプロイ記事](/post/laravel-heroku-deploy/)に倣って、HerokuCLIとgitコマンドをインストール、HerokuPostgresとCloudinaryをAdd-onとして追加し、プッシュすれば良い。

実際に動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-12-02 13-13-43.png" alt=""></div>

## 結論

このやり方だと、コントローラとビューを書き換えないといけないので、画像の保存や表示処理が分散している場合、それら全部書き換えないといけないのは面倒。もしもっと良い方法が見つかったら、加筆を行う予定。

ちなみにCloudinary-laravelに関しては下記GitHubから使い方が解説されている。下記の他に使い方などの情報源が無いので、ご注意を。

https://github.com/cloudinary-labs/cloudinary-laravel

また、他にも検索して出てくるCloudderはLaravel 5.x以前の方法なので。7.x系もしくは8.x系以降には通用しないようだ。CloudderのGitHubによるともうしばらく更新されていないようなので、使用しないほうがよい。

