---
title: "【React】Helloworldの仕組みの解説"
date: 2022-12-04T10:19:51+09:00
lastmod: 2022-12-04T10:19:51+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "React","JavaScript","追記予定" ]
---

勉強途中で書いているものなので、やや間違いがあるかも

## Reactの内部構造

<div class="img-center"><img src="/images/Screenshot from 2022-12-04 10-29-07.png" alt=""></div>

srcに書かれたJavaScriptを発動させ、指定した内容を、publicにあるindex.htmlへレンダリングする。

## プロジェクトを作ってHelloWorldまで


### プロジェクトを作る。

    create-react-app myproject
    cd myproject

以下コマンドで、プロジェクトを起動させる。

    npm start


### index.jsを作る

srcディレクトリ内のファイルを全て削除して、新しくindex.jsを作る。内容は下記

```
import ReactDOM from "react-dom";

ReactDOM.render(<h1>HelloWorld</h1>, document.getElementById("root"));
```

1行目のReactDOMは`react-dom`というライブラリからimportしている。このReactDOMの`.render()`を使うことで、指定した内容を指定した要素へレンダリングできる。

第一引数には書いたh1タグのHelloWorldを、第二引数には`index.html`の`id="root"`へレンダリングしている。


<div class="img-center"><img src="/images/Screenshot from 2022-12-04 10-48-51.png" alt=""></div>

しかし、このように決められた内容をただレンダリングするだけではReactを使う意味はない。普通のHTMLで十分だ。

処理をした上でレンダリング内容を決める。そこでアロー関数が登場する。

```
import ReactDOM from "react-dom";

const App = () => {
    return (
        <h1>HelloWorld !!</h1>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

まずAppという名前の関数を作る。returnとしてHTMLを返している。

このAppを`ReactDOM.render()`から呼び出す。`<App />`とする。`<App/>`でも良い。

するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-12-04 10-48-43.png" alt=""></div>

ちなみに、このAppがTestであれば、このようなコードになる。

```
import ReactDOM from "react-dom";

const Test = () => {
    return (
        <h1>HelloWorld !!</h1>
    );
};

ReactDOM.render(<Test />, document.getElementById("root"));
```

そして、関数がreturnするHTMLは1つのタグでないとエラーが起こる。つまり、下記はエラーになる。

```
import ReactDOM from "react-dom";

const App = () => {
    return (
        <h1>HelloWorld !!</h1>
        <h1>HelloWorld !!</h1>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

しかし、このようにHTMLを入れ子にしていれば大丈夫。

```
import ReactDOM from "react-dom";

const App = () => {
    return (
        <div>
            <h1>HelloWorld !!</h1>
            <h1>HelloWorld !!</h1>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

実践では余計なdivが入らないように、空のタグで入れ子にする方法もある。

```
import ReactDOM from "react-dom";

const App = () => {
    return (
        <>
            <h1>HelloWorld !!</h1>
            <h1>HelloWorld !!</h1>
        </>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
```


## 結論

HelloWorldは下記書籍にも書かれてある。

[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)

