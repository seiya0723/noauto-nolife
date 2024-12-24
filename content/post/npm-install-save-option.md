---
title: "npm install --save パッケージ名 の--saveは必要か？"
date: 2024-12-23T16:49:13+09:00
lastmod: 2024-12-23T16:49:13+09:00
draft: false
thumbnail: "images/npm.jpg"
categories: [ "フロントサイド" ]
tags: [ "npm","react","tips" ]
---


```
npm install --save パッケージ名
```

この--saveで、package.jsonにパッケージ名を記録することができる。

ただし、--saveオプションは、npmのバージョン5からデフォルトで有効になっている。

故に、npmバージョン5で、特に設定を触っていない場合は、あえてつける必要はない。

```
npm install パッケージ名
```

でよい。

よって、タイトルの`npm install --save パッケージ名 の--saveは必要か？` はnpmバージョン5以降では、不要。

BootstrapやFontawesomeなどのReact向けドキュメントで --save があるが、現行バージョンのnpmをインストールしている場合は、もう無視して良い。
