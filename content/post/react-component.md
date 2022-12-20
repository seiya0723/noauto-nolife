---
title: "【React】component(コンポーネント)の仕組み"
date: 2022-12-14T16:37:06+09:00
lastmod: 2022-12-14T16:37:06+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "React","JavaScript" ]
---

Reactではindex.jsを読み込むことで動作するが、全てをindex.jsに書いてしまうとindex.jsのコード行数が尋常ではなくなる。

故に、コンポーネントを使用してコードの一部を別ファイル化させる。

## コンポーネントの構造

まずsrc内に以下がある。

<div class="img-center"><img src="/images/Screenshot from 2022-12-14 16-47-14.png" alt=""></div>

App.jsxとindex.jsである。

App.jsxはコンポーネントのファイルである。見分けが付きやすいように拡張子を.jsxとしている。index.jsがApp.jsxを読み込む。


## コンポーネントの内容とimport


まず、App.jsx。これがコンポーネント。importされる側。

    export const App = () => {
        return <h1>HelloWorld</h1>;
    }
    

続いて、index.js。importする側

    // React
    import ReactDOM from "react-dom";
    import { App } from "./App";
    
    ReactDOM.render(<App /> , document.getElementById("root"));
    
    
importする時、拡張子は要らない。import対象の関数を`{}`で囲む。


## 結論

これでReactでコンポーネントを使い、機能ごとにファイルを分けることができる。

ちなみに、コンポーネントのパスが`src/components/App.jsx`の場合、importはこうなる。

    import { App } from "./components/App";


