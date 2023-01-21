---
title: "【React】警告文の『Warning: ReactDOM.render is no longer supported in React 18 』の対処法【createRootを使用する】"
date: 2023-01-21T11:22:01+09:00
lastmod: 2023-01-21T11:22:01+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "React","tips","初心者向け" ]
---


[【React】Helloworldの仕組みの解説](/post/react-helloworld/)にて、


```
import ReactDOM from "react-dom";

const App = () => {
    return <h1>HelloWorld</h1>;
};

ReactDOM.render(<App /> , document.getElementById("root"));
```

などと書いたが、これでは以下のような警告が出てくる。

<div class="img-center"><img src="/images/Screenshot from 2023-01-21 11-40-27.png" alt=""></div>

```
Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot
```

『`ReactDOM.render()`は今後使われなくなるから、createRootを使用しましょう』という意味。

よって、以下のように書き換えると、この警告は対処できる。

```
import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
    return <h1>HelloWorld</h1>;
};



const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

1. createRootを使用してレンダリング先の要素を指定してオブジェクトを作る
1. createRootの.render()メソッドを使ってレンダリングする
1. その際、React.StrictModeを使って潜在的な問題点をあぶり出す



## 結論

『[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)』という書籍を元に進めたところこうなった。

書籍の情報は、ネットで公開されている情報よりもやや古いこともあるので、あまり鵜呑みにしないよう気をつけたいところだ。

もちろん、書籍は『情報がまとまっている』『環境構築からできる』という観点で、ネット情報よりは有利ではある。

『[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)』は、React開発に必要なモダンなJavaScriptの知識も解説されているので、良書であると私は思う。


参照元: https://stackoverflow.com/questions/71668256/deprecation-notice-reactdom-render-is-no-longer-supported-in-react-18
