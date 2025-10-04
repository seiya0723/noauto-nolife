---
title: "Oracleデータベース演習"
date: 2025-08-31T10:59:41+09:00
lastmod: 2025-08-31T10:59:41+09:00
draft: false
thumbnail: "images/oracle.jpg"
categories: [ "サーバーサイド" ]
tags: [ "SQL","Oracle","データベース" ]
---


## 結合と集約をセットで扱う

```
SELECT 
	E.JOB_ID,
	SUM(E.SALARY) AS SUM_SALARY ,
	AVG(E.SALARY) AS AVG_SALARY,
	J.JOB_TITLE
FROM EMPLOYEES E
INNER JOIN JOBS J
	ON J.JOB_ID = E.JOB_ID
GROUP BY E.JOB_ID , J.JOB_TITLE;
```
<div class="img-center"><img src="/images/Screenshot from 2025-08-31 11-05-18.png" alt=""></div>

### 補足1: OracleではテーブルにはASを使ってはいけない。

PostgreSQLやMySQL、SQLiteでは列のエイリアスに使うASを、テーブルにも使える。

よって、以下SQLは有効。

```
SELECT 
	E.JOB_ID,
	SUM(E.SALARY) AS SUM_SALARY ,
	AVG(E.SALARY) AS AVG_SALARY,
	J.JOB_TITLE
FROM EMPLOYEES AS E
INNER JOIN JOBS AS J
	ON J.JOB_ID = E.JOB_ID
GROUP BY E.JOB_ID , J.JOB_TITLE;
```

しかし、Oracleにおいては、テーブルのエイリアスにASを使ってはいけない。

よって、**テーブルのエイリアスにはASをつけず、列のエイリアスにはASをつける** 

これを徹底することで、Oracleと他DBでの互換性が保てる。

### 補足3: 先に集約を済ませてから結合をする(サブクエリ)

サブクエリを使用することで、先に集約を済ませてから結合することもできる。

Oracleにはオプティマイザが用意されているため、本項の書き方をしなくても処理速度に違いはない。(オプティマイザがシンプルなMySQLや、最小限しか無いSQLiteであれば有効)

```
SELECT 
	T.JOB_ID,
	T.TOTAL_SALARY ,
	T.AVG_SALARY,
	J.JOB_TITLE
FROM (
    SELECT 
        JOB_ID,
        SUM(SALARY) AS TOTAL_SALARY ,
        AVG(SALARY) AS AVG_SALARY,
    FROM EMPLOYEES
    GROUP BY JOB_ID
) T
INNER JOIN JOBS J
    ON J.JOB_ID = T.JOB_ID;
```

従業員数が非常に多い場合、この書き方のほうが高速ではある。


## 集約で重複している電話番号を調べる

電話番号が間違えて重複して登録されているか調べている。

```
SELECT PHONE_NUMBER, COUNT(*) AS CNT
FROM EMPLOYEES
GROUP BY PHONE_NUMBER
HAVING COUNT(*) > 1;
```

PHONE_NUMBER で集約をして、集約後条件のHAVINGを使えば2件以上の電話番号を取り出すことができる。

### 補足1: 実際に重複しているデータを取り出す

サブクエリとINを使うことで実際に重複しているデータを取り出せる。

```
SELECT *
FROM EMPLOYEES
WHERE PHONE_NUMBER IN 
( SELECT PHONE_NUMBER
FROM EMPLOYEES 
GROUP BY PHONE_NUMBER
HAVING COUNT(*) > 1 );
```

<div class="img-center"><img src="/images/Screenshot from 2025-08-31 13-44-04.png" alt=""></div>


### 補足2: 実際に重複しているデータを取り出す(EXISTSで効率的に)

前項の補足1では、INとサブクエリ、集約を使って重複しているデータを取り出した。

しかし、重複件数が多いと遅い場合もある。そこでEXISTSを使う。存在するか否かで判断できるため、パフォーマンスが良い。

