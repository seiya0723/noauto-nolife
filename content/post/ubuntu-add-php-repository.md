---
title: "【Ubuntu】最新版PHPがインストールできるようにリポジトリを追加する"
date: 2023-01-28T14:08:00+09:00
lastmod: 2023-01-28T14:08:00+09:00
draft: false
thumbnail: "images/php.jpg"
categories: [ "インフラ" ]
tags: [ "Ubuntu","PHP","tips" ]
---


このリポジトリを前もってインストールしておかなければ、最新(2023年1月時点)のPHP8.1がインストールできない

```
sudo apt-add-repository ppa:ondrej/php
```


参照元 https://www.itzgeek.com/how-tos/linux/ubuntu-how-tos/how-to-install-php-8-0-on-ubuntu-20-04-ubuntu-18-04.html


## 背景

GitHubからDLしたLaravelプロジェクトを手元で動かすため、


```
composer update
```

を実行したものの、以下のエラーが出た。


```
Loading composer repositories with package information
Info from https://repo.packagist.org: #StandWithUkraine
Updating dependencies
Your requirements could not be resolved to an installable set of packages.

  Problem 1
    - Root composer.json requires simplesoftwareio/simple-qrcode ^4.2 -> satisfiable by simplesoftwareio/simple-qrcode[4.2.0].
    - simplesoftwareio/simple-qrcode 4.2.0 requires ext-gd * -> it is missing from your system. Install or enable PHP's gd extension.
  Problem 2
    - laravel/cashier[v14.6.0, ..., 14.x-dev] require moneyphp/money ^4.0 -> satisfiable by moneyphp/money[v4.0.0-beta1, ..., v4.1.0].
    - moneyphp/money[v4.0.0-beta1, ..., v4.1.0] require ext-bcmath * -> it is missing from your system. Install or enable PHP's bcmath extension.
    - Root composer.json requires laravel/cashier ^14.6 -> satisfiable by laravel/cashier[v14.6.0, v14.7.0, 14.x-dev].

```

どうやら必要なパッケージ( `simplesoftwareio/simple-qrcode` )のインストールに失敗した模様。

[StackOverflow](https://stackoverflow.com/questions/69442658/laravel-error-when-installing-simple-qrcode-library)からphp.iniを編集した上で、

```
composer require simplesoftwareio/simple-qrcode
```

を実行すると良いと言われたが、これでもダメだった。そもそも、php8.1-gdがインストールされていないことに気づいて


```
sudo apt install php8.1-gd
```

を実行するものの、NotFoundと言われる。だが、ネットで調べると[php8.1-gd](https://packages.ubuntu.com/eo/jammy/ppc64el/php8.1-gd)は実在する事がわかる。

ということは、これはaptにPHPのリポジトリが追加されていないことを意味している。(そもそもこの状態でどうやってPHP8.1をインストールしたのやら)

リポジトリが存在しないということなので、[前述のサイト](https://www.itzgeek.com/how-tos/linux/ubuntu-how-tos/how-to-install-php-8-0-on-ubuntu-20-04-ubuntu-18-04.html)に倣って

```
sudo apt-add-repository ppa:ondrej/php
```

を実行。下記コマンドを実行してphp8.1-gdをインストールさせる。

```
sudo apt install -y php8.1-cli php8.1-common php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-sqlite3
```

参照元: https://www.digitalocean.com/community/tutorials/how-to-install-php-8-1-and-set-up-a-local-development-environment-on-ubuntu-22-04

その上で再度、`composer update`を実行すると、今度は正常にインストールされた。

<div class="img-center"><img src="/images/Screenshot from 2023-01-28 14-18-27.png" alt=""></div>



## 結論

```
composer update 
```

を実行して何かしらのエラーが出る場合、必要なPHPが足りていない可能性も視野に入れるべきだと思った。




