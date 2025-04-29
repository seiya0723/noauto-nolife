---
title: "【データベース】基本的なSQL文の一覧【SELECT, INSERT INTO, DELETE, UPDATE, UNION, JOIN】"
date: 2025-04-20T11:05:08+09:00
lastmod: 2025-04-20T11:05:08+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "サーバーサイド" ]
tags: [ "SQL","tips","データベース","docker" ]
---



## 【導入】dockerでDatabaseを用意する。


### Oracle DBを用意する


[UbuntuのDockerでOracle DB SQL Silverの試験勉強の環境を整える](/post/docker-oracle-silver-env/)

<!--
## 【導入】SQLite を用意する。
今回はすでにdjangoで構築済みのDBが用意できるSQLiteを採用した。
https://github.com/seiya0723/django_m2m_customforms
-->


## テーブルをつくるCREATE TABLE文

```
CREATE TABLE テーブル名 (
    カラム名1 データ型 [制約],
    カラム名2 データ型 [制約],
    ...
);
```

この書き方に倣って、

```
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

こんな感じで、カテゴリ→トピック→リプライのつながりでテーブルをつくる。


## レコードの挿入のINSERT INTO

続いて、INSERT INTO 文

```
INSERT INTO [テーブル名] ([カラム名1], [カラム名2] ... ) VALUES ([値1] , [値2] ... );
```

```
-- カテゴリを追加
INSERT INTO categories (name) VALUES ('プログラミング');
INSERT INTO categories (name) VALUES ('旅行');
INSERT INTO categories (name) VALUES ('料理');

-- トピックを追加
INSERT INTO topics (category_id, title, content) VALUES (1, 'SQLの基本を学ぶ', 'SELECT文から始めよう');
INSERT INTO topics (category_id, title, content) VALUES (1, 'PythonとSQLの連携', 'sqlite3を使ってみよう');
INSERT INTO topics (category_id, title, content) VALUES (2, '京都おすすめスポット', '紅葉の時期が最高');
INSERT INTO topics (category_id, title, content) VALUES (3, '時短レシピ紹介', '一人暮らしにおすすめ');

-- リプライを追加
INSERT INTO replies (topic_id, content) VALUES (1, 'SELECTは大事ですよね');
INSERT INTO replies (topic_id, content) VALUES (1, 'WHEREも忘れずに');
INSERT INTO replies (topic_id, content) VALUES (2, 'sqlite3便利ですよね！');
INSERT INTO replies (topic_id, content) VALUES (3, '嵐山の紅葉は最高でした');
INSERT INTO replies (topic_id, content) VALUES (4, '簡単で美味しそう');
```

## 基本のSELECT文

前項のダミーデータがある場合で、まずはidが1番のトピックを取り出すには

```
SELECT * FROM WHERE id = 1;
```

"プログラミング" カテゴリのデータを取り出すには

```
SELECT * 
FROM topics 
WHERE category_id = (SELECT id FROM categories WHERE name = 'プログラミング');
```

こうする。 
```
SELECT * 
FROM topics 
WHERE category_id = 1;
```

でも良いが、これでは「プログラミング」カテゴリと検索してidを手に入れたわけではない。

この () のサブクエリを使うことで、先にSQLを実行させ、手に入れた値をもとにクエリを実行することができる。

ただし、このサブクエリ。1件以上のデータが出てしまうとエラーになってしまう。そこで、

```
SELECT * 
FROM topics 
WHERE category_id = (
    SELECT id FROM categories WHERE name = 'プログラミング'
    ORDER BY id DESC 
    LIMIT 1
);
```
として、1件だけ取り出すか、もしくはテーブルをつくるときにUNIQUE制約をつけるなどが良い。
```
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
```

## レコード削除の DELETE

※ DELETE文の実行は、非常に危険。事前にSELECT文で取り出しできるレコードを確認してからDELETEに置き換えるほうが無難。

```
DELETE FROM テーブル名
WHERE 条件;
```


id 3のリプライを削除する。
```
DELETE FROM replies
WHERE id = 3;
```
WHERE 文がないとテーブル内のデータをすべて削除してしまうので注意する。

```
DELETE FROM replies;
```
そのため、最初にSELECT 文で確認をしてから削除というのがセオリー


```
SELECT * FROM replies WHERE content LIKE '%不適切な内容%';
```

```
DELETE  FROM replies WHERE content LIKE '%不適切な内容%';
```

これで「不適切な内容」をcontentに含んだデータを取り出せる。 % はワイルドカードで今回の%で囲むことで前方一致、後方一致にもなる

```
SELECT * FROM replies
WHERE content LIKE '%荒らし%'
   OR content LIKE '%暴言%'
   OR content LIKE '%スパム%';
