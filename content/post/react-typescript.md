---
title: "【React】Typescript仕様のReactアプリを作る"
date: 2022-12-22T14:27:29+09:00
lastmod: 2022-12-22T14:27:29+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","React","TypeScript" ]
---


## TypeScriptとは

TypeScriptを使うことで、変数を宣言する際に型を定義する事ができる。

例えば、予め文字列型で定義した変数に対しては、文字列型以外を入れると、エラーが起こる。


```
let message: string = "こんにちは";
console.log(message);

message = "おはよう";
console.log(message);

//ここでエラーが起こる。
message = 0;
console.log(message);
```

配列内の変数を取り決めたい場合、`<>`の中に型名を入れるジェネリクス(Generics)を使う。


```
const numbers: Array<number> = [0,1,2];

numbers.push(10);

//ここでエラーが起こる。
numbers.push("10");
```

ちなみに、この書き方でもOK。

```
const numbers: number[] = [0,1,2];
```


## TypeScriptのプロジェクトを作るには？

このコマンドを打つ。

```
npx create-react-app [プロジェクト名] --template typescript 
```

`App.jsx`ではなく`App.tsx`を操作する。


## Vimのシンタックスカラーコード

.tsxファイルをJavaScriptのシンタックスカラーで表示させる。`/usr/share/vim/vimrc`に下記を追加しておく。

```
autocmd BufNewFile,BufRead *.tsx set syntax=javascript
```


