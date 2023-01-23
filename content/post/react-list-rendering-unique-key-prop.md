---
title: "【React】リストをレンダリングする時は、key属性を付与する【Warning: Each child in a list should have a unique 'key' prop.】"
date: 2023-01-23T10:09:43+09:00
lastmod: 2023-01-23T10:09:43+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","tips" ]
---

例えば、以下のような配列があったとする。

    const topics = ["aaa","bbb","ccc"];


この配列をレンダリングする時、このようにしてしまうと

    return (
        <>
            {
                topics.map( (topic) => {
                    return ( <div className="border">{ topic }</div> );
                })
            }
        </>

    );


この警告が出る。

<div class="img-center"><img src="/images/Screenshot from 2023-01-23 10-09-08.png" alt=""></div>

## なぜ『Warning: Each child in a list should have a unique "key" prop.』と警告が出るのか？

Reactで配列をレンダリングする際にkey属性を指定しないと、無駄なレンダリングが発生してしまい、パフォーマンスが低下するから。

例えば、key未指定で3つのデータがレンダリングされたとする。

```
あああ
いいい
ううう
```
この時、一番上の『あああ』が消された時、『いいい』と『ううう』も再レンダリングされてしまう。

一方で、ユニークなkey属性が指定されていた場合、『あああ』が消えるだけで、『いいい』と『ううう』はそのままになる。

つまり、keyを入れるだけで処理の効率が上がるのだ。

## 解決策

先ほどのレンダリング時、`.map()`の処理にインデックス番号を使うと良い。


    return (
        <>
            {
                topics.map( ( topic, i ) => {
                    return ( <div className="border" key={i}>{ topic }</div> );
                })
            }
        </>

    );


たったこれだけでこの警告は消える。

## 結論

配列のレンダリングはSPA開発の基本中の基本でもあるので、この警告はしっかり押さえておきたいところだ。

以下、参照元。

- https://progtext.net/programming/react-key/
- https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js