```
WHERE 文でORを使えばまとめて特定して削除することもできる。


### PostgreSQLでの LIKE 文

MySQLでは大文字と小文字は区別するが、PostgreSQLではLIKE文は大文字と小文字を区別する。

ILIKE文を使うことで、大文字と小文字を区別しないようにできる。


## レコード編集のUPDATE

※ UPDATE文ではWHERE文を忘れると、全行が編集されてしまうため、まずはWHERE文が正しいかSELECT でチェックをしてから実行する。

```
UPDATE テーブル名
SET カラム名1 = 新しい値1, カラム名2 = 新しい値2, ...
WHERE 条件;
```

条件でデータを取り出し、カラムを新しい値に書き換える。

```
UPDATE replies
SET content = 'この内容は修正されました。'
WHERE id = 3;
```


## 複数のSELECT文を合体 UNION

UNION は複数の結果を縦に合体させることができる。

```
SELECT ... FROM ...
UNION
SELECT ... FROM ...;
```
ただし、列数とデータ型が一致していないとエラーになる。


例えば、 こうすれば、トピックとリプライの投稿がすべて確認できる。
```
SELECT 'topic' AS type, content FROM topics
UNION
SELECT 'reply' AS type, content FROM replies;
```
AS(エイリアス) を使って type を topic とreply で識別できるようにし、 content にはそれぞれの投稿内容が表示される。

ただし、重複が除去されてしまうので、すべて表示させるには、UNION ALL を使う。
```
SELECT 'topic' AS type, content FROM topics
UNION ALL
SELECT 'reply' AS type, content FROM replies;
```
これにより、全データが表示される。 こんな感じである。

|type|content|
|----|----|
|topic|Pythonについて話しましょう|
|topic|JavaScriptの質問はこちら|
|reply|それは良い質問ですね|
|reply|詳しくは公式ドキュメントを参照|

## テーブル結合の JOIN

JOIN( INNER JOIN )を使えば外部キーで紐付いているデータで結合ができる。

例えば、リプライのtopic_id と トピックの id で結合している。

```
SELECT
    replies.id AS reply_id,
    replies.content AS reply_content,
    topics.title AS topic_title
FROM replies
JOIN topics ON replies.topic_id = topics.id;
```
|reply_id	|reply_content	                |topic_title|
|----|---|----|
|1	        |それは良い質問ですね	        |Pythonについて話しましょう|
|2	        |詳しくは公式ドキュメントを参照	|JavaScriptの質問はこちら|

### カテゴリとトピックとリプライを結合するには？

```
SELECT
    replies.id AS reply_id,
    replies.content AS reply_content,
    topics.title AS topic_title,
    categories.name AS category_name
FROM replies
JOIN topics ON replies.topic_id = topics.id
JOIN categories ON topics.category_id = categories.id;
```

|reply_id | reply_content | topic_title | category_name|
|----|----|----|----|
|1 | それは良い質問ですね | Pythonについて話そう | プログラミング|
|2 | ドレミの練習がオススメです | ギター初心者の質問 | 音楽|


## 参照元

- https://products.sint.co.jp/siob/blog/sql-delete



