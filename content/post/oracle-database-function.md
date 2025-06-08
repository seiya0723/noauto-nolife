---
title: "【SQL】Oracleデータベースのファンクション(関数)の一覧"
date: 2025-06-01T18:38:32+09:00
lastmod: 2025-06-01T18:38:32+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "インフラ" ]
tags: [ "Oracle","データベース","tips","追記予定" ]
---


## NVL(A,B) AがNULLならBを返す

以下は、bonus カラムの値がNULLの場合、そのまま表示させず、0を返すようにしている。

```
SELECT NVL(bonus, 0) AS bonus_value
FROM employees;
```

文字列を返すこともできる。ただし元のカラムの値と同じデータ型に限る。

```
SELECT NVL(middle_name, '（なし）') AS middle
FROM users;
```

つまり以下はエラー(暗黙的に型変換される可能性もあるが、エラーになることがあるため、推奨されない)

```
SELECT NVL(bonus, '賞与なし') AS bonus_value
FROM employees;
```

この場合、型変換を明示的に指定して変換をするとよいだろう。

```
SELECT NVL(TO_CHAR(bonus), '賞与なし') AS bonus_value
FROM employees;
```


ちなみに、Oracle以外のDBで同じことをする場合、 COALESCE を使う。

## SUBSTR(str, start, len)

日時の文字列から、末尾2文字を切り取って取り出す場合にも使える。

以下は、'2025010110304099' から末尾の99を切り取っている。

```
SELECT SUBSTR(date, 1, 14) AS date_str 
FROM employees;
```

ちなみに、Oracleでは1文字目は1から開始になる。(通常の配列などのインデックス番号のように0ではない。)

Oracleでは、仮に0を指定した場合、1として解釈される。

とはいえ、他のDBでは解釈が異なるため、必ず最初は1を指定する。

第3引数は長さを指定する。今回は14文字目まで取り出す。いずれもインデックス番号ではない。

## TO_CHAR(date, fmt)

日付型を文字列型にする。フォーマットの書式は公式を参照。

参照: https://docs.oracle.com/cd/E57425_01/121/SQLRF/sql_elements004.htm#CDEHIFJA

```
SELECT TO_CHAR(sysdate, 'YYYY-MM-DD HH24:MI:SS') AS current_time
FROM dual;
```

例えばこの場合、2025年1月1日 午前4時1分2秒  であれば、`'2025-01-01 04:01:02'` に変換される。

## TO_DATE(str, fmt)

文字列型を日付型にする。

'20250101040102' をTO_DATEで扱うには、

```
SELECT TO_DATE(strdate, 'YYYYMMDDHH24MISS') AS current_time
FROM dual;
```

こうする。

仮に、末尾2桁に番号などが割り振られている場合。

例えば、'2025010104010299'などの場合は、一旦SUBSTRで切り取ってから、TO_DATE にかける。

```
SELECT TO_DATE(SUBSTR(strdate, 1, 14), 'YYYYMMDDHH24MISS') AS current_time
FROM dual;
```

日時フォーマット以外の文字が含まれている場合、直にTO_DATEにかけるとエラーが出る。


