---
title: "【C＃】LINQのメソッドのまとめ"
date: 2025-04-19T17:43:59+09:00
lastmod: 2025-04-19T17:43:59+09:00
draft: false
thumbnail: "images/csharp.jpg"
categories: [ "サーバーサイド" ]
tags: [ "C＃",".NET","LINQ" ]
---


## LINQ の概要と前提情報

LINQ はコレクションに対して宣言的にクエリを書くためのしくみである。

コレクションとはイテラブルな要素のことであり、配列や辞書、リストが当てはまる。

C#の配列は固定長であり、リストは可変長。リストの方には別途メソッドが豊富に用意されている。配列は固定長なので、Pythonのタプルに近いだろう。

辞書はキーを指定して値を取り出す。


## 基本のWhereとToList

```
class Student {
    public string Name;
    public int Age;
    public int Grade;
}

var students = new List<Student> {
    new Student { Name = "太郎", Age = 20, Grade = 1 },
    new Student { Name = "花子", Age = 19, Grade = 2 },
    new Student { Name = "次郎", Age = 22, Grade = 4 },
};

var results = students
    .Where(x => x.Age >= 20)
    .ToList();
```

Where文は条件を指定して絞り込みをすることができる。

### ToList()は必要か？

`.ToList()` を実行しない場合はWhere文は即時実行されない。遅延評価になる。

また、後述の1件だけ取り出す場合は不要。

## 1件だけ取り出す、SingleとFirst 

1件だけ取り出す場合も Single, SingleOrDefault, First, FirstOrDefault, の4つがある。

|メソッド|条件|戻り値|例外が出る条件|
|----|----|----|----|
|`.Single()`|条件に一致する要素が**ちょうど1つ**|一致したその要素|一致が**0個または2個以上**|
|`.SingleOrDefault()`|同上+一致がなければ`null`(またはdefault)|一致が1つ→その要素、0個→`null`(ordefault)|一致が**2個以上**|
|`.First()`|条件に一致する**最初の1つ**|一致したその要素|一致が**0個**|
|`.FirstOrDefault()`|同上+一致がなければ`null`(またはdefault)|一致が1つ以上→最初の要素、0個→`null`(ordefault)|例外は出ない|

Single は取り出したい要素が1件であるという前提で使う。つまり、主キーで指定をする場合に有効だ。

First は 配列の中の先頭の1件を取り出す。並び替えをして最新のデータを取り出したい場合などに有効だ。

Defaultがあると、0件の場合は許容すると覚えたほうが良いだろう。

```
class Student {
    public string Name;
    public int Age;
    public int Grade;
}

var students = new List<Student> {
    new Student { Name = "太郎", Age = 20, Grade = 1 },
    new Student { Name = "花子", Age = 19, Grade = 2 },
    new Student { Name = "次郎", Age = 22, Grade = 4 },
};

// ↓ 2件出てくるのでエラー
var result = students
    .Where(x => x.Age >= 20)
    .Single();

// ↓ 太郎が出る。
var result = students
    .Where(x => x.Age >= 20)
    .First();
```


## 並び替える OrderBy OrderByDescending

```
// 最年少
var youngest = students.OrderBy(x => x.Age).First();

// 最年長
var oldest = students.OrderByDescending(x => x.Age).First();
```

先のFirstと組み合わせて1件分のデータを取り出す。

ただし、1件もデータがない場合は例外が出る。例外を出さないようにするには、以下のようにする。

```
// 最年少
var youngest = students.OrderBy(x => x.Age).FirstOrDefault();

// 最年長
var oldest = students.OrderByDescending(x => x.Age).FirstOrDefault();
```

ちなみに、Last 及び LastOrDefaultもあるので これを使えばOrderByDescending を使わなくても済む。

```
// 最年長
var oldest = students.OrderBy(x => x.Age).Last();

// 最年長 (データ0件でも例外なし。)
var oldest = students.OrderBy(x => x.Age).LastOrDefault();
```

## 更に続けて並び替える ThenBy ThenByDescending

OrderBy OrderByDescending だけでは1つしか並び替えできない、複数の要素で並び替えをするには、ThenBy ThenByDescending

```
class Student {
    public string Name;
    public int Age;
    public int Grade;
}

var students = new List<Student> {
    new Student { Name = "太郎", Age = 20, Grade = 1 },
    new Student { Name = "花子", Age = 19, Grade = 2 },
    new Student { Name = "三郎", Age = 19, Grade = 3 },
    new Student { Name = "四郎", Age = 19, Grade = 4 },
    new Student { Name = "次郎", Age = 22, Grade = 4 },
};

// 最初に年齢の昇順、次に学年の昇順で並び替えている。
var results = students
    .OrderBy(x => x.Age)
    .ThenBy(x => x.Grade)
    .ToList()

/*
    ↓ この順になる。
    new Student { Name = "花子", Age = 19, Grade = 2 },
    new Student { Name = "三郎", Age = 19, Grade = 3 },
    new Student { Name = "四郎", Age = 19, Grade = 4 },
    new Student { Name = "太郎", Age = 20, Grade = 1 },
    new Student { Name = "次郎", Age = 22, Grade = 4 },
*/
```


## 数をカウントする Count

以下で成人している人の数を数える。

```
var counts = students
    .Where(x => x.Age >= 20)
    .Count()
```
Countは即時実行されるようになっている。

ただ、先のコードは以下のように短縮できる。

```
var counts = students
    .Count(x => x.Age >= 20)
```

## 1つのWhere文で複数条件を追加する。 && と || 

```
class Student {
    public string Name;
    public int Age;
    public int Grade;
}

var students = new List<Student> {
    new Student { Name = "太郎", Age = 20, Grade = 1 },
    new Student { Name = "花子", Age = 19, Grade = 2 },
    new Student { Name = "三郎", Age = 19, Grade = 3 },
    new Student { Name = "四郎", Age = 19, Grade = 4 },
    new Student { Name = "次郎", Age = 22, Grade = 4 },
};

// 20歳未満で4年の人
var result = students
    .Where(x => x.Age < 20 && x.Grade == 4)
    .ToList()
```

.Where 文をチェーンにするよりもシンプルに済む。


複雑になる場合は() を使ってグループ化しておく。

```
.Where(x =>
    (x.Age >= 20 && x.Grade >= 2) ||
    (x.Name == "太郎")
)
```



## 条件を満たせばブーリアン値を返す AnyとAll

条件を満たす要素が存在する場合は Any 、 すべての条件を満たしている場合は All

## 2つのコレクションを結合する Join 






