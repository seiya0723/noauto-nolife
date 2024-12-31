---
title: "create-react-app コマンドはもう使えないので、ViteでReactプロジェクトをつくる"
date: 2024-12-30T21:17:29+09:00
lastmod: 2024-12-30T21:17:29+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","tips" ]
---

```
npx create-react-app frontend
```

このコマンドでreactプロジェクトを作ってきたが、もうcreate-react-app はもう使われなくなったようだ。(2023年春時点から)

そこで、Viteを使ってReactプロジェクトをつくる。

## Viteとは？

Viteは、JavaScriptフレームワーク用のビルドツールである。Vite(フランス語で高速の意味)の名の通り、非常に高速。

ESモジュールで必要な部分だけオンデマンドでロードでき、ページのリロードや反映がとても速い。

## Viteを使ったReactプロジェクトの作成

```
npm create vite@latest frontend --template react
```

このコマンドを実行する、選択肢が表示されるので、

```
✔ Select a framework: › React
✔ Select a variant: › JavaScript
```

このように選べば良い。

## サーバーを起動するには？

```
cd frontend
npm install 
npm run dev 
```

`npm run dev` コマンドを実行すると、

```
 ➜  Local:   http://localhost:5173/
```

ここにサーバーが起動する。


## 3000番ポートで動かすには？

vite.config.js を以下のように編集をする。

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
          
    server: {
        port: 3000, // 使用するポート番号を指定
    },
})
```

## React単体で使うのはもう時代遅れ？

どうやら、今のReactの開発はNext.jsなどのフレームワーク上で動作させるのが主流らしい。

create-react-app はReact公式のプロジェクト生成ツールだ。

とはいえ、もうすでに開発が止まっているところから、そのコミュニティの動向が伺える。

## 結論

Vue.jsを勉強しているときも感じたが、このJavaScriptの世界はとても流動性が高い。

昨日勉強したことが実は、数年前から非推奨でしたということがよくある。

だからこそ、なるべく新しい情報に触れるよう、日頃から公式のGitHubやドキュメントを読むようにしよう。

## 参考文献

https://zenn.dev/nekoya/articles/dd0f0e8a2fa35f



