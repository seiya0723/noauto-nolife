---
title: "【React】Contextとカスタムフックでログイン・ログアウト、認証状態を扱う"
date: 2025-01-12T13:13:05+09:00
lastmod: 2025-01-12T13:13:05+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","tips" ]
---

Reactで全てのコンポーネントでStateや関数を扱いたい場合がある。

propsを使う場合はバケツリレーになってしまい、見通しが悪くなる。

そこで、Contextを使い、全コンポーネントでStateや関数を使えるようにする。

[【React】グローバルなStateを使って、Propsバケツリレー問題を解決する](/post/react-global-state/)

更に、カスタムフックを使えば呼び出しやすくなる。

## src/AuthContext.jsx 

まずはcreateContextで、コンテキストをセットするコンポーネントをつくる。

```
import React, { createContext, useState, useContext } from "react";

// Contextを宣言(この時点ではnull)
const AuthContext = createContext(null);


// AuthContextに値を入れる関数。
// この関数を実行することで、authState login logout がContextとして全コンポーネントから参照できる。
// 実行をするのは、親コンポーネント。
export const AuthProvider = ({ children }) => {

    const [authState, setAuthState] = useState({
        token: null,
        user: null,
    });

    const login = (token, user) => {
        // TODO: ここでログイン処理をする。

        setAuthState({ token, user });
        localStorage.setItem("token", token);
    };

    const logout = () => {
        // TODO: ここでログアウト処理をする。

        setAuthState({ token: null, user: null });
        localStorage.removeItem("token");
    };

    // このAuthContext は 冒頭のcreateContextで作られたオブジェクト .Provider はコンポーネント
    // ログイン・ログアウトの関数、現在の状態をauthState で全てのコンポーネントから参照できるようにする。
    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

// Contextを簡単に利用するためのカスタムフック
// useAuthを使ってAuthContextのすべて(login,logout,authState)を参照できるようにする。
// useContextを使えば、AuthContextが参照できる。AuthContextの中身は(login,logout,authState)である。
export const useAuth = () => useContext(AuthContext);
```

### createContextで初期化

まず、createContextを使って、AuthContextを宣言する。


```
const AuthContext = createContext(null);
```

この時点では、AuthContext に入っている値は null 。

次の AuthProvider 関数を動作させ、AuthContextに値(ログインとログアウトの関数、ログイン状態のState)を入れる。


### AuthProvider で ログイン・ログアウトの関数、ログイン状態のStateを AuthContext に入れる。

```
export const AuthProvider = ({ children }) => {

    const [authState, setAuthState] = useState({
        // 略
    });

    const login = (token, user) => {
        // 略
    };

    const logout = () => {
        // 略
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

```


AuthProvider では、 

- ログインをする関数
- ログアウトをする関数
- authState 

この3つを、AuthContextの中に入れている。

これにより、全てのコンポーネントは、AuthContextの中にある上記3つを参照できる。

ただし、現時点ではAuthProvider は定義しているだけであり、実行した時点で上記3つはContextに入る。

AuthProvider の実行は、親コンポーネントで行う。


### AuthContextを簡単に操作できるよう、カスタムフックuseAuthを作る

最後に、ログイン・ログアウトの関数、ログイン状態を簡単に操作できるよう、カスタムフックを用意する。

```
export const useAuth = () => useContext(AuthContext);
```

これで、useAuthを呼び出せば、useContext内のAuthContextが手に入る。


## main.jsx 

親コンポーネントでAuthProvider を呼び出し、子コンポーネントをラップする。

```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

import { AuthProvider } from "./AuthContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

これにより、子コンポーネントであるApp.jsx では、AuthContext内のログイン・ログアウト関数、ログイン状態を参照できる。



## 任意のコンポーネントで呼び出す。

続いて、任意のコンポーネントで、ログイン・ログアウト関数、ログイン状態を呼び出す。

```
import { useAuth } from "./AuthContext";

const SomeComponent = () => {
    const { authState, login, logout } = useAuth();

    const handleLogin = () => {
        login("example-token", { id: 1, name: "John Doe" });
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div>
        {authState.token ? (
            <div>
                <p>Logged in as: {authState.user.name}</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
            ) : (
            <div>
                <p>You are not logged in.</p>
                <button onClick={handleLogin}>Login</button>
            </div>
        )}
        </div>
    );
};
```

AuthContext.jsxを呼び出し、useAuth を使う。

useAuthは、Contextとされているログイン・ログアウト関数、ログイン状態の3つを呼び出せる。


## 結論

このように Context + カスタムフックで 全コンポーネントで簡単に関数や値を参照できるようになる。

認証関係だけでなく

- モーダルの開閉状態
- ダークモード・ライトモードの管理
- 通知機能
- 通販サイトのカート内の情報

などなど。

ちょうど、Djangoの`context_processors`のような役割に当たると思われる。

[【Django】context_processorsを使い、全ページに対して同じコンテキストを提供する【サイドバーのカテゴリ欄、ニュース欄などに有効】](/post/django-context-processors/)

このように全ページで値を表示する場合、Contextは役に立つだろう。

