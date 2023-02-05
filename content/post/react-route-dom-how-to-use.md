---
title: "react-route-domの使い方【Reactでルーティング】"
date: 2023-02-02T17:29:38+09:00
lastmod: 2023-02-02T17:29:38+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","JavaScript","追記予定" ]
---


ページが複数あるサイトをReactで作る場合、react-route-domでルーティングを行うと良いだろう。

```
npm install react-route-dom
```


## 使い方


### コンポーネントを作る

`src/components/`に以下ファイルを配置。


```
Home.jsx
Portfolio.jsx
Profile.jsx  
```

Home.jsx

```
import { Link } from "react-router-dom";

export const Home = () => {
    return (
        <>

        <div>ここはホームです</div>

        <Link to={`/portfolio`}>ポートフォリオ</Link>
        <Link to={`/profile`}>プロフィール</Link>

        </>
    );
}
```


Portfolio.jsx
```
export const Portfolio = () => {
    return (
        <>
        <div>ここはポートフォリオです</div>
        </>
    );
}
```


Profile.jsx  
```
export const Profile = () => {
    return (
        <>
        <div>ここはプロフィール</div>
        </>
    );
}
```

### src/App.jsx から呼び出す


`Home.jsx, Portfolio.jsx, Profile.jsx`を呼び出す。



```
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import { Home } from "./components/Home";
import { Portfolio } from "./components/Portfolio";
import { Profile } from "./components/Profile";

import "./App.css"


export const App = () => {
    return (
        <>
        <a href="/">
            <h1>Myportfolio</h1>
        </a>

        <BrowserRouter>
            <Routes>
                <Route path={`/`}           element={<Home />} />
                <Route path={`/portfolio/`} element={<Portfolio />} />
                <Route path={`/profile/`}   element={<Profile />} />
            </Routes>
        </BrowserRouter>

        <div className="link_area">
            <a className="link" href="/portfolio">ポートフォリオ</a>
            <a className="link" href="/profile">プロフィール</a>
        </div>


        </>

    );
}
```

ここで`react-router-dom`から`BrowserRouter` 及び `Routes`、`Route`をimportする。

## 結論

BrowserRouterとRoutesの違いがよくわからない。BrowserRouterを書かないサイトも見受けられる。こちらは調査した後、追記する予定。

また、現行バージョン(V6)とかつてのバージョン(V5以前)の記法がネット上で混在しているので注意。

参照元

- https://ralacode.com/blog/post/how-to-use-react-router/
- https://qiita.com/ekzemplaro/items/0479908e3ddfbeca38b5

ソースコード : https://github.com/seiya0723/react-router-test
