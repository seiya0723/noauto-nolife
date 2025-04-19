---
title: "Next.jsとTypeScriptで簡易掲示板をつくる"
date: 2025-04-04T09:03:11+09:00
lastmod: 2025-04-04T09:03:11+09:00
draft: false
thumbnail: "images/next-type.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Next.js","TypeScript","React","追記予定" ]
---

Next.js を使えば、フロントからサーバーサイドまで一貫してJavaScript(TypeScript)でウェブアプリをつくる。

```
npx create-next-app startup-bbs
```

<div class="img-center"><img src="/images/Screenshot from 2025-04-04 09-54-23.png" alt=""></div>

このようにプロジェクトを作った。

```
cd startup-bbs 

npm run dev 
```
これでサーバーが起動すればプロジェクト作成はOK。


## プロジェクトのディレクトリ構成

startup-bbs の中は以下のようになっている。

```
$ ls -al

合計 264
drwxrwxr-x   7 akagi akagi   4096  4月  4 10:40 .
drwxrwxr-x   3 akagi akagi   4096  4月  4 10:39 ..
drwxrwxr-x   8 akagi akagi   4096  4月  4 10:39 .git
-rw-rw-r--   1 akagi akagi    480  4月  4 10:39 .gitignore
drwxrwxr-x   7 akagi akagi   4096  4月  4 10:40 .next
-rw-rw-r--   1 akagi akagi   1450  4月  4 10:39 README.md
-rw-rw-r--   1 akagi akagi    393  4月  4 10:39 eslint.config.mjs
-rw-rw-r--   1 akagi akagi    211  4月  4 10:39 next-env.d.ts
-rw-rw-r--   1 akagi akagi    133  4月  4 10:39 next.config.ts
drwxrwxr-x 275 akagi akagi  12288  4月  4 10:39 node_modules
-rw-rw-r--   1 akagi akagi 199748  4月  4 10:39 package-lock.json
-rw-rw-r--   1 akagi akagi    580  4月  4 10:39 package.json
-rw-rw-r--   1 akagi akagi     81  4月  4 10:39 postcss.config.mjs
drwxrwxr-x   2 akagi akagi   4096  4月  4 10:39 public
drwxrwxr-x   3 akagi akagi   4096  4月  4 10:39 src
-rw-rw-r--   1 akagi akagi    602  4月  4 10:39 tsconfig.json
```

この内、中心に作業をしていくのは、src ディレクトリ。以下のようなディレクトリ構成に仕立てる。

```
src/
  ├── app/
  │   ├── components/       // UIコンポーネント
  │   │   ├── Button.tsx   // ボタンコンポーネント
  │   │   └── Header.tsx   // ヘッダーコンポーネント
  │   ├── api/              // APIルート
  │   │   └── hello/       // /api/hello にリクエストした時発動。
  │   │       └── route.ts // ↑にリクエストした時発動する処理。
  │   ├── layout.tsx        // レイアウト
  │   ├── page.tsx          // トップページ
  │   ├── about/            // /about ページ
  │   │   └── page.tsx
  │   └── styles/           // CSS/SCSSファイル
  ├── lib/                   // 共通のライブラリやユーティリティ
  ├── types/                 // データ型の宣言
  ├── public/                // 静的ファイル
  └── styles/                // グローバルCSS
```

`src/app/api/` の中にはサーバーサイドのコードを書いていく。djangoのビュー、Laravelのコントローラのような役割だ。

例えば、 `src/app/api/hello/route.ts` というファイルをつくると、 `/api/hello` にリクエストを送った時、 `route.ts` のファイルが実行される。

そのため、ルーティングファイルをあえてつくる必要はないのがNext.jsの良いところである。ディレクトリ構成で直観的にわかる。

## src/lib/db.ts : DB設定用のファイルをつくる

本来、Next.jsはフロントサイドのフレームワークである。故にDBの設定ファイルやORMなどが最初から用意されてはいない。

