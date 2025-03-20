---
title: "UbuntuでC#の開発環境を整え、C#の基本構文をまとめる"
date: 2025-03-19T09:22:48+09:00
lastmod: 2025-03-19T09:22:48+09:00
draft: false
thumbnail: "images/csharp.jpg"
categories: [ "インフラ" ]
tags: [ "C#","Ubuntu" ]
---


## C#と.NET SDK のインストール

MSの公式リポジトリを追加しておく

```
sudo apt update
sudo apt install -y wget apt-transport-https
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```
.NET SDKをインストールする

```
sudo apt update
sudo apt install -y dotnet-sdk-8.0
```


## プロジェクトの作成

.NET ではCLIアプリの開発、WEBアプリの開発、ネイティブアプリの開発がすべて`dotnet new` コマンドで実現できるようになっている。


### CLIアプリの開発

```
dotnet new console -o MyApp
cd MyApp
dotnet run
```

HelloWorldが表示される。


### WEBアプリの開発

```
dotnet new webapp -o MyApp
cd MyApp
dotnet run
```

開発用サーバーが起動するので、URLをクリックしてブラウザで確認をする。

### ネイティブアプリの開発

Windows Forms アプリの開発ができる

```
dotnet new winforms -o MyWinFormsApp
cd MyWinFormsApp
dotnet run
```

ただし、Windows環境下でないと動かない。


### ネイティブアプリの開発(モダン)

WindowsForm よりもモダンなUI設計ができる

```
dotnet new wpf -o MyWpfApp
cd MyWpfApp
dotnet run
```

こちらも、Windows環境下でないと動かない。



### クロスプラットフォームのGUIアプリ

```
dotnet new maui
```


## 基本構文


### 変数の宣言

C#では、静的型付けなので、varを使って宣言をする。


```
var x = 10;

// エラー
// x = "aaa";
```

コンパイル時にデータ型が決まる。別のデータ型を入れるとエラー。

行末のセミコロンは必須。更に再宣言はできない

```
var x = 10;

var x = 20;
```

こう見ると、JavaScriptのlet のようだ。 スコープも、{} ブロックの範囲でのみ有効になっている。


### for ループ

```
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
        foreach (var num in numbers)  // Pythonの for in に相当
        {
            Console.WriteLine(num);
        }
    }
}
```


### if 文


```
using System;

class Program
{
    static void Main()
    {
        int x = 10;
        if (x > 5)
        {
            Console.WriteLine("xは5より大きい");
        }
        else
        {
            Console.WriteLine("xは5以下");
        }
    }
}
```

### 関数


```
using System;

class Program
{
    static int Add(int a, int b)  // Pythonのdefに相当
    {
        return a + b;
    }

    static void Main()
    {
        int result = Add(3, 4);
        Console.WriteLine(result);  // 7
    }
}
```

int Add() の int は 戻り値の型を指定している。引数にもデータ型の指定は必要。


### クラス文


```
using System;

class Person
{
    private string name;

    public Person(string name)  // コンストラクタ
    {
        this.name = name;
    }

    public string Greet()  // メソッド
    {
        return $"こんにちは、私は{name}です";
    }
}

class Program
{
    static void Main()
    {
        Person person = new Person("太郎");
        Console.WriteLine(person.Greet());
    }
}
```

クラス文と同じ名前でメソッドをつくると、コンストラクタとして機能する。

Pythonではクラス内オブジェクトはselfだったが、C#はJavaScriptなどと同じくthis を使用する。


## 質問コーナー

### 1: コーディングのエディタはどうする？

VScodeでOK

### 2: ライブラリをインストールした時、インストール先はどうなる？

各プロジェクト内に、ライブラリを保存することができる仮想環境が用意されている。

PythonのVirtualenvなどと違って、手動でアクティベートする必要はなく。むしろnpmのようにプロジェクトのフォルダ単位で分割されているので、そのままライブラリインストールすればOK。

### 3: ライブラリインストールのコマンドは？

例えば、JSONとオブジェクトの相互変換(シリアライズとデシリアライズ)をするライブラリ、Newtonsoft.Jsonをインストールするには

```
dotnet add package Newtonsoft.Json
```

とすれば良い。インストールされたパッケージは [プロジェクト名].csproj に書き込まれる。

```
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
  </ItemGroup>

</Project>
```