```
SELECT E1.*
FROM EMPLOYEES E1
WHERE EXISTS
( SELECT 1
FROM EMPLOYEES E2
WHERE E1.PHONE_NUMBER = E2.PHONE_NUMBER 
AND E1.EMPLOYEE_ID <> E2.EMPLOYEE_ID );
```

E1のテーブル内から、サブクエリでヒットした行をそのまま表示している。

## 自己結合で組み合わせを調べる

自己結合の用途

- 重複したデータの確認
- 予約が重なっているかの確認
- 商品や組み合わせの確認

```
SELECT E1.*
FROM EMPLOYEES E1
INNER JOIN EMPLOYEES E2 
	ON E1.PHONE_NUMBER = E2.PHONE_NUMBER
	AND E1.EMPLOYEE_ID <> E2.EMPLOYEE_ID;
```

このSQLでも電話番号が重複していないか調べることができる。

先程の集約やサブクエリ、INやEXISTSを使う方法よりも遥かにシンプルだ。

<div class="img-center"><img src="/images/Screenshot from 2025-08-31 12-02-52.png" alt=""></div>



### 補足1: クロス結合は注意

例えば、以下のような、無条件ですべての組み合わせを列挙するSQLの場合。

```
SELECT E1.FIRST_NAME, E2.FIRST_NAME
FROM EMPLOYEES E1
CROSS JOIN EMPLOYEES E2 ;
```

N^2 通りのデータが出力される。条件が特に不要であればこのCROSS JOINでも良い。

だが、数万件単位のテーブルに対して実行するとDBのリソースを消耗してしまうため注意。

特に、INNER JOIN では条件を書き忘れるとエラーで終わってくれるが、CROSS JOINはそのまま実行されてしまう。可能であれば使わないほうが良いだろう。


### 補足2: 重複チェックで、自己結合と集約+サブクエリではどちらが良いのか？

- テーブルサイズが大きい場合: 集約+サブクエリ
- テーブルサイズが小さい場合: 自己結合

自己結合は、自分自身のデータとの比較を繰り返すことになる。よってテーブルサイズが大きければ大きいほど、その処理時間は増えていく。(※処理数はN^2回)

一方で集約を使って重複行を取り出し、比較をする方法の場合。チェックをするテーブルサイズが大きかったとしても処理速度に影響は自己結合ほどではない。

自己結合は直感的でわかりやすい反面、処理速度の問題がある。

集約+サブクエリはテーブルサイズによる処理速度の影響は少ないものの、可読性に難あり。

状況に応じて使い分ける必要がある。


## 自己参照外部キーを使った結合

EMPLOYEE テーブルの MANAGER_ID はEMPLOYEE_IDと紐付いている。

この自己参照外部キーを使った自己結合で部下と上司を並べて表示できる。

```
SELECT E1.EMPLOYEE_ID , E1.FIRST_NAME , E1.LAST_NAME  , E2.FIRST_NAME AS MANAGER_FIRST , E2.LAST_NAME AS MANAGER_LAST 
FROM EMPLOYEES E1
LEFT JOIN EMPLOYEES E2 ON E1.MANAGER_ID = E2.EMPLOYEE_ID
ORDER BY E1.EMPLOYEE_ID ;
```

<div class="img-center"><img src="/images/Screenshot from 2025-08-31 14-38-08.png" alt=""></div>



## EMPLOYEE テーブルを基本としてLEFT JOINで多重結合

<div class="img-center"><img src="/images/Screenshot from 2025-08-31 13-20-52.png" alt=""></div>

```
SELECT E.FIRST_NAME , E.LAST_NAME, J.JOB_TITLE, D.DEPARTMENT_NAME, R.REGION_NAME, C.COUNTRY_NAME, L.STATE_PROVINCE
FROM EMPLOYEES E
LEFT JOIN DEPARTMENTS D ON E.DEPARTMENT_ID = D.DEPARTMENT_ID
LEFT JOIN JOBS J ON E.JOB_ID = J.JOB_ID
LEFT JOIN LOCATIONS L ON D.LOCATION_ID  = L.LOCATION_ID
LEFT JOIN COUNTRIES C ON L.COUNTRY_ID = C.COUNTRY_ID
LEFT JOIN REGIONS R ON C.REGION_ID  = R.REGION_ID;
```

