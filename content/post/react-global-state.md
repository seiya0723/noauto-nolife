---
title: "【React】グローバルなStateを使って、Propsバケツリレー問題を解決する"
date: 2022-12-20T15:10:44+09:00
lastmod: 2022-12-20T15:10:44+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","JavaScript","アンチパターン" ]
---

Reactでは、Stateを使ってウェブアプリの状態を管理することができる。コンポーネントに対して引数を与えるにはPropsを使えば良い。

しかし、だからといって親コンポーネントで定義したStateを、Propsで子コンポーネントに引き渡すのは良くない。

このようなコンポーネントの階層が深い場合、無駄なPropsの受け渡しが発生してしまうからだ。

<div class="img-center"><img src="/images/Screenshot from 2022-12-20 15-15-29.png" alt=""></div>

この問題を防ぐために、グローバルなStateを作る。グローバルなStateを作ることで、無駄なPropsがなくなり、コードが綺麗にまとまる。

<div class="img-center"><img src="/images/Screenshot from 2022-12-20 15-18-48.png" alt=""></div>

今回は下記教科書から一部コードを抜粋して、適宜コメント等を追加してまとめる。

[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)


## 【アンチパターン】Propsバケツリレー状態のコード

下記コードは `App.jsx`→`Card.jsx`→`EditButton.jsx` の順番でStateの`isAdmin`をPropsでバケツリレーしている。

### App.jsx


    import { useState } from "react";
    import { Card } from "./components/Card";
    
    export const App = () => {
    
        //管理者フラグ
        const [isAdmin, setIsAdmin] = useState(false);
    
        //切り替え
        const onClickSwitch = () => {
            setIsAdmin(!isAdmin);
        };
    
        return (
            <>
            {/* 管理者フラグの状態を表示(三項演算子) */}
            { isAdmin ? <span>管理者である</span> : <span>管理者ではない</span> }
    
            {/* isAdminの切り替えボタン */}
            <button onClick={ onClickSwitch }> 切り替え </button>
    
            {/* 管理者の編集ボタン */}
            <Card isAdmin={isAdmin} />
            </>
        );
    };
    

まずuseStateで`isAdmin`を作っている。この`isAdmin`を`components/Card.jsx`に引き渡している。

buttonタグをクリックした時、この`isAdmin`の値を反転させている。

