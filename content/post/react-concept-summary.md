---
title: "【React】Props、State(useState)、useEffectなどの概念の解説"
date: 2022-12-17T15:06:37+09:00
lastmod: 2022-12-17T15:06:37+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "React","JavaScript" ]
---


ここではReactの基本的な概念であるProps、Stateについて扱う。

## Props

Propsを使うことで、コンポーネントの関数を呼び出す時、引数を与えることができる。

例えば、`App.jsx`と`components/HeaderContent.jsx`がある。

App.jsxを以下のようにする。

```
import { HeaderContent } from "./components/HeaderContent";

export const App = () => {
    const message       = "Hello!!";

    return (
        <>
        <HeaderContent />
        </>
    );
}
```

HeaderContent.jsxを以下とする。

```
export const HeaderContent = () => {

    const header_color  = { 
        backgroundColor: "deepskyblue",
        color: "white",
        fontSize: "2rem",
        padding: "1rem"
    };

    return <h1 style={ header_color }>HelloWorld</h1>;
};
```

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-12-17 15-19-27.png" alt=""></div>

しかし、このようにするとHeaderContent.jsxは前もって指定しておいた色でしか装飾できない。

そこで、propsの出番である。まず、HeaderContent.jsxを以下のようにする。

```
export const ColoredMessage = (props) => {

    console.log(props)

    const contentStyle = {
        color: "blue",
        fontSize: "20px"
    }

    return <p style={contentStyle}>テスト</p>
};
```

その上で、App.jsxを以下のようにする。

```
import { HeaderContent } from "./components/HeaderContent";

export const App = () => {

    return (
        <>
        <HeaderContent color="white" background="deepskyblue" />
        <HeaderContent color="white" background="crimson" />
        </>
    );
}
```

すると、このように予め指定しておいた色で表示されるようになる。

<div class="img-center"><img src="/images/Screenshot from 2022-12-17 15-59-16.png" alt=""></div>


### 子要素を与える。

`props.children`という特殊な属性がある。これは、コンポーネントの子要素に指定した内容を取り出すことができる。

App.jsxを以下とする。

```
import { HeaderContent } from "./components/HeaderContent";

export const App = () => {

    return (
        <>
        <HeaderContent color="white" background="deepskyblue">Helloworld</HeaderContent>
        <HeaderContent color="white" background="crimson">こんにちは世界</HeaderContent>
        </>
    );
}
```

HeaderContent.jsxはprops.childrenを呼び出す。

```
export const HeaderContent = (props) => {

    const header_color  = { 
        backgroundColor: props.background,
        color: props.color,
        fontSize: "2rem",
        padding: "1rem"
    };  

    return <h1 style={ header_color }>{ props.children }</h1>;

};
```

動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-12-17 16-09-14.png" alt=""></div>


## State

Stateはウェブアプリの状態を管理するための物。

例えば、現在モーダルダイアログが開いているか、テキストボックスに入力された値は正しいか等を管理することができる。


### useState

```
import { HeaderContent } from "./components/HeaderContent";

import { useState } from "react";

export const App = () => {
    const [ num, setNum ]   = useState(0);

    const ClickButton = () => {
        setNum( (num) => { return num + 1 } );
    }

    return (
        <>
        <HeaderContent color="white" background="deepskyblue">Helloworld</HeaderContent>
        <HeaderContent color="white" background="crimson">こんにちは世界</HeaderContent>

        <button onClick={ ClickButton }>{ num }回押した</button>
        </>
    );
}
```

`useState(0)`の0はnumを0で初期化する。

setNumにはnumを更新する関数を書く。

<div class="img-center"><img src="/images/Screenshot from 2022-12-18 09-01-10.png" alt=""></div>

ちなみに、このボタンを押すたびに、●回押したという部分が変わるが、それは再レンダリングされているから。

useStateを使って作られた値が、ボタンをクリックして変化するたびに、関数コンポーネントが再度実行されている。

つまり、App関数内にこのようにconsole.log()を書くと、ボタンが押されるたびに実行されるということだ。

```
import { HeaderContent } from "./components/HeaderContent";
import { useState } from "react";

export const App = () => {
    console.log("render");

    const [ num, setNum ]   = useState(0);

    const ClickButton = () => {
        setNum( (num) => { return num + 1 } );
    }

    return (
        <>
        <HeaderContent color="white" background="deepskyblue">Helloworld</HeaderContent>
        <HeaderContent color="white" background="crimson">こんにちは世界</HeaderContent>

        <button onClick={ ClickButton }>{ num }回押した</button>
        </>
    );
}
```

<div class="img-center"><img src="/images/Screenshot from 2022-12-19 09-07-03.png" alt=""></div>

### useEffect 

前項の通り、Stateの値が変わるたびに、関数が冒頭から実行され、再レンダリングが実行される。

そのため、関数内に重い処理がある場合でも問答無用で実行され、パフォーマンスにも影響してしまう。

だから、特定の値が変わった時だけ、その重い処理を実行するように仕立て、他のStateが変更されても処理が重くならないようにするuseEffectを使う。

```
import { HeaderContent } from "./components/HeaderContent";

import { useState } from "react";
import { useEffect } from "react";

export const App = () => {

    console.log("render");
    const [ num, setNum ]       = useState(0);
    const [ count, setCount ]   = useState(0);

    const ClickCountButton = () => {
        setCount( (count) => { return count + 1 } );
    }
    const ClickButton = () => {
        setNum( (num) => { return num + 1 } );
    }

    useEffect( () => {
        //ここにnumが変わった時にだけ実行したい処理を書く。この部分はnum以外の値が変わったとしても実行はされない。
        console.log("num effect");
    }, [num] );

    return (
        <>
        <HeaderContent color="white" background="deepskyblue">Helloworld</HeaderContent>
        <HeaderContent color="white" background="crimson">こんにちは世界</HeaderContent>

        <button onClick={ ClickButton }>{ num }回押した</button>
        <button onClick={ ClickCountButton }>{ count }回押した</button>
        </>
    );

}
```

つまり、上記の場合、numが変化した時、`console.log("num effect")`を実行する。

```
    useEffect( () => { /* ここに実行したい処理 */  }, [num] //←ここに変更を監視する変数 );
```

これにより、numが変わった時は、`render`と`num effect`が表示されるが、countが変わった時は`render`のみとなる。

Reactにおいてはこの再レンダリングの仕組みを考慮し、重い処理をコンポーネントの中に直接書かないようにするのが鉄則である。



## 結論

Reactの基本的な概念をまとめるとこうなる。

- Propsはコンポーネントに与える引数のような物
- Stateはウェブアプリの状態を管理するためのもの
- Stateの値が変わるたびに再レンダリングされる
- 再レンダリングのたびに処理が実行されるので、useEffectを使って処理を分割する


とりわけ、この再レンダリングによるパフォーマンスの低下は、Reactアプリ開発時の死活問題である。

レンダリングの最適化のため、`memo`や`useCallback`などが活用される。

また`Props`も引数として渡すことができるが、経由するコンポーネントが増えるとバケツリレー方式になってしまう。それを防ぐために、グローバルなStateを作ったりする。グローバルなStateを作れば、わざわざ引数として渡す必要も無くなるからだ。


[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)


