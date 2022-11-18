---
title: "Ubuntuにreactをインストールして動作確認する"
date: 2022-11-05T15:43:47+09:00
lastmod: 2022-11-05T15:43:47+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "Ubuntu","react","JavaScript","環境構築","初心者向け" ]
---


Ubuntu20.04にインストールしている

## npmのインストール

    sudo apt install npm

## reactのインストール

    sudo npm -g install create-react-app

バージョンの確認

    create-react-app --version


## プロジェクトを作り、開発用サーバーを起動する

    create-react-app myproject

プロジェクトを作る。

    cd myproject
    npm start

開発用サーバーを起動すると自動的にブラウザが立ち上がる。`127.0.0.1:3000`が表示される。

<div class="img-center"><img src="/images/Screenshot from 2022-11-06 11-49-50.png" alt=""></div>


`src/App.js`を下記のように修正するとHelloWorldが表示される。


```
import React from 'react';

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
```

ちなみに、このHelloWorldが表示されるhtmlは`public/index.html`から来ている。





### 【補足1】Nodeが古いと言われたら？

```
You are running Node 10.19.0.
Create React App requires Node 14 or higher. 
Please update your version of Node.
```

と言われた。

こういう時は、Nodeをアップデートする。

```
sudo npm cache clean -f
sudo npm install -g n
sudo n stable

sudo n latest

sudo apt-get install --reinstall nodejs-legacy

sudo n rm 6.0.0 #ここをバージョンを変えておく
sudo npm uninstall -g n
```

参照元: https://askubuntu.com/questions/426750/how-can-i-update-my-nodejs-to-the-latest-version

<!--
### 【補足2】tarが古いと言われたら？

reactをインストールした時、

```
npm WARN deprecated tar@2.2.2: This version of tar is no longer supported, and will not receive security updates. Please upgrade asap.
```

と表示されることがある。

これは

```
npm install tar
```
と実行すればOK。ちなみに、
```
npm i tar
```
としてもOK

参照元: https://stackoverflow.com/questions/68857411/npm-warn-deprecated-tar2-2-2-this-version-of-tar-is-no-longer-supported-and-w


### 【補足3】脆弱性があると言われたら？

```
6 high severity vulnerabilities
```

などと表示されたら。

```
npm audit fix --force
```

-->


## 結論

これでインストール完了である。

本格的にReactの開発をする前に、モダンなJavaScriptの知識も確認しておきたい。

[Reactに必要なJavaScript構文【ES2015(ES6)のテンプレート文字列、アロー関数、スプレッド構文、letとconstなど、脱jQueryにも有効】](/post/react-essential-javascript/)

## 参照元

- https://qiita.com/rspmharada7645/items/25c496aee87973bcc7a5
- https://tutorialcrawler.com/ubuntu-debian/ubuntu%E3%81%ABreactjs%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95/