```

FIRST_NAME |LAST_NAME  |JOB_TITLE                      |DEPARTMENT_NAME |REGION_NAME|COUNTRY_NAME                                        |STATE_PROVINCE|
-----------+-----------+-------------------------------+----------------+-----------+----------------------------------------------------+--------------+
Alexander  |James      |Programmer                     |IT              |Americas   |United States of America                            |Texas         |
Bruce      |Miller     |Programmer                     |IT              |Americas   |United States of America                            |Texas         |
David      |Williams   |Programmer                     |IT              |Americas   |United States of America                            |Texas         |
Valli      |Jackson    |Programmer                     |IT              |Americas   |United States of America                            |Texas         |
Diana      |Nguyen     |Programmer                     |IT              |Americas   |United States of America                            |Texas         |
Matthew    |Weiss      |Stock Manager                  |Shipping        |Americas   |United States of America                            |California    |
Adam       |Fripp      |Stock Manager                  |Shipping        |Americas   |United States of America                            |California    |
Payam      |Kaufling   |Stock Manager                  |Shipping        |Americas   |United States of America                            |California    |
Shanta     |Vollman    |Stock Manager                  |Shipping        |Americas   |United States of America                            |California    |
Kevin      |Mourgos    |Stock Manager                  |Shipping        |Americas   |United States of America                            |California    |
Julia      |Nayer      |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Irene      |Mikkilineni|Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
James      |Landry     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Steven     |Markle     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Laura      |Bissot     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Mozhe      |Atkinson   |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
James      |Marlow     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
TJ         |Olson      |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Jason      |Mallin     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Michael    |Rogers     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Ki         |Gee        |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Hazel      |Philtanker |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Renske     |Ladwig     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Stephen    |Stiles     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
John       |Seo        |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Joshua     |Patel      |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Trenna     |Rajs       |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Curtis     |Davies     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Randall    |Matos      |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Peter      |Vargas     |Stock Clerk                    |Shipping        |Americas   |United States of America                            |California    |
Winston    |Taylor     |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Jean       |Fleaur     |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Martha     |Sullivan   |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Girard     |Geoni      |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Nandita    |Sarchand   |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Alexis     |Bull       |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Julia      |Dellinger  |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Anthony    |Cabrio     |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Kelly      |Chung      |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Jennifer   |Dilly      |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Timothy    |Venzl      |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Randall    |Perkins    |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Sarah      |Bell       |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Britney    |Everett    |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Samuel     |McLeod     |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Vance      |Jones      |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Alana      |Walsh      |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Kevin      |Feeney     |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Donald     |OConnell   |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Douglas    |Grant      |Shipping Clerk                 |Shipping        |Americas   |United States of America                            |California    |
Jennifer   |Whalen     |Administration Assistant       |Administration  |Americas   |United States of America                            |Washington    |
Den        |Li         |Purchasing Manager             |Purchasing      |Americas   |United States of America                            |Washington    |
Alexander  |Khoo       |Purchasing Clerk               |Purchasing      |Americas   |United States of America                            |Washington    |
Shelli     |Baida      |Purchasing Clerk               |Purchasing      |Americas   |United States of America                            |Washington    |
Sigal      |Tobias     |Purchasing Clerk               |Purchasing      |Americas   |United States of America                            |Washington    |
Guy        |Himuro     |Purchasing Clerk               |Purchasing      |Americas   |United States of America                            |Washington    |
Karen      |Colmenares |Purchasing Clerk               |Purchasing      |Americas   |United States of America                            |Washington    |
Steven     |King       |President                      |Executive       |Americas   |United States of America                            |Washington    |
Neena      |Yang       |Administration Vice President  |Executive       |Americas   |United States of America                            |Washington    |
Lex        |Garcia     |Administration Vice President  |Executive       |Americas   |United States of America                            |Washington    |
Nancy      |Gruenberg  |Finance Manager                |Finance         |Americas   |United States of America                            |Washington    |
Daniel     |Faviet     |Accountant                     |Finance         |Americas   |United States of America                            |Washington    |
John       |Chen       |Accountant                     |Finance         |Americas   |United States of America                            |Washington    |
Ismael     |Sciarra    |Accountant                     |Finance         |Americas   |United States of America                            |Washington    |
Jose Manuel|Urman      |Accountant                     |Finance         |Americas   |United States of America                            |Washington    |
Luis       |Popp       |Accountant                     |Finance         |Americas   |United States of America                            |Washington    |
Shelley    |Higgins    |Accounting Manager             |Accounting      |Americas   |United States of America                            |Washington    |
William    |Gietz      |Public Accountant              |Accounting      |Americas   |United States of America                            |Washington    |
Michael    |Martinez   |Marketing Manager              |Marketing       |Americas   |Canada                                              |Ontario       |
Pat        |Davis      |Marketing Representative       |Marketing       |Americas   |Canada                                              |Ontario       |
Susan      |Jacobs     |Human Resources Representative |Human Resources |Europe     |United Kingdom of Great Britain and Northern Ireland|              |
John       |Singh      |Sales Manager                  |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Karen      |Partners   |Sales Manager                  |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Alberto    |Errazuriz  |Sales Manager                  |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Gerald     |Cambrault  |Sales Manager                  |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Eleni      |Zlotkey    |Sales Manager                  |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Sean       |Tucker     |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
David      |Bernstein  |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Peter      |Hall       |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Christopher|Olsen      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Nanette    |Cambrault  |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Oliver     |Tuvault    |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Janette    |King       |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Patrick    |Sully      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Allan      |McEwen     |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Lindsey    |Smith      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Louise     |Doran      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Sarath     |Sewall     |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Clara      |Vishney    |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Danielle   |Greene     |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Mattea     |Marvins    |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
David      |Lee        |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Sundar     |Ande       |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Amit       |Banda      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Lisa       |Ozer       |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Harrison   |Bloom      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Tayler     |Fox        |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
William    |Smith      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Elizabeth  |Bates      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Sundita    |Kumar      |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Ellen      |Abel       |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Alyssa     |Hutton     |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Jonathon   |Taylor     |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Jack       |Livingston |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Charles    |Johnson    |Sales Representative           |Sales           |Europe     |United Kingdom of Great Britain and Northern Ireland|Oxford        |
Hermann    |Brown      |Public Relations Representative|Public Relations|Europe     |Germany                                             |Bavaria       |
Kimberely  |Grant      |Sales Representative           |                |           |                                                    |              |
```

