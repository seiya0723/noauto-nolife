---
title: "Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法"
date: 2020-10-24T17:22:29+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "web" ]
tags: [ "django","tips","初心者向け" ]
---


『このページを表示するにはフォームデータを再度送信する必要があります。フォームデータを再送信すると以前実行した検索、投稿や注文などの処理が繰り返されます。』 

POST文を実行した直後に更新ボタンを押すと、こんなふうに表示される時。こういうときはリダイレクトすればOK。

<div class="img-center"><img src="/images/Screenshot from 2020-10-24 17-30-27.png" alt="フォーム再送のダイアログ"></div>


## views.pyを修正する


redirectをimport。POST文のreturnにredirect関数を返せばいいだけ。

    from django.shortcuts import redirect


    #POST文のreturnがrenderになっている場合、redirectに書き換える。redirectの引数はurls.pyで定義したnameに準拠。
    #return render(request,"todo/index.html",context)
    return redirect("todo:index")


## 結論

原理的な話をすると、

POST文が実行される時、renderでレンダリングしてレスポンスを返す場合、POST文のレスポンスを返すことになる。POST文のレスポンスが返ってきたときに更新ボタンを押すとPOSTリクエストを再送することになる。POSTリクエストの再送にブラウザが警告のダイアログを表示させているわけ。

今回は、POSTリクエストにPOSTレスポンスを返すのではなく、任意のページにリダイレクトさせ、GETレスポンスを返している。

だから更新ボタンを押しても警告のダイアログは出ない。

