---
title: "EXISTSの使い方"
date: 2025-10-04T07:07:14+09:00
lastmod: 2025-10-04T07:07:14+09:00
draft: false
thumbnail: "images/oracle.jpg"
categories: [ "サーバーサイド" ]
tags: [ "DB","SQL","Oracle" ]
---

DBはOracle。

## 外部キーを使った存在チェック

```
SELECT d.department_id, d.department_name
FROM departments d
WHERE EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.department_id = d.department_id
);
```
このSQLは、部署内に社員がいる部署だけを返す。

まず、departments内のデータを取り出す。

employeesからdepartment_id で一致するものが1件でもあれば、そのdepartmentsを表示する。 

イメージ的には全走をして、行が見つかればTRUEを返してアーリーリターンをしている。(※ただしDB的には集合志向のため、全走をしているとは言えない。)

これは、集約+結合を使えば、ほぼ同じ結果が得られる。

```
SELECT 
      d.department_id
    , MIN(d.department_name)
FROM employees e
INNER JOIN departments d
    ON e.department_id = d.department_id
GROUP BY d.department_id 
```

ただし、こちらは全行スキャンをしているため、パフォーマンスは低い。

department_name に対しても集約関数が必要になるため、完全に先の結果と一致するとは言えない

EXISTSの方は早期終了可能で、departmentを基準に動作しているため、department_name もそのまま使える。

まとめると

- EXISTSは全走して、行が1件でも見つかればアーリーリターンをしているイメージ
- 結合+集約は本当に全走をして、アーリーリターンをすることもないイメージ

どちらが高速であるかはあえて言うまでもない。

## 外部キーを使った存在しないチェック

社員がいない部署を取得している。
```
SELECT d.department_id, d.department_name
FROM departments d
WHERE NOT EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.department_id = d.department_id
);
```

これも、結合+集約でほぼ同じ表現ができる。

```
SELECT 
      d.department_id
    , MIN(d.department_name)
FROM
    departments d
LEFT JOIN 
    employees e
    ON d.department_id = e.department_id
WHERE
    e.employee_name IS NULL 
GROUP BY 
    d.department_id
```

LEFT JOIN で結合先がなかった場合NULLであることを利用している。

しかし、繰り返しになるが、この結合+集約も全走している。

(NOT) EXISTSを使うメリットは、存在する(しない)場合に効果が発動するため、1件でも見つかればTrue(False)でアーリーリターン可能である点にある。



## 相関サブクエリとの組み合わせ

```
-- 社員の中で、部長（manager_id を持つ社員）が存在する人だけ取得
SELECT e.employee_id, e.first_name, e.manager_id
FROM employees e
WHERE EXISTS (
    SELECT 1
    FROM employees m
    WHERE m.employee_id = e.manager_id
);
```

サブクエリの外で宣言されているeを行ごとに呼び出し、比較をしている。

これはINでも表現はできる。

```
SELECT 
    e.employee_id
    , e.first_name
    , e.manager_id
FROM 
    employees e
WHERE
    e.manager_id IN (
        SELECT m.employee_id
        FROM employees m
        WHERE m.employee_id IS NOT NULL
    );
```

これは相関サブクエリではないが、同様の結果が得られる。

相関サブクエリのINになる場合、パフォーマンスに問題が出る可能性がある。

## INとEXISTSのパフォーマンス上の違い

INとEXISTSでは、基本的にパフォーマンス上の違いはない。

しかし相関サブクエリ(サブクエリが呼び出し元の列を行ごとに参照している状況)では、アーリーリターンできる分、EXISTSの方が高速。

NOT IN の場合はリストの中にNULLが含まれると結果が何も得られなくなってしまうため、EXISTSの方が安全。


## 集計条件をサブクエリで指定する

```
-- 社員数が5人以上の部署だけ取得
SELECT d.department_id, d.department_name
FROM departments d
WHERE EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.department_id = d.department_id
    GROUP BY e.department_id
    HAVING COUNT(*) >= 5
);
```

これも相関サブクエリ。INで表現をした場合、非相関になる。


```
SELECT d.department_id, d.department_name
FROM departments d
WHERE d.department_id IN (
    SELECT e.department_id
    FROM employees e
    GROUP BY e.department_id
    HAVING COUNT(*) >= 5
);
```

この場合、INの方が1回しか評価されないためINのほうが高速になる可能性がある。

先のEXISTSはdepartmentの行ごとに表が作られ、更に集約までしまうため、ほぼ全走である。

たとえEXISTSがアーリーリターンが使えても、集約で全走状態になるため、INに劣る可能性がある。

まとめると。

- 集約ありの場合、非相関のIN
    - 【補足】 集約で全走しないといけないため、1回の評価で済む非相関サブクエリのほうが有利
- 集約なしの場合、相関のEXISTS
    - 【補足】 集約なしの場合、アーリーリターンが使える(全走しない)EXISTSが有利

ポイントは全走をしているかしていないか。全走する状態での相関サブクエリは遅い。



## 存在量化と全称量化

- 存在量化: 条件に一致する行が1件でもある (EXISTS)
- 全称量化: 全ての行はある条件に一致する (FORALL)

存在量化の否定は全称量化に値する。つまりNOT EXISTS = FORALL である。

NOT EXISTSを使えば、全ての行はある条件に一致するかを調べることができる。


```
-- 部署内の全員の給料が5000以上である、部署と社員を取り出す。

SELECT 
	e1.DEPARTMENT_ID
	, e1.FIRST_NAME
	, e1.SALARY
FROM EMPLOYEES e1
WHERE NOT EXISTS (
	SELECT 1
	FROM EMPLOYEES e2
	WHERE e1.DEPARTMENT_ID = e2.DEPARTMENT_ID 
	AND e2.SALARY < 5000
);

-- 部署内の全員の給料が5000以上である
-- = 給料5000未満のリスト には存在していない人を取り出す。
```
条件を否定し、さらにEXISTSも否定すれば、二重否定で肯定になる。

が、このSQLは非常に分かりづらい。

一見5000未満の給料を取り出しているように見えるが、NOT EXISTSにより5000以上になる。

しかも自己参照をしており、同一部署の全ての人が5000以上である場合に限定される。

NOT EXISTSを使えば、このような表現は可能ではあるが、可読性だけでなくパフォーマンスの観点から考えても、下記の集約+HAVINGでも成立はする。

```
-- 集約してHAVINGを使う方法の方がわかりやすい。

SELECT DEPARTMENT_ID
	, FIRST_NAME
	, SALARY
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
HAVING MIN(SALARY) >= 5000;
```

直感的に表現できるこちらのほうが良い。