そのため、今回ライブラリをインストールする。

```
npm install sqlite3
```

プロジェクトディレクトリ直下に、SQLiteファイルをつくる

```
touch database.db
```

テーブルも作っておく。いつもの簡易掲示場であり、コメント2000文字までのNOTNULL、オートインクリメントの主キー。

```
sqlite3 database.db 
```

```
CREATE TABLE topic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment VARCHAR(2000) NOT NULL
);
```

<div class="img-center"><img src="/images/Screenshot from 2025-04-04 16-18-52.png" alt=""></div>

SQLiteファイルにアクセスするコードも別途用意する。 `src/lib/db.ts` をつくる。内容は以下。

```
import sqlite3 from 'sqlite3';

// SQLiteデータベースに接続
const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('データベース接続エラー: ', err.message);
  } else {
    console.log('SQLiteデータベースに接続しました。');
  }
});

export default db;
```

これを使って、APIサーバー側はDBの読み書きをしている。

## データ型の宣言

src/types/topic.d.ts というファイルをつくる。 宣言のみしているtypescriptなので、.d.ts という拡張子にする。

```
export interface TopicType {
  id: number;
  comment: string;
}

export interface CreateTopicType {
  comment: string;
}
```

取得したTopicと送信するTopicのデータ型である。

## APIをつくる

APIをつくる。 src/app/api/topics/route.ts をつくる。内容は以下

```
// src/app/api/topics/route.ts
import { NextResponse } from 'next/server';

import type { NextApiRequest, NextApiResponse } from 'next';

import db from '@/lib/db';
import { TopicType,CreateTopicType } from '@/types/topic';  // @を使って簡素化

// ↑
/*
type TopicType = {
    id: number;
    comment: string;
};
*/


// TODO: データ型を指定する。TypeScriptなので
export async function GET() {

    // TODO: ここでSQL実行。DBからデータ取り出し。
    const topics : TopicType[] = [
        { "id": 1, "comment": "aaa"},
        { "id": 2, "comment": "aaa"},
        { "id": 3, "comment": "aaa"},
    ];

   /*
    const topics : TopicType[]  = await db.all(`SELECT id, comment FROM topic`);
    console.log(topics)
    */

   /*
    const topics = await db.all('SELECT * FROM topic');
    console.log(topics)

    const topic = await db.get('SELECT *  FROM topic WHERE id = ?', 2);
    console.log(topic);
    */


    return NextResponse.json({ topics })
}
export async function POST(req: Request) {

    const { comment }: CreateTopicType = await req.json();

    // TODO: ここでSQL実行。DBに投稿する。

    // const topic = await db.all('SELECT * FROM topic WHERE id = $1', [1]);
    // INSERT INTO topic (comment) VALUES ('HelloWorld');

    // TIPS: もしカラムが複数であれば、その文だけ ? を増やし、プレースホルダーも増やす。
    // const newTopic = await db.run(`INSERT INTO topic (comment) VALUES (?)`, comment );
    // ↑だとidが自動採番にならないSQLiteの仕様上の問題。


    const count = await db.all(`SELECT COUNT(*) FROM topic`);

    console.log(count)
    console.log(count.count)

    const teds = await db.all(`SELECT * FROM topic`);
    console.log(teds)

    const newTopic = await db.run(`INSERT INTO topic (id, comment) VALUES (?, ?)`, 2, comment );



    return NextResponse.json({ message: 'Hello World' })
}
```

## UIのコンポーネントをつくる

今回は後の拡張性も考慮して、ボタンとテキストエリアのコンポーネントを用意した。

### ボタンコンポーネント

SubmitButton

### テキストエリアコンポーネント

Textarea

## トップページをつくる

後日追記予定。

## ソースコード

近日公開。


## 参照元

https://qiita.com/moriokatakashir/items/a9ec4d57ad6bdba6ce50


