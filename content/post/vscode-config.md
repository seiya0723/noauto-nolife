---
title: "VisualStudioCode(VScode)を使う前にやっておきたい設定と覚えておくと良い操作方法"
date: 2021-11-23T12:17:33+09:00
draft: false
thumbnail: "images/vscode.jpg"
categories: [ "others" ]
tags: [ "vscode","初心者向け","Laravel","PHP" ]
---

比較的メジャーなVisualStudioCode(以下VScode)も、やはり初期状態のままでは使いづらい。

本記事では本格的にコードを書く前にやっておきたい設定を列挙する。

## 文字サイズを変更する

まず文字サイズの変更。一番手っ取り早く文字を大きく表示させる方法として、VScode全体を拡大縮小することが有効。

VScodeのメニューバーから『表示』→『外観』→『拡大』もしくは『縮小』を選ぶ。もしくは、ショートカットキーのCtrl + Shift + -(ハイフン)で拡大、Ctrl + -(ハイフン)で縮小することができる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 14-13-47.png" alt="拡大と縮小"></div>

個別に文字サイズを変更したい場合は、『ファイル』→『ユーザー設定』→『設定』の検索欄からfont sizeなどで検索し、任意の数値を入れることで文字サイズを調整できる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 14-15-56.png" alt="個別の文字サイズ調整"></div>

## 日本語化

『View』→『Command Palette』を選択。Configure Display Languageを選ぶ。

『@category:"language packs"』で検索し、インストールした上で再起動する。これで日本語化される。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 15-08-57.png" alt=""></div>

また、コマンドパレットは Ctrl + Shift + P で起動できる。

## スニペットを登録して即コーディング

例えば、HTMLのコーディングで、いつも使うBootstrapやjQueryの読み込みをheadタグ内に書くのは面倒だと思うことは無いだろうか？

VScodeにはスニペット(定型文のこと)が登録できるようになっており、呼び出しの単語を書いてTabキーを押すだけで即コーディングができる。毎度毎度書くコードは予めここで登録しておきたい。

ここではBootstrapやjQuery等を読み込むHTMLの定型文を登録する方法を解説する。

まず、『ファイル』→『ユーザー設定』→『ユーザースニペット』を選ぶ。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 14-43-55.png" alt=""></div>

HTMLと打って、スニペットを登録する。すると、html.jsonが出てくる。これがスニペットの登録用jsonファイル。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 14-46-10.png" alt=""></div>

登録するスニペットは下記。

	"html": {
		"prefix": "htmldefault",
		"body": [
			"<!DOCTYPE html>",
			"<html lang=\"ja\">",
			"<head>",
			"\t<meta charset=\"UTF-8\">",
			"\t<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
			"\t<title>Hello World test!!</title>",
			"",
			"\t<link rel=\"stylesheet\" href=\"https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css\" integrity=\"sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh\" crossorigin=\"anonymous\">",
			"\t<link rel=\"stylesheet\" href=\"https://pro.fontawesome.com/releases/v5.10.0/css/all.css\" integrity=\"sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p\" crossorigin=\"anonymous\">",
			"",
			"\t<script src=\"https://code.jquery.com/jquery-3.4.1.min.js\"></script>",
			"",
			"\t<script src=\"https://cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.js\"></script>",
			"\t<script src=\"https://cdnjs.cloudflare.com/ajax/libs/vue-router/2.2.1/vue-router.js\"></script>",
			"",
			"\t<script src=\"script.js\"></script>",
			"\t<link rel=\"stylesheet\" href=\"style.css\">",
			"</head>",
			"<body>",
			"\t<p>Hello World !!</p>",
			"</body>",
			"</html>",
		]
	}

これを保存する。

最終的に、html.jsonがこうなる。外側の`{}`を忘れずに。


```
{
	// Place your snippets for html here. Each snippet is defined under a snippet name and has a prefix, body and 
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the 
	// same ids are connected.
	// Example:
	// "Print to console": {
	// 	"prefix": "log",
	// 	"body": [
	// 		"console.log('$1');",
	// 		"$2"
	// 	],
	// 	"description": "Log output to console"
	// }

	"html": {
		"prefix": "htmldefault",
		"body": [
			"<!DOCTYPE html>",
			"<html lang=\"ja\">",
			"<head>",
			"\t<meta charset=\"UTF-8\">",
			"\t<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
			"\t<title>Hello World test!!</title>",
			"",
			"\t<link rel=\"stylesheet\" href=\"https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css\" integrity=\"sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh\" crossorigin=\"anonymous\">",
			"\t<link rel=\"stylesheet\" href=\"https://pro.fontawesome.com/releases/v5.10.0/css/all.css\" integrity=\"sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p\" crossorigin=\"anonymous\">",
			"",
			"\t<script src=\"https://code.jquery.com/jquery-3.4.1.min.js\"></script>",
			"",
			"\t<script src=\"https://cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.js\"></script>",
			"\t<script src=\"https://cdnjs.cloudflare.com/ajax/libs/vue-router/2.2.1/vue-router.js\"></script>",
			"",
			"\t<script src=\"script.js\"></script>",
			"\t<link rel=\"stylesheet\" href=\"style.css\">",
			"</head>",
			"<body>",
			"\t<p>Hello World !!</p>",
			"</body>",
			"</html>",
		]
	}
}
```


	
続いて、適当なHTMLファイルを開く。HTMLファイル内で、先ほどのスニペットに指定した`prefix`の`htmld`まで書くと`htmldefault`が出てくる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 14-59-23.png" alt=""></div>

これを選ぶと、先ほどの`body`に指定したHTMLのコードが全部出てくる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-23 15-02-10.png" alt=""></div>

これはJavaScriptなどの長文のコードを書く必要のある言語で非常に有効。









