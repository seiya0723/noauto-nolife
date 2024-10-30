---
title: "【JavaScript】awaitとasyncの違い【非同期処理のコールバック地獄対処】"
date: 2024-10-22T11:13:45+09:00
lastmod: 2024-10-22T11:13:45+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "JavaScript","tips" ]
---


## 【前提知識】同期処理と非同期処理とは

同期処理とは、

```
console.log("1");
console.log("2");
console.log("3");
```
このように上から順に実行される処理のことを言う。

一方で、非同期処理とは

```
console.log("1");

setTimeout(() => {
  console.log("2");
}, 1000);  // 1秒後に実行

console.log("3");
```

このように、処理の完了を待たずに後続の処理を行うことを言う。

setTimeoutの他に、fetchAPIが非同期処理に当てはまる。

## fetchAPIのコールバック地獄に対処する。

例えば、fetchAPIでリクエストを書く時、

```
fetch(url, { method, headers, body })
.then( (res) => {
    if (!res.ok) {
        throw new Error("Network response was not ok");
    }
    return res.json();
})
.then( (data) => {
    this.refreshList();
})
.catch( (error) => {
    console.log(error);
});
```

このようにコールバックをずっと書くことになる。これがいわゆるコールバック地獄と言われるものである。

## asyncとawaitを使って、非同期処理を簡潔に表現する。

そこで、このコールバック地獄に対処するため、asyncとawaitで書き換えたコードがこちら。

```
async function fetchData(url, method, headers, body) {
    try {
        const res = await fetch(url, { method, headers, body });

        if (!res.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await res.json();
        this.refreshList();  // データ取得成功時の処理

    } catch (error) {
        console.log(error);  // エラーハンドリング
    }
}
```

async と await は非同期処理のコードをより直感的に書くことができる。

asyncは関数を非同期関数として定義する。この関数はPromiseを返すことができる。

awaitはPromiseが解決されるのを待つ

## Promiseを返さない非同期関数は？

非同期処理のfetchAPIはPromiseを返すので、awaitが使える。

しかし、非同期処理とは言え、Promiseを返さないsetTimeoutがある。これはそのままではawaitは使えない。

そこで、Promiseクラスでラップをすることで対処する。

```
function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function example() {
    console.log("待機中...");
    await wait(1000);  // 1秒待ってから↓が実行される
    console.log("1秒経過しました");
}

example();
```

なお、awaitはasyncの中でのみ実行できる。

つまり、このコードはエラーになる。

```
function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

console.log("待機中...");
await wait(1000);  // 1秒待つ
console.log("1秒経過しました");
```

