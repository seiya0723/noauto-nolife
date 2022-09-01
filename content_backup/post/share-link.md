---
title: "HUGOでSNS等のシェアリンク(シェアボタン)をブログ内に配置して、PVを増やす【Twitter、Facebook、はてなブログ、LINE】"
date: 2021-11-02T16:16:21+09:00
draft: false
thumbnail: "images/hugo.jpg"
categories: [ "フロントサイド" ]
tags: [ "hugo","tips","静的サイトジェネレーター" ]
---

HUGOでもシェアリンク(シェアボタン)を設置できる。HUGOのパラメータ変数を用意する必要があるので、慣れていないと難易度が高いが。


## ソースコード

記事単一表示ページにて下記のHTMLを書く

    <div class="article_share_area">
        <h2>シェアボタン</h2>
        <a class="article_share_link link_twitter" target="_blank" rel="nofollow noopener noreferrer" href="https://twitter.com/share?url={{ .URL | absURL }}&text={{ .Title }}">Twitter</a>
        <a class="article_share_link link_line" target="_blank" rel="nofollow noopener noreferrer" href="https://social-plugins.line.me/lineit/share?url={{ .URL | absURL }}">LINEで送る</a>
        <a class="article_share_link link_facebook" target="_blank" rel="nofollow noopener noreferrer" href="https://www.facebook.com/sharer/sharer.php?u={{ .URL | absURL }}">Facebook</a>
        <a class="article_share_link link_hatena" target="_blank" rel="nofollow noopener noreferrer" href="https://b.hatena.ne.jp/add?mode=confirm&url={{ .URL | absURL }}&title={{ .Title }}">はてなブログ</a>
    </div>

`{{ .URL }}`だけで終わってしまうと、相対リンクになってしまい、ドメインが表示されない。サイトのURLを表示させるには`{{ $.Site.BaseURL }}`が良いが、これと`{{ .URL }}`を組み合わせてしまうと`/`が重複してしまいURLとして解釈されなくなる。

そこで、`{{ .URL | absURL }}`とフィルタを指定してあげることで絶対リンクにさせて表示させる。

続いて、CSSを作る。

    .article_share_area {
        padding:0.5rem 0;
    }
    .article_share_link {
        display:inline-block;
        border:solid 0.2rem white;
        border-radius:0.5rem;
        padding:0.25rem;
        margin:0.2rem;
        color:white;
        font-weight:bold;
    }
    .link_twitter {
        border-color:#1DA1F2;
        background:#1DA1F2;
        transition:0.2s;
    }
    .link_line {
        border-color:#00B900;
        background:#00B900;
        transition:0.2s;
    }
    .link_facebook {
        border-color:#1DA1F2;
        background:#1DA1F2;
        transition:0.2s;
    }
    .link_hatena {
        border-color:#5279E7;
        background:#5279E7;
        transition:0.2s;
    }
    .link_twitter:hover {
        color:#1DA1F2;
        background:white;
        transition:0.2s;
    }
    .link_line:hover {
        color:#00B900;
        background:white;
        transition:0.2s;
    }
    .link_facebook:hover {
        color:#1DA1F2;
        background:white;
        transition:0.2s;
    }
    .link_hatena:hover {
        color:#5279E7;
        background:white;
        transition:0.2s;
    }

ホバーしたときの挙動も書く。これだけで良い。

## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-11-22 16-17-27.png" alt=""></div>

後はシェアされるのを待つだけ。

