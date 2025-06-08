---
title: "【SQL】GROUP BY, HAVING, COUNTの3つでグループ化して集計、条件で絞り込みカウントする"
date: 2025-06-02T18:47:15+09:00
lastmod: 2025-06-02T18:47:15+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "インフラ" ]
tags: [ "SQL","データベース","tips" ]
---


## GROUP BY + HAVING + COUNT

よくある手法の一つに、

```
売上データから営業担当者ごとに売上件数を集計し、売上件数が2件以上の人だけ表示したい。
```

というものがある。

| id | salesperson | region | amount |
| -- | ----------- | ------ | ------ |
| 1  | Alice       | East   | 100    |
| 2  | Bob         | West   | 200    |
| 3  | Alice       | East   | 150    |
| 4  | Bob         | West   | 250    |
| 5  | Carol       | East   | 300    |

データがこの場合、SQLで表現すると、

```
SELECT salesperson, COUNT(*) AS num_sales
FROM sales
GROUP BY salesperson
HAVING COUNT(*) >= 2;
```

結果はこうなる。

| salesperson | num\_sales |
| ----------- | ---------- |
| Alice       | 2          |
| Bob         | 2          |


### GROUP BY カラムが同じ値ごとに集計

GROUP BY はカラムを指定し、同じ値ごとに集計をすることができる。

今回は salesperson を指定することで、同じ営業担当者ごとに集計している。

### HAVING グループ化に条件を指定

HAVINGはグループ化したあとに条件を指定することができる。

条件を指定できるという点ではWHERE文と共通しているが、GROUP BYを使わない限り使えない。

- WHERE: 集計前に絞り込み
- HAVING: GROUP BYで集計後に絞り込み


### COUNT で集計 (集約関数)

今回 `COUNT(*)` としている。

この*は列を意味している。取得する列がなんであれ、必ずカウントできるようにしている。

ちなみに、COUNTやSUM、AVGなどのことを集約関数という。

この集約関数はGROUP BY を使わずに集約した場合、全体集約として扱うことができる。

例えば今回、GROUP BYをせずにAVGを使った場合。営業売上1件あたりの平均売上額として扱うことができる。

```
SELECT AVG(amount) AS avg_amount
FROM sales;
```

GROUP BY をせずにCOUNT した場合は、レコードの件数ということになる。

```
SELECT COUNT(*) AS count
FROM sales;
```

### 【補足】COUNT(*) はパフォーマンスに影響を与えるか？

通常、 `SELECT * `としてしまうとパフォーマンスに影響を与えることがある。

しかし、同じように*を使う`COUNT(*)`ではパフォーマンスに影響することはない。

`SELECT *` と違って、データそのものの読み込みをしないためのIO待ちが発生しないからだ。


## 【例題1】営業担当者ごとに集計して、売上が多い順に並び替えるには？

```
SELECT salesperson, SUM(amount) AS sum_amount
FROM sales 
GROUP BY salesperson
ORDER BY sum_amount DESC;
```

### SUM で指定した列の合計をする

GROUP BY で 営業担当者ごとに集計をしたあと、 amountで合計を計算している。

## 【例題2】営業担当者ごとに集計して、売上の平均を計算、売上金の平均が200以上のデータに絞り込み、大きい順に並び替えるには？

```
SELECT salesperson, AVG(amount) AS avg_amount
FROM sales
GROUP BY salesperson 
HAVING avg_amount >= 200
ORDER BY avg_amount DESC;
```

ちなみにOracleでは以下のようにする。


```
SELECT salesperson, AVG(amount) AS avg_amount
FROM sales
GROUP BY salesperson 
HAVING AVG(amount) >= 200
ORDER BY avg_amount DESC;
```


### 【注意】OracleDBではSELECT句で指定したASは、HAVINGでは使えない

PostgreSQLやMySQLなどでは、SELECTで指定したASはそのままHAVINGで使えるが、Oracleでは使えない。

なぜなら評価順が

1. FROM
1. WHERE
1. GROUP BY
1. HAVING
1. SELECT
1. ORDER BY

このようになっているから。

HAVINGが発動する時点ではSELECTは発動しておらず、ASは使われていない。

そのため、`avg_amount` と指定してもOracleにはなんのことかわからない。

ちなみに、ORDER BYでは 別名は使用しても構わない。結果、以下のようになる。

```
SELECT salesperson, AVG(amount) AS avg_amount
FROM sales
GROUP BY salesperson 
HAVING AVG(amount) >= 200
ORDER BY avg_amount DESC;
```

AVGを何度も呼び出しているため、パフォーマンス上の難があるように見える。

しかし、実際には1回だけ集計計算を行っており、内部的に使いまわすためパフォーマンスの影響はほぼ受けない。





