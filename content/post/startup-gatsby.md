---
title: "Reactベースの静的サイトジェネレーターGatsbyを使う"
date: 2024-11-13T13:26:02+09:00
lastmod: 2024-11-13T13:26:02+09:00
draft: false
thumbnail: "images/gatsby.jpg"
categories: [ "フロントサイド" ]
tags: [ "追記予定","静的サイトジェネレーター","React" ]
---

React学習のため、とりわけ扱いやすいGatsbyを使うことにした。

学習完了次第。このサイトは、HUGOからGatsbyに移行する予定。

本記事では、Gatsbyを調べてわかったことをまとめる。学習の都度まとめているため、誤りが含まれる可能性がある点をご了承いただきたい。

## 実装方法

Ubuntu 22.04 LTS 環境下で動作させている。

```
sudo npm install -g gatsby-cli
```

まず、グローバル環境下でGatsbyをインストールする。

これでGatsbyコマンドが使えるようになる。

## Gatsbyコマンド

### サイトをつくる

```
gatsby new your-site-name https://github.com/gatsbyjs/gatsby-starter-blog
```

リポジトリからテーマを取得、サイトを作っている。

### 開発用サーバーを起動する

```
gatsby develop
```

ローカルホストの8000番ポートで起動する。

## 全体構成
 
- srcディレクトリ : 主にReactコンポーネントファイル、テンプレートファイルとして機能する。
    - src/page : ファイル名の通りのページをつくることができる
        - src/pages/404.js : 404ページ
        - src/pages/index.js : ↓ 3つを呼び出している。トップページのテンプレート
    - src/components : Reactコンポーネント。テンプレートの部品
        - src/components/layout.js : サイトの基本のレイアウト(HTML)
        - src/components/bio.js : サイト運営者の表示(HTML)
        - src/components/seo.js : サイトのSEO対策(headタグの箇所のレイアウト)
    - src/templates : テンプレートファイル。src/components を呼び出してテンプレートを作っている。
        - src/templates/blog-post.js : 記事の個別ページ、フロントマターを元に表示ができる。
    - src/images/ : サイトに表示させる画像
    - src/style.css : CSSファイル
- gatsby ファイル
    - gatsby-config.js : サイトの基本情報(サイトタイトル、運営者のプロフィールなど)
    - gatsby-node.js : ビルドする時、ページをつくる
    - gatsby-browser.js : クライアントサイドで、追加のJavaScriptやCSSを読み込みさせることができる
    - gatsby-ssr.js : サーバーサイドレンダリングのカスタマイズをするファイル。通常、Gatsbyは静的サイトジェネレーター(SSG)だが、サーバーサイドレンダリングもサポート(SSR)している。ただし、SSRに対応した動的なウェブサーバー・ホスティングサービス(Netlifyなど)でなければSSRは使えない
- contentディレクトリ
    - content/blog/ : ここにブログ記事を配置する。以降のファイルパスがそのままスラッグになっている。
- public ディレクトリ : ビルドしたファイルがまとめられる。利用者はこのファイルを閲覧する。


### 流れ

1. まず、contentディレクトリへ記事をつくる
1. srcディレクトリへサイトの構成をつくる
1. gatsby-node.js がsrcディレクトリのファイルを使ってビルドする


srcディレクトリはほぼテンプレートであり、gatsby-node.jsがこのテンプレートを組み立てる処理系である。


## graphQL について

Gatsbyでは、graphQLを使って記事データを読み込みしている。

このgraphQLで、記事の検索・絞り込みや、並び替えもできる。

参照: https://www.gatsbyjs.com/docs/query-filters/

### graphQL サンプル

#### 【基本】デフォルトのクエリ

```
export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
```

このクエリの実行結果は、BlogIndex に引数 data として与えられる。

```
const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

```

この data は 先のgraphqlのオブジェクトと等価である。 つまり、

`data.site.siteMetadata.title` は

```
export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
```

ここから取り出している。

allMarkdownRemark はGatsbyのプラグインが提供するクエリで、サイト内の全てのマークダウンファイルを取得する。

`sort: { frontmatter: { date: DESC } }` は並び替えの処理、frontmatter(マークダウンファイルの冒頭) から 日付を取得し、新しい順に表示している。

#### filter で絞り込み


```
allMarkdownRemark( filter : { frontmatter: { date: { ne: null } } } ,  sort: { frontmatter: { date: DESC } })
```

## ページネーション

実装方法 https://www.gatsbyjs.com/docs/adding-pagination/
https://blog.microcms.io/gatsby-pagination/


まず、graphQLで手に入れるデータが通常とは違う。通常はnode 、ページネーションに対応したオブジェクトがedges。

DjangoのモデルオブジェクトとPaginatorオブジェクトとほぼ同じ概念である。

nodeはただのデータのリスト。edgesはそこにページネーションの情報を含ませている。


## 検索機能

近日追記予定


## カテゴリ・タグ機能

近日追記予定


## その他雑多な情報(メモ)

- gatsby-node.js では createPageを使うことで、URL付きの静的なページをつくることができる。
- `import { Link } from "gatsby"` は リンク先のデータをプリフェッチ(事前読み込み)できる。aタグよりも遷移が高速。
- graphQLの日時のフォーマットは、moment.js と同じ ( https://momentjs.com/docs/#/displaying/format/ ) 


https://github.com/gatsbyjs/gatsby-starter-default
