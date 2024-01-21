---
title: "Reactビギナーが15分で掲示板アプリを作る方法"
date: 2023-01-23T10:32:23+09:00
lastmod: 2023-01-23T10:32:23+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","スタートアップシリーズ","初心者向け" ]
---


『[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)』みたいな教科書をなぞってみたけど、よくわからない、実践的な物を作りたいという方向け。

対象読者はReactをインストール済み、モダンなJavaScript構文を理解できる方向けとする。

## 流れ

以下、流れ

1. プロジェクトを作る(1分)
1. srcディレクトリ内のファイルを全て削除、index.jsとApp.jsxの2つだけにする(3分)
1. index.jsはApp.jsxを読み込んでレンダリング(4分)
1. App.jsxはStateを使ってデータ管理とレンダリング(4分)
1. public/index.htmlを書き換える(2分)
1. reactサーバーを起動する(1分)

フックはuseStateのみ使用する。コンポーネントもあまり複雑にさせず、シンプルに仕立てた。

## プロジェクトを作る(1分)

```
create-react-app startup_bbs

cd startup_bbs
```

プロジェクトを作って、そのプロジェクトに移動する。

## srcディレクトリ内のファイルを全て削除、index.jsとApp.jsxの2つだけにする(4分)

srcディレクトリの中身は使わないファイルが多いので、全て削除する。

index.jsとApp.jsxの2つとする。コンポーネントのファイルは拡張子を.jsxとしたほうが見分けが付きやすくて良い。

参照元: [【React】component(コンポーネント)の仕組み](/post/react-component/)

## index.jsはApp.jsxを読み込んでレンダリング(5分)

index.jsの内容を下記とする。


    import React from "react";
    import ReactDOM from "react-dom/client";
    
    import { App } from "./App";
    
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(  
        <React.StrictMode>    
            <App />  
        </React.StrictMode>
    );


React.StrictModeを使うことで、潜在的な問題点(非推奨・レガシーなコード等)を警告してくれる
  

### 【補足1】ReactDOM.renderはアンチパターン

古い情報では、index.jsは以下のような書き方をしている。

    import ReactDOM from "react-dom";
    import { App } from "./App";
    
    ReactDOM.render(<App /> , document.getElementById("root"));


しかし、`ReactDOM.render`は今後使われなくなるので、冒頭の`ReactDOM.createRoot`を使用したほうが良い。

参照元: [【React】警告文の『Warning: ReactDOM.render is no longer supported in React 18 』の対処法【createRootを使用する】](/post/react-dom-render-is-no-longer-supported/)


## App.jsxはStateを使ってデータ管理とレンダリング(4分)

App.jsxの内容を下記とする。

    import { useState } from "react";
    
    export const App = () => {
    
        const [ topics, setTopics ]    = useState([]);
    
        //投稿処理
        const SendButton = () => {
            //テキストエリアの内容を抜き取り、追加する。
            const textarea  = document.getElementById("textarea");
            setTopics([ ...topics, textarea.value ]);
    
            //テキストエリアを初期化
            textarea.value  = "";
        }
    
        return (
            <>
    
            <textarea id="textarea" className="form-control"></textarea>
            <input onClick={ SendButton } type="button" value="送信" />
    
            {/* ここでレンダリングをする。 */}
            {/* リストをレンダリングする時、keyが必要 */}
    
            {
                topics.map( (topic,i) => {
                    return ( <div className="border" key={i}>{ topic }</div> );
                })
            }
    
            </>
        );
    }
    

ここで、[State](/post/react-concept-summary/)を使用している。

本記事はあくまでも基本的なことを復習するためなので、あえてコンポーネントを複雑にしないようにした。

inputタグのような、閉じタグのないHTMLタグは、末尾に`/`を入れる。そうしないとエラーが起こるので注意する。

参照元: [【React】閉じタグがないHTML要素は/(スラッシュ)をタグの末尾に書く【inputタグ、imgタグ等】](/post/react-html-close-tag/)


テキストエリアのボタンがクリックされた時、`SendButton`を実行している。内容はテキストエリアの内容を抜き取り、topicsに追加している。

Stateなので、topicsの変化と同時に、レンダリングが発動する。レンダリング時には、key属性を付与することで、レンダリングのパフォーマンスを低下させないようにしている。

参照元: [【React】リストをレンダリングする時は、key属性を付与する【Warning: Each child in a list should have a unique 'key' prop.】](/post/react-list-rendering-unique-key-prop/)


## public/index.htmlを書き換える(2分)

CDN版のBootstrapを読み込み、HTMLを整形する。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>簡易掲示板</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
</head>
<body>

    <main class="container">
        <div id="root"></div>
    </main>
</body>
</html>
```


## reactサーバーを起動する(1分)

```
npm start 
```

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-01-23 11-04-14.png" alt="Reactで簡易掲示板が動いている"></div>


## 結論

このReactの簡易掲示板にはサーバーサイドは無い、ブラウザのCookieにも保存していない。

そのため、更新ボタンを押すと投稿した内容は消えてしまう。

だからこそ、サーバーサイドとの連携を行い、投稿したデータはDBに保存するように仕立てる必要がある。


## ソースコード

https://github.com/seiya0723/startup-react

## この先のロードマップ






### サーバーサイドDjangoとの連携

#### Djangoで同様の簡易掲示板を作るには？

Djangoで同様の物を作るには、下記を参照。

[Djangoビギナーが40分で掲示板アプリを作る方法](/post/startup-django/)

#### DjangoとReactを連携してSPAを作るには？

下記記事が良いだろう。

[DjangoとReactを組み合わせる方法論と問題の考察](https://noauto-nolife.com/post/django-react-methodology/)