### components/Card.jsx

    import { EditButton } from "./EditButton";
    
    const style = {
        width: "300px",
        height: "200px",
        margin: "8px",
        borderRadius: "8px",
        backgroundColor: "#e9dbd0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    };
    
    export const Card = (props) => {
    
        const { isAdmin } = props;
    
        return (
            <div style={style}>
                <p>山田太郎</p>
                <EditButton isAdmin={isAdmin} />
            </div>
        );
    };
    
しかし、`components/Card.jsx`そのものは`isAdmin`を使ってない。Propsを使って`components/EditButton.jsx`へ引き渡しているにすぎない。

### components/EditButton.jsx

    const style = {
        width: "100px",
        padding: "6px",
        borderRadius: "8px"
    };
    
    export const EditButton = (props) => {
        const { isAdmin } = props
    
        return (
            <button style={style} disabled={!isAdmin}>編集</button>
        );
    };

`components/EditButton.jsx` はPropsで`isAdmin`を受け取り、buttonタグに無効化させるdisabled属性を使っている。

### バケツリレーの問題

このように、Card.jsxは`isAdmin`を使っていないにもかかわらず、Propsで受け取りEditButton.jsxに引き渡している。

これでは、isAdminが変化するたびにCard.jsxも再レンダリングされる上、現状ではCard.jsxはisAdminを引き渡さないといけないので、コンポーネントの再利用ができない。

ダメなReactアプリのできあがりである。そこで、グローバルなStateを使ってこの問題を解決する。


## 【最適解】グローバルなStateを使ったコード

Reactのライブラリを使っても実現はできるが、グローバルなStateを扱うには、React本体が持っているContextを使うとよいだろう。

Contextを使う流れは下記。

1. React.createContextを使ってContextを作る
1. ContextのProviderでグローバルなStateを使いたいコンポーネントを囲む
1. グローバルなStateを使いたいコンポーネントでReact.useContextを使う

Contextを作る→使うコンポーネントを指定する→そのコンポーネントでContextを使う と言った感じ。

### 【1】React.createContextを使ってContextを作る

`component/providers/AdminFlagProvider.jsx`を作る。内容は下記。


    import { createContext, useState } from "react";
    
    // Contextを作る(初期状態は空のオブジェクト)。コンポーネントで使用するためexportをする。
    export const AdminFlagContext   = createContext({});
    
    export const AdminFlagProvider  = (props) => {
        const { children }  = props;
    
        //グローバルなStateを作る
        const [isAdmin, setIsAdmin] = useState(false);
    
        // AdminFlagContext.Providerを使ってchildrenを囲む。value属性にはグローバル化したいStateのオブジェクトをセットする。
        return (
            <AdminFlagContext.Provider value={ { isAdmin, setIsAdmin } }>
            { children }
            </AdminFlagContext.Provider>
        );
    };


#### AdminFlagContext

まず、"react"からcreateContextをimportする。その上で、createContextを使ってAdminFlagContextを作ってエクスポート。

#### AdminFlagProvider

AdminFlagProviderはpropsを受け取り、childrenとする。ここでグローバルなStateを作っておく。

AdminFlagContext.Providerを使ってグローバル化したいStateをセットしておく。

### 【2】ContextのProviderでグローバルなStateを使いたいコンポーネントを囲む

index.jsにて。下記のように修正する。

    import React from "react";
    import ReactDOM from "react-dom";
    
    import { App } from "./App";
    import { AdminFlagProvider } from "./components/providers/AdminFlagProvider";
    
    ReactDOM.render( 
        <AdminFlagProvider>
        <App />
        </AdminFlagProvider>
        , document.getElementById("root") );
    

このように、グローバルなStateを使いたいコンポーネントを囲む。

    <AdminFlagProvider>
    <App />
    </AdminFlagProvider>

これにより、AdminFlagProviderでreturnしている、グローバルなStateを使うことができる。


### 【3】グローバルなStateを使いたいコンポーネントでReact.useContextを使う

まず、`components/App.jsx`にて、

    import { Card } from "./components/Card";
    
    //AdminFlagProvider.jsxから AdminFlagContextをimportする。
    import { AdminFlagContext } from "./components/providers/AdminFlagProvider";

    //Contextを操作するので、useContextをimportする。
    import { useContext } from "react";

    export const App = () => {

        // AdminFlagContext を解析。isAdminとsetIsAdminを呼び出す。
        const { isAdmin, setIsAdmin }   = useContext(AdminFlagContext);
    
        //切り替え
        const onClickSwitch = () => {
            setIsAdmin(!isAdmin);
        };
    
        return (
            <>
            {/* 管理者フラグの状態を表示(三項演算子) */}
            { isAdmin ? <span>管理者である</span> : <span>管理者ではない</span> }
    
            {/* isAdminの切り替えボタン */}
            <button onClick={ onClickSwitch }> 切り替え </button>
    
            {/* 管理者の編集ボタン */}
            <Card />
            </>
        );
    };
    
まず、AdminFlagContextをimportする。AdminFlagContextを解析するには、useContextが必要なので、それもimportする。

AdminFlagContextからuseContextを使ってグローバルなState(isAdminとsetIsAdmin)を取り出す。

後は、グローバルなStateを使って関数を作ったり、値を参照して分岐させる等をすると良い。


続いて、`components/EditButton.jsx`。

    //AdminFlagContextをimportする
    import { AdminFlagContext } from "./providers/AdminFlagProvider";

    //AdminFlagContext解析用の useContextをimport 
    import { useContext } from "react";
    
    const style = {
        width: "100px",
        padding: "6px",
        borderRadius: "8px"
    };
    
    export const EditButton = () => {
    
        const { isAdmin } = useContext(AdminFlagContext);
    
        return (
            <button style={style} disabled={!isAdmin}>編集</button>
        );
    };
    

先ほどと同様にAdminFlagContextとuseContextをimportする。

このEditButton関数でuseContextを使ってグローバルなState(isAdmin)を取り出す。

つまり、予め作っておいたContextとuseContextをimportすることで、グローバルなStateを扱うことができるようになるというわけだ。


## 結論

複数のファイルで書き換えが必要になるため少々難易度が高いが、これで、複数のコンポーネントで使用するStateをPropsを使わずに扱うことができる。

このグローバルなStateはどんなページでも必要とする情報に非常に有効だ。

例えばユーザー情報、ページの上部に表示させる通知、通販サイトであればカートの中の商品などでの活用が考えられる。

[モダンJavaScriptの基本から始める　React実践の教科書　（最新ReactHooks対応）](https://www.amazon.co.jp/dp/B09BV2HGN3/?tag=m68371ti-22)

