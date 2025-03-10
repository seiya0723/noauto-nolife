---
title: "【React】値が変わっても再レンダリングをしないuseRefとuseMemoの違い【デバウンス向けなのは？】"
date: 2025-03-07T10:59:10+09:00
lastmod: 2025-03-07T10:59:10+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "React","tips","JavaScript" ]
---


入力欄に入力をするたび発火をする時、Stateに保存し続けると頻繁に再レンダリングが発動してパフォーマンスが落ちる。そこでデバウンスを採用する。

[デバウンスしてキー入力の度にイベントを発火し続けないようにする【再レンダリング地獄対策】](/post/javascript-debounce/)

このデバウンスをReactで実装し、setTimeoutのオブジェクトを記録するには、useRefが正解。

同じように値が変わっても再レンダリングをしないhookとしてuseMemoがあるが、これはコストの高い計算をキャッシュするためのもので、setTimeoutのオブジェクトの保存には適さない。

とはいえ、その具体的な違いが不明瞭なため、今回useRefとuseMemoの違いをまとめることにした。


## useRef

まずは、今回の目的であるデバウンスに向いたuseRefのコード。

```
import React, { useRef } from 'react';

function TimerComponent() {
    const timerRef = useRef(null); // setTimeoutのIDを保持

    const startTimer = () => {
        clearTimeout(timerRef.current);  // 前回のタイマーをクリア
        timerRef.current = setTimeout(() => {
            alert('タイマー実行');
        }, 2000);
    };

    return <button onClick={startTimer}>タイマー開始</button>;

}

export default TimerComponent;
```

このコードは、ボタンを押して、2秒経ってからalertを表示する。

ボタンを2秒経つ前に押した場合、その前に押したsetTimeoutはクリアされる。

これで、2秒経つ前にボタンを連打されたとしても、1回しか実行はされない。(キーボードやマウスのチャタリング対策に有効)

## useMemo

一方、高コストな計算処理を、ボタンが押される時に発動できる。

```
import React, { useState, useMemo } from 'react';

function ExpensiveComponent() {
    const [count, setCount] = useState(0);

    // 計算コストが高い関数
    const expensiveValue = useMemo(() => {
        console.log('高コスト計算実行');
        return count * 1000;
    }, [count]); // countが変わる時だけ再計算

    return (
        <div>
            <p>計算結果: {expensiveValue}</p>
            <button onClick={() => setCount(count + 1)}>カウント+1</button>
        </div>
    );
}

export default ExpensiveComponent;
```

useMemoは、発火するには依存配列が必要になる。

ボタン押下でStateを使ってcountの値を書き換えたが、そのたびに再計算をすることができる。

再計算によってStateが書き換えられることはないので、計算結果を表示(レンダリング)せず内部にとどめておきたい場合には有効。

## 結論

- useRef は依存配列を必要としないため、単純に値を記録するのに役立つ
- だからuseRef は デバウンス機能の実装には丁度いい
- useMemo は 依存配列が必要なので、Stateと組み合わせて使う
- useRefとuseMemoは、どちらも値が変わっても再レンダリングはされない

よって、**デバウンスの実装にはuseRefを使う。**


