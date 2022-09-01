---
title: "composerでLaravel9.xプロジェクトが作れない問題に対処する【php8.1】"
date: 2022-08-29T17:39:34+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","開発環境","tips" ]
---

ある日、composerコマンドを実行してLaravelプロジェクトを作ろうにも、エラーが出て作れない。

    composer create-project --prefer-dist laravel/laravel testlaraveler1

を実行すると下記が得られる。

    Creating a "laravel/laravel" project at "./testlaraveler1"
    Info from https://repo.packagist.org: #StandWithUkraine
    Installing laravel/laravel (v9.3.5)
      - Downloading laravel/laravel (v9.3.5)
      - Installing laravel/laravel (v9.3.5): Extracting archive
    Created project in /home/akagi/Documents/programming/php/laravel_test03/testlaraveler1
    > @php -r "file_exists('.env') || copy('.env.example', '.env');"
    Loading composer repositories with package information
    Updating dependencies
    Your requirements could not be resolved to an installable set of packages.

      Problem 1
        - spatie/laravel-ignition[1.0.0, ..., 1.4.0] require ext-curl * -> it is missing from your system. Install or enable PHP's curl extension.
        - Root composer.json requires spatie/laravel-ignition ^1.0 -> satisfiable by spatie/laravel-ignition[1.0.0, ..., 1.4.0].
    
    To enable extensions, verify that they are enabled in your .ini files:
        - /etc/php/8.1/cli/php.ini
        - /etc/php/8.1/cli/conf.d/10-opcache.ini
        - /etc/php/8.1/cli/conf.d/10-pdo.ini
        - /etc/php/8.1/cli/conf.d/15-xml.ini
        - /etc/php/8.1/cli/conf.d/20-calendar.ini
        - /etc/php/8.1/cli/conf.d/20-ctype.ini
        - /etc/php/8.1/cli/conf.d/20-dom.ini
        - /etc/php/8.1/cli/conf.d/20-exif.ini
        - /etc/php/8.1/cli/conf.d/20-ffi.ini
        - /etc/php/8.1/cli/conf.d/20-fileinfo.ini
        - /etc/php/8.1/cli/conf.d/20-ftp.ini
        - /etc/php/8.1/cli/conf.d/20-gettext.ini
        - /etc/php/8.1/cli/conf.d/20-iconv.ini
        - /etc/php/8.1/cli/conf.d/20-phar.ini
        - /etc/php/8.1/cli/conf.d/20-posix.ini
        - /etc/php/8.1/cli/conf.d/20-readline.ini
        - /etc/php/8.1/cli/conf.d/20-shmop.ini
        - /etc/php/8.1/cli/conf.d/20-simplexml.ini
        - /etc/php/8.1/cli/conf.d/20-sockets.ini
        - /etc/php/8.1/cli/conf.d/20-sysvmsg.ini
        - /etc/php/8.1/cli/conf.d/20-sysvsem.ini
        - /etc/php/8.1/cli/conf.d/20-sysvshm.ini
        - /etc/php/8.1/cli/conf.d/20-tokenizer.ini
        - /etc/php/8.1/cli/conf.d/20-xmlreader.ini
        - /etc/php/8.1/cli/conf.d/20-xmlwriter.ini
        - /etc/php/8.1/cli/conf.d/20-xsl.ini
    You can also run `php --ini` in a terminal to see which files are used by PHP in CLI mode.
    Alternatively, you can run Composer with `--ignore-platform-req=ext-curl` to temporarily ignore these required extensions.
    
ちなみにPHPは正常にインストールされている。

<div class="img-center"><img src="/images/Screenshot from 2022-08-29 17-44-20.png" alt=""></div>

この状態を解決するには、php8.1-curlをインストールすれば良い。

    sudo apt install php8.1-curl 

おそらく、PHPをバージョン8.1にする時、php8.1-curlのインストールがされていなかったようだ。下記サイトが役に立ったが、インストールするパッケージはphp8.1-curlで。

参照元:https://stackoverflow.com/questions/19335305/composer-install-error-requires-ext-curl-when-its-actually-enabled