このようにEMPLOYEEの外部キーがNULLの場合も表示させたい場合は、LEFT JOIN を使う


## NULL を扱うときには = NULL ではなく、IS NULL

NULLは値でも変数でもない。そのため、以下のように比較演算子を使ったSQLは正常に機能しない。(unknownになるため何も出てこない。) 

```
SELECT * FROM EMPLOYEES
WHERE MANAGER_ID = NULL;
```

<div class="img-center"><img src="/images/Screenshot from 2025-08-31 15-08-08.png" alt=""></div>

もしNULLであるか否かを判定したいのであればIS、IS NOTを使う。

```
SELECT * FROM EMPLOYEES
WHERE MANAGER_ID IS NULL;
```

<div class="img-center"><img src="/images/Screenshot from 2025-08-31 15-08-34.png" alt=""></div>

ちなみに不一致である比較演算子の <> も正常に動作しない。

```
SELECT * FROM EMPLOYEES
WHERE MANAGER_ID <> NULL;
```

一般的なプログラミング言語では、NULLは値であるためこれらの比較演算子が有効ではあるが、SQLでは値ですらない。

NULLにIS,IS NOT以外使用できないため注意。

また、以下のSQLは一見全行が取得できるように思えるが、NULLである行は除外されている。

```
SELECT * FROM EMPLOYEES
WHERE MANAGER_ID = 100 OR MANAGER_ID <> 100 ;
```

