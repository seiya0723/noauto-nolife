---
title: "【React】閉じタグがないHTML要素は/(スラッシュ)をタグの末尾に書く【inputタグ、imgタグ等】"
date: 2023-01-21T10:39:53+09:00
lastmod: 2023-01-21T10:39:53+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","tips","初心者向け" ]
---


Reactでは、閉じタグがないHTMLを書く時は、以下のようにする。

```
export const App = () => {
    return (
        <>
            <input type="button" value="送信" />
        </>
    );
}
```

このように `/`がないと、エラーになってしまう点に注意。

```
export const App = () => {
    return (
        <>
            <input type="button" value="送信">
        </>
    );
}
```

これはAppを呼び出すときも同様である。`<App>`としてしまうとエラーになる。

```
// React
import ReactDOM from "react-dom";
import { App } from "./App";

ReactDOM.render(<App /> , document.getElementById("root"));
```


## 結論

閉じタグのないHTMLタグは、Reactでは末尾にスラッシュ(`/`)を入れるよう、クセをつけておきましょう。


