---
title: "Tempermonkeyを使ってGitHubのリポジトリ削除を簡単にする。"
date: 2022-10-16T18:18:20+09:00
draft: false
thumbnail: "images/js.jpg"
categories: [ "フロントサイド" ]
tags: [ "tempermonkey","JavaScript","jQuery","GitHub" ]
---


GitHubのリポジトリを作りすぎた。

順次消していこう。

そういう時、こういうダイアログが出てくる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-16 18-37-30.png" alt=""></div>

この確認の入力作業がめんどくさい。

確認するまでもなく、すぐにリポジトリを削除したい時、Tempermonkeyを使ってこの入力作業をスキップしていく。

## コード


```
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/[ここにGitHubのユーザー名を]/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    $(document).on("click", "details.flex-md-order-1 > summary:nth-child(1)", function() {

        let repo = $("details.flex-md-order-1 > details-dialog:nth-child(2) > div:nth-child(3) > p:nth-child(2) > strong:nth-child(1)").text();

        $("button.btn-danger:nth-child(4)").prop("disabled",false);
        $("details.flex-md-order-1 > details-dialog:nth-child(2) > div:nth-child(3) > form:nth-child(3) > p:nth-child(3) > input:nth-child(1)").val(repo);

    });

})();
```

後は、これを有効化させ、削除のボタンを押すと、こんなふうに、最初からリポジトリ名を入力された状態で削除ボタンが押せる

<div class="img-center"><img src="/images/Screenshot from 2022-10-16 18-41-23.png" alt=""></div>

これで、簡単にリポジトリが削除できるようになった。

## 結論

ご覧の通り、Tempermonkeyを使えば、任意のページで任意のスクリプトを動作させる事ができる。

jQueryなどのライブラリの使用もできるので、JavaScriptに自信のない人でも大丈夫。

ただ、念の為にも普段はこのスクリプトは無効化しておいたほうが良いだろう。うっかり大事なリポジトリを削除しかねないので。


