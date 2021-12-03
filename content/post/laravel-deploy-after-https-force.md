---
title: "【Laravel】Herokuにデプロイした後、URLをhttpsにする【デフォルトではhttpから始まるため、クライアントのブラウザが静的ファイルの読み込みに失敗する問題の対策】"
date: 2021-12-03T16:36:45+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","Heroku","デプロイ" ]
---

[HerokuにLaravelをデプロイした後](/post/laravel-heroku-deploy/)の話。デフォルトではHTTPSではなく、HTTP通信であるため、静的ファイルのアクセスは暗号化されない。

それが原因で、クライアントのブラウザのセキュリティが発動して、静的ファイルの読み込みを拒否する。結果、CSSやJavaScript、画像などの読み込みに失敗し、サイトレイアウトが乱れる。

ビューでassetやroute等を使用している場合、それら全てがhttpsではなくhttpから始まってしまう。本記事ではこの問題の解決策を記す。


## 対処

`app/Providers/AppServiceProvider.php`の編集。

    <?php
    
    namespace App\Providers;
    
    use Illuminate\Support\ServiceProvider;
    
    
    #↓を追加
    use Illuminate\Support\Facades\URL;
    
    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Register any application services.
         *
         * @return void
         */
        public function register()
        {
            //
        }
    
        /**
         * Bootstrap any application services.
         *
         * @return void
         */
        public function boot()
        {
            #↓を追加
            if(env('FORCE_HTTPS',false)) {
                URL::forceScheme('https');
            }
            #↑を追加
        }
    }

Herokuにデプロイした後、環境変数を書き換える。下記コマンドを実行

    heroku config:set FORCE_HTTPS=true

つまり、環境変数(.env)に書かれた内容を元に、URLをhttpsから始めるかを指定する。


## 結論

Stackoverflowからの受け売り。.envの読み込み方法が分かれば、理解に苦しむことは無いだろう。とても単純。

https://stackoverflow.com/questions/44409807/laravel-https-routes


