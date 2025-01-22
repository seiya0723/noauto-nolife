---
title: "【Django】.getlist()でtype=\"checkbox\"のチェックの有無を調べる【複数人の権限の指定に有効】"
date: 2023-09-26T17:04:13+09:00
lastmod: 2023-09-26T17:04:13+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","tips" ]
---

## 背景


とあるプロジェクトを作るとして、複数人のユーザーが紐づくとする。

ユーザーごとに読み込み、書き込み、実行の権限を割り当てて行く必要がある。

これを1回のリクエストで送信するとき、どう実現させるべきか。


## 問題

.getlist() を使うことで、同じname属性の値をすべて取得することができる。

しかし、`type="checkbox"`の場合はその限りではない。

例えば、以下のようなフォームの場合。

```
<form method="POST">
    {% csrf_token %}
    <textarea class="form-control" name="comment"></textarea>

    <div>
        <label>読み: <input type="checkbox" name="read"></label>
        <label>書き: <input type="checkbox" name="write"></label>
        <label>実行: <input type="checkbox" name="exe"></label>
    </div>
    <div>
        <label>読み: <input type="checkbox" name="read"></label>
        <label>書き: <input type="checkbox" name="write"></label>
        <label>実行: <input type="checkbox" name="exe"></label>
    </div>
    <div>
        <label>読み: <input type="checkbox" name="read"></label>
        <label>書き: <input type="checkbox" name="write"></label>
        <label>実行: <input type="checkbox" name="exe"></label>
    </div>
    <div>
        <label>読み: <input type="checkbox" name="read"></label>
        <label>書き: <input type="checkbox" name="write"></label>
        <label>実行: <input type="checkbox" name="exe"></label>
    </div>

    <input type="submit" value="送信">
</form>

```

フロントでこのようにチェックして、

<div class="img-center"><img src="/images/Screenshot from 2023-09-26 17-06-11.png" alt=""></div>

ビューでgetlistで取得しても

```
    reads   = request.POST.getlist("read")
    writes  = request.POST.getlist("write")
    exes    = request.POST.getlist("exe")


    print(reads )
    print(writes)
    print(exes  )
```
このようにしか手に入れられない。

<div class="img-center"><img src="/images/Screenshot from 2023-09-26 17-09-00.png" alt=""></div>

これでは誰に何の権限が割り当てられているのかがわからない。

## 解決策

ユーザーごとに番号を与える。(type="hidden")

そして、その番号を各チェックボックスに含ませる。

```
        <form method="POST">
            {% csrf_token %}
            <textarea class="form-control" name="comment"></textarea>

            <div>
                <input type="hidden" name="authority" value="1">
                <label>読み: <input type="checkbox" name="read" value="1"></label>
                <label>書き: <input type="checkbox" name="write" value="1"></label>
                <label>実行: <input type="checkbox" name="exe" value="1"></label>
            </div>
            <div>
                <input type="hidden" name="authority" value="2">
                <label>読み: <input type="checkbox" name="read" value="2"></label>
                <label>書き: <input type="checkbox" name="write" value="2"></label>
                <label>実行: <input type="checkbox" name="exe" value="2"></label>
            </div>
            <div>
                <input type="hidden" name="authority" value="3">
                <label>読み: <input type="checkbox" name="read" value="3"></label>
                <label>書き: <input type="checkbox" name="write" value="3"></label>
                <label>実行: <input type="checkbox" name="exe" value="3"></label>
            </div>
            <div>
                <input type="hidden" name="authority" value="4">
                <label>読み: <input type="checkbox" name="read" value="4"></label>
                <label>書き: <input type="checkbox" name="write" value="4"></label>
                <label>実行: <input type="checkbox" name="exe" value="4"></label>
            </div>
            <input type="submit" value="送信">
        </form>
```

これをgetlistで取得すると、こうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-09-26 17-14-13.png" alt=""></div>

後は、name="authority" もgetlistで取得し、read write exe のgetlistにそれぞれ含んでいるかを調べると良いだろう。


```
    authorities = request.POST.getlist("authority")

    # チェックを入れた場合しか配列に含まれない。
    reads   = request.POST.getlist("read")
    writes  = request.POST.getlist("write")
    exes    = request.POST.getlist("exe")

    # ユーザーの番号をループさせる。
    for authority in authorities:

        dic             = {}
        dic["read"]     = False
        dic["write"]    = False
        dic["exe"]      = False

        # ユーザーの番号、読み込み権限許可のリストにあるか？
        if authority in reads:
            dic["read"]     = True

        # ユーザーの番号、書き込み権限許可のリストにあるか？
        if authority in writes:
            dic["write"]    = True

        # ユーザーの番号、実行権限許可のリストにあるか？
        if authority in exes:
            dic["exe"]      = True

        print(dic)
```

最終的に出力されるdicはこうなる。

<div class="img-center"><img src="/images/Screenshot from 2023-09-26 17-17-56.png" alt=""></div>

後はこれをバリデーションして保存すればよい。


## JavaScriptで動的にフォームを増やす

JavaScriptを使って、フォームを動的に追加する。番号も動的に与えていく。

```
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>簡易掲示板</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
</head>
<body>

    <main class="container">
        {# ここが投稿用フォーム #}
        <form method="POST">
            {% csrf_token %}

            {# ここにアクセス権フォームが追加されていく。 #}
            <div id="permission_form_area">
                <input id="permission_form_add" type="button" value="+ 追加">
            </div>


            <input type="submit" value="送信">
        </form>



        {# アクセス権フォームの雛形 #}
        <div id="permission_form_init_area" style="display:none;">
            <div class="permission_form">
                <input type="hidden" name="authority" value="1">
                <label>読み: <input type="checkbox" name="read" value="1"></label>
                <label>書き: <input type="checkbox" name="write" value="1"></label>
                <label>実行: <input type="checkbox" name="exe" value="1"></label>
            </div>
        </div>

    </main>


<script>
window.addEventListener("load" , () => {

    const permission_form_add       = document.querySelector("#permission_form_add");
    const permission_form_area      = document.querySelector("#permission_form_area");

    permission_form_add.addEventListener("click", () => {

        // 次に追加する permission_form の番号を作る。
        const value                     = permission_form_area.querySelectorAll(".permission_form").length + 1

        // permission_form をコピー。
        const permission_form_init_area = document.querySelector("#permission_form_init_area").children[0].cloneNode(true);

        // 各valueの値を書き換える。
        permission_form_init_area.querySelector("[name='read']").value      = value;
        permission_form_init_area.querySelector("[name='write']").value     = value;
        permission_form_init_area.querySelector("[name='exe']").value       = value;
        permission_form_init_area.querySelector("[name='authority']").value = value;

        // フォームに貼り付け
        permission_form_area.appendChild(permission_form_init_area);
    });

});
</script>

</body>
</html>
```

<div class="img-center"><img src="/images/Screenshot from 2023-09-26 18-13-45.png" alt=""></div>

## 結論

このように扱いやすいフォームを作るには、JavaScriptの力は不可欠である。


