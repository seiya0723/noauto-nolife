---
title: "Laravel8.xでページネーターのSVGの矢印がおかしいので修正する。"
date: 2021-12-20T15:05:27+09:00
draft: false
thumbnail: "images/Screenshot from 2021-12-20 15-07-34.png"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","tips" ]
---

問題だらけのLaravel8.xでまた問題が出てきた。ページネーションを普通に使うと、このようにSVGが狂っており、巨大化する。

<div class="img-center"><img src="/images/Screenshot from 2021-12-20 15-07-34.png" alt=""></div>

## 修正

`app/Providers/AppServiceProvider.php`にて下記のようにする。

    <?php
    
    namespace App\Providers;
    
    use Illuminate\Support\ServiceProvider;
    
    
    use Illuminate\Pagination\Paginator;
    
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
            Paginator::useBootstrap();
        }
    }
    
これでLaravel7.x以前のBootstrapを使った普通のページネーションUIになる。

参照元:https://stackoverflow.com/questions/64002774/laravel-pagination-is-showing-weird-arrows

