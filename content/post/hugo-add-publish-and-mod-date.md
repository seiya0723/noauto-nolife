---
title: "【HUGO】作成日時と最終更新日時を表示させる【SEO対策】"
date: 2022-10-29T14:48:28+09:00
lastmod: 2022-10-29T14:48:28+09:00
draft: false
thumbnail: "images/hugo.jpg"
categories: [ "others" ]
tags: [ "hugo","tips","SEO対策" ]
---


SEO対策として、記事の更新日を記録することにした。

これまでは作成日時と最終更新日時が兼ねられていたが、これにより、いつ更新したかがひと目でわかるようになるだろう。


## 前提

このギミックが動作するHUGOのバージョン。

ローカルでのバージョン

    Hugo Static Site Generator v0.68.3/extended linux/amd64 BuildDate: 2020-03-25T06:15:45Z

デプロイ先のNetlifyのHUGOのバージョン

    hugo v0.85.0-724D5DB5+extended linux/amd64 BuildDate=2021-07-05T10:46:28Z VendorInfo=gohugoio


## 記事ヘッダーにlastmodを追加する

記事ヘッダーにこのようにlastmodを追加する。

    ---
    title: "【HUGO】作成日時と最終更新日時を表示させる【SEO対策】"
    date: 2022-10-29T14:48:28+09:00
    lastmod: 2022-10-29T14:48:28+09:00
    draft: false
    thumbnail: "images/hugo.jpg"
    categories: [ "others" ]
    tags: [ "hugo","tips","SEO対策" ]
    ---

## テーマに作成日時と最終更新日時を表示させる。

テーマの任意の場所に作成日時と最終更新日時を表示させる。

    <li>作成日時: <time datetime="{{ .PublishDate.Format "2006-01-02T15:04:05JST" }}">{{ .PublishDate.Format ( .Site.Params.dateformat | default "2006年1月2日 15時04分") }}</time></li>
    <li>最終更新日時: <time datetime="{{ .Lastmod.Format "2006-01-02T15:04:05JST" }}">{{ .Lastmod.Format ( .Site.Params.dateformat | default "2006年1月2日 15時04分") }}</time></li>

`themes/beg/layouts/_default/li.html`と`themes/beg/layouts/_default/summary.html`に書き換えを施した。


## 動かすとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2022-10-29 15-02-42.png" alt=""></div>

## archetypes/default.mdを書き換える

これで次に記事を作成するときには、lastmodが最初からある。記事を更新したらこの部分を書き換えればよい。

    ---
    title: "{{ replace .Name "-" " " | title }}"
    date: {{ .Date }}
    lastmod: {{ .Date }}
    draft: false
    thumbnail: "images/noimage.jpg"
    categories: [ "others" ]
    tags: [ "","","" ]
    ---
 

ちなみに、lastmodが無い場合、dateを参照してくれるので、無くてもエラーにはならない。

## 結論

後は`meta`タグの`og:updated_time`に更新日時を記録させると良いだろう。

検索のロボットが最終更新日時を把握して、検索時に○日前と表示してくれるはずだ。

## 参照元

- https://gohugo.io/functions/format/
- https://discourse.gohugo.io/t/update-date-for-a-blog-post/8041

