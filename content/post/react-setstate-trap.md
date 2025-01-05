---
title: "setStateする時、直接値を書き換えてはいけない"
date: 2025-01-05T20:47:54+09:00
lastmod: 2025-01-05T20:47:54+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","tips","アンチパターン" ]
---


setStateをする時、こんな風に直接値を書き換えていないだろうか？

```
const handleToggle = () => {
    setToggle(!toggle);
}
```

state変数がプリミティブ型の場合、このsetToggleにより、再レンダリングは発生する。

しかし、オブジェクト型の場合、Stateが値の変更を検知できず、再レンダリングは発生しない。

```
const handleProfile = (e) => {
    profile[e.target.name] = e.target.value;
    setProfile(profile); // この方法では再レンダリングは発生しない。
}
```

オブジェクト型の場合、このようにsetState関数内で処理をする。

これを関数型のアップデートという

```
const handleProfile = (e) => {
    setProfile( (prevProfile) => {
        const updateProfile = { ...prevProfile };

        updateProfile[e.target.name] = e.target.value;
        setProfile(updateProfile);
    });
}
```

まず、setState関数内で、引数としてState変数を使う。

スプレッド構文を使ってオブジェクトのコピーを作り、属性値を変更。setStateを使う。

## プリミティブ型も関数型のアップデートを使う


先のプリミティブ型も、可能であればこのように、setState関数内で値の変更をする。

```
const handleToggle = () => {
    setToggle( (prevToggle) => !prevToggle );
}
```

先の直接値を書き換える方法を使う場合、値が最新ではない可能性がある。(useStateの更新は非同期で動作しているため。)

```
const handleToggle = () => {
    // このtoggleは最新ではないtoggleの可能性。
    setToggle(!toggle);
}
```

そのため、動作の再現性を確保するためにも、関数型のアップデートを使う。




