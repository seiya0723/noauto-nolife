---
title: "Django Summernoteを使ったブログで、本文の画像を記事のサムネイルにするには【BeautifulSoup使用】"
date: 2023-06-26T11:15:23+09:00
lastmod: 2023-06-26T11:15:23+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips" ]
---


Django-summernoteを使ったブログサイトを作るとき。

ブログの記事の一覧表示にはサムネイルの表示が必要になる。

しかし、記事にサムネイル専用のフィールドを割り当ててしまうと、本文の画像とかぶってしまう(サムネイル用の画像を指定した後、記事にも同じ画像を貼り付けるという二度手間)


そこで、記事の一番最初に指定された画像をサムネイルとして使えるよう、モデルメソッドを作った。

BeautifulSoupを使って。

## モデル

```
class Topic(models.Model):

    title   = models.CharField(verbose_name='タイトル', max_length=100)
    text    = models.TextField(verbose_name='内容')

    def __str__(self):
        return self.title

    # summernote装飾をしていても一覧表示でレイアウトが崩れないようにするモデルメソッド
    def plain_text(self):
        soup = bs4.BeautifulSoup(self.text, 'html.parser')
        return soup.get_text()

    # summernoteにセットされた画像を抜き取ってサムネイルにするモデルメソッド
    def text_thumbnail(self):
        soup = bs4.BeautifulSoup(self.text, 'html.parser')
        img_elems = soup.select('img')
        if len(img_elems) >= 1:
            return str(img_elems[0])
        else:
            return '<img src="/media/images/noimage.png" alt="サムネイル" style="max_width:100%; max-height:10rem;">'
```

## 結論

django-summernoteを使っていて困るのが、一覧表示時。

フィールドにはHTMLを含んだ文字列で書かれてあるので、記事の本文を切り詰め表示する際にも普通にやるとHTMLが混ざる。

今回は`plain_text`メソッドを用意し、BeautifulSoupを使って、HTMLタグを除去して文字列を返した。

同様にサムネイルの表示も、記事の本文のHTMLデータをBeautifulSoupで解析、最初のimgタグを取り出してサムネイルとして返すようにしている。