<div class="img-center"><img src="/images/Screenshot from 2025-08-31 15-18-34.png" alt=""></div>

## 【NULL対策】NOT INは安易に使わない

INを使うことで、集合に当てはまる場合はTRUEになる。

```
WHERE x IN (1, 2, NULL)
```

このように集合の中にNULLが含まれていたとしても、その部分は評価されないので問題はない。

しかし、NOT INは使うべきではない。

```
WHERE x NOT IN (1, 2, NULL)
```

このWHERE 条件式は 「x ≠ 1 AND x ≠ 2 AND x ≠ NULL」と解釈される。

NULL はunknownを返すため、  x ≠ NULL 式全体が unknownになり、結果が全て帰らなくなってしまう。


### 【補足1】IN句は仮にxがNULLだった場合は、xの行だけ含まれない。

```
WHERE x IN (1, 2)
```

この場合でxがNULL だった場合、集合にNULLが含まれていてもいなくても、その行は返されない。

```
WHERE x IN (1, 2, NULL)
```

この場合でもxがNULLだったらその行は返らない。


### 【補足2】 NOT INを使うならサブクエリ側にNULL対策を、もしくはNOT EXISTSを使おう。

もし、 NOT IN を使う場合は集合側(サブクエリ側)でNULLを排除した上で比較をする。

```
WHERE x NOT IN (1, 2)
```

あるいは、NOT EXISTSを使う。NOT EXISTS は集合の中にNULLが含まれていたとしても正常に動作する。


```
WHERE NOT EXISTS (
    SELECT 1 FROM t WHERE t.col = x
)
```

NOT EXISTS は NOT IN とは異なる使用感。自分自身の集合の中から一致しないものを取り出すというイメージで。

## CASE 文で SQL内で条件分岐をする

CASE文で条件分岐ができる。その使い方は完全一致型と比較型で構文が異なる。


完全一致型はこちら。CASEのあとに列名を書く。WHENのあとに値を書く。

```
--完全一致型のCASE文
SELECT CITY ,
CASE COUNTRY_ID
	WHEN 'JP' THEN '国内'
	ELSE '海外'
END AS COUNTRY_TYPE
FROM LOCATIONS L
```

<div class="img-center"><img src="/images/Screenshot from 2025-09-15 11-25-49.png" alt=""></div>

比較型はこちら。CASEのあとに列名を書かず、WHENのあとに条件式を書く。

```
-- 条件型のCASE文
SELECT FIRST_NAME,
CASE
	WHEN SALARY >= 10000 THEN '高給'
 	ELSE '低給'
END AS SALARY_LEVEL
FROM EMPLOYEES E;
```

この比較型の条件式の場合、複数条件を設定することができる。
<div class="img-center"><img src="/images/Screenshot from 2025-09-15 11-25-55.png" alt=""></div>


### 【補足1】集約をした上でCASE文を使う。

```
-- 部署ごとに集約し、給与の平均を出す。
SELECT 
	MIN(D.DEPARTMENT_NAME) AS 部署名,
	AVG(E.SALARY) AS 平均給与,
	CASE 
		WHEN AVG(E.SALARY) >= 8000 THEN 'A' 
		WHEN AVG(E.SALARY) >= 5000 THEN 'B'
		ELSE 'C'
	END AS 給与ランク	
FROM EMPLOYEES E
INNER JOIN DEPARTMENTS D
ON E.DEPARTMENT_ID = D.DEPARTMENT_ID
GROUP BY E.DEPARTMENT_ID;
```

一見、AVG関数が何度も使われているため冗長で、低速のように見える。

だが、1度計算したものは何度も使い回されるためパフォーマンス上の問題は特にない。

<div class="img-center"><img src="/images/Screenshot from 2025-09-15 11-24-29.png" alt=""></div>


<!--
<div class="img-center"><img src="" alt=""></div>
<div class="img-center"><img src="" alt=""></div>
<div class="img-center"><img src="" alt=""></div>
<div class="img-center"><img src="" alt=""></div>

-->



