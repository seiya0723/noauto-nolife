---
title: "【React】関数コンポーネント(function App)とクラスコンポーネント(class App extends Component)の違い"
date: 2023-01-23T16:11:15+09:00
lastmod: 2023-01-23T16:11:15+09:00
draft: true
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","tips","初心者向け" ]
---

Reactのサンプルコードを読み漁っていると、このような書き方をよく見かける。

```
function App() {
    return <h1>HelloWorld</h1>;
}
```

```
import { Component } from "react";

class App extends Component {
    render() {
        return <h1>HelloWorld</h1>;
    }
}
```

これは機能的にはいずれも同じ。

関数コンポーネントか、クラスコンポーネントかの違いである。

公式のドキュメントにpropsの扱い方も書かれてある

https://ja.reactjs.org/docs/components-and-props.html#function-and-class-components


## 余談

ちなみに関数はこのようにアロー関数で書くこともあるので、モダンなJavaScriptの書き方を知らないとますますややこしい。
```
const App = () => {
    return <h1>HelloWorld</h1>;
}
```

## 結論

クラスで書かれてあったとしても、内容はほぼ同じ。あえて違いを言うなら、書きやすさと継承ができるかという点であろうか？

クラスから関数へ、関数からクラスへ書き換えることもできる。

市販の教科書だと、やはりこの辺の細かい解説が無いこともあってつまづきやすい。

だからこそ、公式の情報もしっかりフォローしていきたい。

## 参照元

- https://ja.reactjs.org/docs/components-and-props.html#function-and-class-components
- https://ja.reactjs.org/docs/state-and-lifecycle.html
- https://qiita.com/cotomonaga/items/89a4e1a4733cb2cfc248

