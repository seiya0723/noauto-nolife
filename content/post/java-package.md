---
title: "Javaのpackage(パッケージ)の実行方法"
date: 2024-01-17T14:28:00+09:00
lastmod: 2024-01-17T14:28:00+09:00
draft: false
thumbnail: "images/noimage.jpg"
categories: [ "サーバーサイド" ]
tags: [ "java","初心者向け","tips" ]
---


Javaのパッケージの実行方法でちょっと詰まったので、覚書としてまとめておく。

## 【例】ソースコードとディレクトリ構成

ディレクトリ構成は以下の通り、このとき、myprojectのディレクトリ名は任意とする。

```
myproject
├── vehicle
│   └── Car.java
└── main
    └── CarExec.java
```


Car.javaの内容はこちら


```
// vehicle/Car.java
package vehicle;

public class Car {
    private String model;

    public Car(String model) {
        this.model = model;
    }

    public void start() {
        System.out.println(model + " is starting.");
    }

    public void drive() {
        System.out.println(model + " is driving.");
    }
}
```

CarExec.javaの内容はこちら

```
// main/CarExec.java
package main;

import vehicle.Car;

public class CarExec {
    public static void main(String[] args) {
        // vehicle パッケージ内の Car クラスを使用
        Car myCar = new Car("Toyota");
        myCar.start();
        myCar.drive();
    }
}
```


## 実行方法

### javacコマンドで全てのjavaファイルをコンパイルする。

myprojectディレクトリにて、javacコマンドを実行する

```
javac ./*/*.java
```

.classファイルが作られる。


### javaコマンドで実行する

myprojectディレクトリにて、

```
java main.CarExec
```

を実行する。

このとき、mainディレクトリ内で

```
java CarExec
```

と実行しても動かない。このエラーが出る。

```
エラー: メイン・クラスCarExecを検出およびロードできませんでした
原因: java.lang.NoClassDefFoundError: main/CarExec (wrong name: CarExec)
```

## Javaのパッケージ実行時に注意すること

以上から次のことが言える。

- package に書いてあるパッケージ(ディレクトリ)に含まれているか？
- 影響する全てのjavaファイルはコンパイルされているか？
- 実行時は `java パッケージ.ファイル名` で

## 結論

以上から、javaのパッケージ実行時には注意を要する。

packageで指定しているパッケージ名に誤りはないか、コンパイルはされているか、実行するコマンドに間違いはないか。


