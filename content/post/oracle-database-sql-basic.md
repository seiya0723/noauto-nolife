---
title: "OracleDBのSQLまとめ"
date: 2025-04-29T08:41:03+09:00
lastmod: 2025-04-29T08:41:03+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "others" ]
tags: [ "データベース","SQL","tips","追記予定" ]
---

dockerにインストールしたOracle−XEを使用している。

[UbuntuのDockerでOracle DB SQL Silverの試験勉強の環境を整える](/post/docker-oracle-silver-env/)

HR スキーマを搭載した。

## 雇用日時をもとに絞り込みをする


### 【非推奨】文字列を与えると、暗黙的にDATE型に変換する

例えば、2015年1月1日以降に雇用した従業員を出力するには、

```
SELECT * FROM employees WHERE hire_date >= '2015-01-01' ;
```

そして、新人を上に表示させるため、降順に並び替える。

```
SELECT * FROM employees WHERE hire_date >= '2015-01-01' ORDER BY hire_date DESC;
```

ただし、このように文字列を指定する方法はあまり好ましくない。

### 【推奨】TO_DATEを使うことで安全にDATE変換をして比較をする

このようにTO_DATE関数を使って型を変換して比較をしたほうが良いだろう。

```
SELECT * FROM employees WHERE hire_date >= TO_DATE('2015-01-01', 'YYYY-MM-DD');
```

```
SELECT * FROM employees WHERE hire_date >= TO_DATE('2015-01-01', 'YYYY-MM-DD') ORDER BY hire_date DESC;
```

このようにする。


### 【EXTRACT】年だけで絞り込みをするには？

EXTRACT 関数を使って対応する。戻り値は数値になるため、シングルクオートはつけない。

```
-- 年だけで絞り込みをするには、EXTRACT 関数を使う
SELECT * FROM employees WHERE EXTRACT(YEAR FROM hire_date) >= 2016 ORDER BY hire_date DESC;
```

MONTHを指定すれば月も取得できる。

```
-- 月だけで絞り込みをする( 2017年以降 の 下半期に入社した人 )
SELECT * FROM employees WHERE 
    EXTRACT(YEAR FROM hire_date) >= 2017 AND
    EXTRACT(MONTH FROM hire_date) >= 7
    ORDER BY hire_date DESC;
```

### 【BETWEEN】期間を指定して絞り込みをするには？

EXTRACTを使って年だけ取り出し、比較をしている。

```
-- 2013年から 2015年に入社した人
SELECT * FROM employees WHERE
    EXTRACT(YEAR FROM hire_date ) BETWEEN 2013 AND 2015
    ORDER BY hire_date DESC;
```
このBETWEENは

```
BETWEEN a AND b 
```

によりa以上b以下という表現になる。そのため、BETWEEN文を使った時点で未満の表現は実現できない。

また、この方法だと、データ量が多い場合遅くなってしまう。

更に、インデックスが張られている場合は通用しない。

そこで、WHERE 文のANDと TO_DATE を使う。

```
SELECT * FROM employees WHERE
    hire_date >= TO_DATE('2013-01-01', 'YYYY-MM-DD') AND
    hire_date < TO_DATE('2016-01-01', 'YYYY-MM-DD')
    ORDER BY hire_date DESC;
```

これで更に柔軟に表現をすることができる。

BETWEEN a AND b を使えば簡潔に表現はできるが、柔軟性にかける点で注意が必要。

#### 【注意】BETWEEN の文字列問題

BETWEEN で文字列を扱う場合。

例えば、名前がAからCまでの人を取り出したい場合。

```
SELECT * FROM employees WHERE last_name BETWEEN 'A' AND 'C';
```

としてしまうと、AとBから始まる人は取れるが、Cから始まる人は取れない。

例えば、ChenはCよりも大きいとみなされ取れない。

そのため このように、WHERE と LIKE を使って対応する。

```
-- last_name がAからCまでの人。
SELECT * FROM employees WHERE
    last_name LIKE 'A%' OR
    last_name LIKE 'B%' OR
    last_name LIKE 'C%'
    ORDER BY last_name;
```

簡潔に書く場合、SUBSTRを使う。ただしSUBSTR はデータ量が多い場合は遅いため注意。

```
SELECT * FROM employees WHERE
    SUBSTR(last_name, 1, 1) IN ('A','B','C')
    ORDER BY last_name; 
```

`SUBSTR(取り出す列名(もしくは文字列), 開始位置, 何文字分取り出すか)` で指定する。

以上から、BETWEENは簡潔に表現できる反面、ANDへ書き直す際の手間、未満の表現ができない問題なども含め、使用を禁じているケースもある。


## 部署を結合して取り出す。

### INNER JOIN を使って外部キーに紐付いているデータを結合して出す。

```
-- department_id で紐付いているデータを取り出す。
-- ※ ただしemployees の department_id がNULL、departments に存在しない場合 の社員は出てこない。
-- ※ INNER JOIN は JOIN と略して書いても良い

SELECT * FROM employees
    JOIN departments ON employees.department_id = departments.department_id
    ORDER BY employee_id;
```

ただし、このINNER JOIN(JOIN)は department_id がNULL であったり、departments テーブルに存在しないidが指定されていた場合は表示しないようになっている。

### LEFT JOIN を使って 紐付かないデータも表示する。

そこでLEFT JOINを使う。

```
-- employees の department_id がNULL の社員を出すには LEFT JOIN を使う。

SELECT * FROM employees
    LEFT JOIN departments ON employees.department_id = departments.department_id
    ORDER BY employee_id;
```

これにより紐付かないデータも表示できる。

### 多段 JOIN で更に紐付いているデータを結合する。

```
-- locations テーブルの国id とcountries の国idで結合
-- countries の地域idとregions の地域idで結合。

SELECT * FROM locations l
    LEFT JOIN countries c  ON l.country_id = c.country_id
    LEFT JOIN regions r ON c.region_id = r.region_id;
```

更に、 スペースを空けてテーブル名のエイリアスを作っておくと、短く表現できる。このようにASは省略できる。

テーブルのエイリアスにはASは使わないことのほうが多い。カラムのエイリアスにはASを使ったほうがよい。



### 【サブクエリ】条件に一致するデータだけ、結合する。

条件に一致するデータだけ結合をする。

結合した後に絞り込んでもよいが、それでは無駄に結合されてしまう。

そのため、先に絞り込みをしてから結合する。サブクエリを使う。

```
-- 日本に一致する国だけ結合。( countries で絞ってから結合する。) 
SELECT * FROM locations l 
LEFT JOIN ( SELECT * FROM countries WHERE country_name = 'Japan' ) c  ON l.country_id = c.country_id 
LEFT JOIN regions r ON c.region_id = r.region_id;
```

ここで、もしlocationsの時点で絞り込みをしたい場合は、FROM の時点でサブクエリを動かす。

```
-- location で country_id が JP のデータを絞った上で結合する。
SELECT * FROM ( SELECT * FROM locations WHERE country_id = 'JP' ) l 
LEFT JOIN countries c  ON l.country_id = c.country_id 
LEFT JOIN regions r ON c.region_id = r.region_id;
```

### RIGHT JOINは？

RIGHT JOINは右側のデータを必ず残したい場合に使う。しかし、


```
SELECT * FROM employees e
    RIGHT JOIN departments d 
    ON e.department_id = d.department_id;
```

このRIGHT JOINと

```
SELECT * FROM departments d
    LEFT JOIN employees e 
    ON e.department_id = d.department_id;
```

このLEFT JOINは等価である。順序を逆にすれば良いだけなので、現場では基本LEFT JOINが使われる。



## Oracleの関数まとめ


### 【NVL】NULL値の値を置き換える

```
SELECT NVL(manager_id, 'なし') FROM employees;
```

こうすれば、manager_id は 'なし' として扱われ、NULLがそのままになってしまうことはない。

### 【COALESCE】NULL値の置き換えを複数指定する。

```
SELECT COALESCE(phone_number, mobile_number, '連絡先なし') AS primary_contact
FROM employees;
```

phone_number があればそれを、なければ mobile_numberを、両方なければ '連絡先なし' を表示する。

ちなみに、このCOALESCEはANSI基準であり、Oracleでしか使えないNVLとは異なる。


### 【TO_CHAR】日付や数値を文字列に変換する

```
SELECT TO_CHAR(hire_date, 'YYYY-MM') FROM employees;
-- 例: '2024-07'
```

### 【TO_DATE】文字列を日付に変換する

```
SELECT * FROM employees WHERE hire_date >= TO_DATE('2015-01-01', 'YYYY-MM-DD') ORDER BY hire_date DESC;
```



### 【TRIM】前後の空白、もしくは指定文字を削除する

```
SELECT TRIM('  Hello  ') FROM dual; -- → 'Hello'
SELECT TRIM('0' FROM '000123000') FROM dual; -- → '123'
```

### 【LENGTH】文字列の長さを測る

```
LENGTH('abc') -- → 3
```

### 【SUBSTR】文字列の部分取得

```
SELECT * FROM employees WHERE
    SUBSTR(last_name, 1, 1) IN ('A','B','C')
    ORDER BY last_name;
```

`SUBSTR(文字列, 開始位置, 長さ)`


### 【UPPER()とLOWER()】大文字化と小文字化

```
UPPER('abc') → 'ABC'
```

```
LOWER('ABC') → 'abc'
```


## 関数の実用例


### NVLでNULL対策をして、必要なデータだけトリミングして表示する。

```
SELECT TO_CHAR(NVL(hire_date, SYSDATE), 'YYYY-MM-DD') AS 入社日
    FROM employees;
```


