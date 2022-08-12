---
title: "【Python3】BeautifulSoup4の使い方、検証のコード作成方法、役立つリンク集のまとめ【保存版】"
date: 2022-08-11T09:27:27+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Python","スクレイピング","BeautifulSoup" ]
---

スクレイピングの用途は様々。

画像などのメディアファイルのDL、サイトの監視、ウェブアプリへの活用などなど。

よって、なるべくすぐにスクレイピング用のコードを作れる状態にしておきたいのだが、そういう時に限ってBeautifulSoupの仕様を忘れたり、コードを漁ったりしないと作れない。

そこで、本記事ではBeautifulSoup4の使い方を含め、検証方法等やドキュメントなどをまとめる。


## 【requestsとBeautifulSoup】基本のスクレイピングコード

`requests`を使用して、サイトにリクエストを送信。ソースコードをDLしてスクレイピングをするコードが下記。

    import requests,bs4
    
    TIMEOUT     = 10
    HEADER      = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0'}
    
    try:
        result  = requests.get("https://noauto-nolife.com/", timeout=TIMEOUT, headers=HEADER)
        result.raise_for_status()
    except Exception as e:
        print("ERROR_DOWNLOAD:{}".format(e))
    else:
        soup    = bs4.BeautifulSoup(result.soup, "html.parser")
        main    = soup.select(main)
    
    
        print(main)
    

requestsは例外を出すため、try文を使ったほうがよい。

また、サイトによってはUAの指定がないと返却するHTMLがおかしなことになるので、必要な場合はセットしておいた方が良いだろう。


## 【検証用】手元のHTMLファイルをスクレイピングするコード

BeautifulSoupのメソッドなどの動作確認をしたい時、そういうサイトを探すぐらいなら自分でHTMLファイルを作って読んだほうが早い。

ということで、手元のHTMLファイルをスクレイピングするコードが以下の2つ。

まず、以下を`index.html`として保存する。


    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>スクレイピングテスト</title>
    </head>
    <body>
        <main>あああ</main>
    </body>
    </html>


続いて、`index.html`と同じディレクトリにscrape.pyを作る。内容は下記。

    import bs4
    
    with open("index.html") as f:
        soup    = bs4.BeautifulSoup(f, "html.parser")
        main    = soup.select("main")
    
        print(main)
    
上記、scrape.pyを実行するとindex.htmlが読める。

後は、index.htmlを修正して動作確認をすると良いだろう。



## 【SeleniumとBeautifulSoup】JavaScriptを実行させてスクレイピングをする

ブラウザで動作させた状況とほぼ同一のスクレイピングを行う。

    from selenium import webdriver
    import bs4
    
    #プロファイルあり、ヘッドレスモードで起動で起動する場合はこちら
    #from selenium.webdriver import Firefox, FirefoxOptions
    
    #fp      = webdriver.FirefoxProfile("/home/akagi/.mozilla/firefox/vvk4wsb6.default")
    #options = FirefoxOptions()
    #options.add_argument('-headless')
    
    #driver  = webdriver.Firefox(fp, options=options)
    
    
    driver  = webdriver.Firefox()
    driver.get("https://noauto-nolife.com/")
    
    soup    = bs4.BeautifulSoup(driver.page_source, "html.parser")
    main    = soup.select("main")
    
    print(main)
    
    driver.quit()


## BeautifulSoupのよくあるQA

### 一度スクレイピングして取得した要素を再度スクレイピングするには？

    import bs4,requests
    
    with open("index.html") as f:
        soup    = bs4.BeautifulSoup(f, "html.parser")
        elem    = soup.select("main")
    
    
        for e in elem:
            soup2   = bs4.BeautifulSoup(str(e), "html.parser")
            elem2   = soup2.select(".content")
    
            print(elem2)
    

.select()によって手に入ったデータをループして取り出し、str()で文字列に直すと再度スクレイピングできる。

divなどのありふれたタグ名でしか取得できない場合、このようなやり方で取得する必要に迫られることもある。



### find系とselect系の違いは？

findとselectでは要素の指定方法が全く異なる。

どちらかと言えば、CSSセレクタと同じ記法のselectのほうが良いだろう。


### パーサーはlxmlを使ったほうが良いのでは？

lxmlを使うと高速にスクレイピングが可能になる。

だが、一部のサイトではスクレイピングに失敗する事がある。

ゆえに、"html.parser"を使うほうが無難。

むしろ、他のコードを最適化していくほうが良いだろう。内包表記を使う、アーリーリターンを採用するなどをするだけでも処理速度は全然違う。

### ブラウザの開発ツールで見たコードとrequestsで取得したコードに違いがあるのはなぜ？

JavaScriptが実行されてなかったり、UAに応じてレスポンスが異なったりするように仕立てているから。

requestsでHTMLのデータを取得しても、JavaScriptは実行されない。

JavaScriptでHTMLの構造が変わる場合、それが実行されなければブラウザとは違いが出てしまう。

### スクレイピングの限界って？

スクレイピングで何でも取得できるわけではない

- サイト運営者の仕様変更に伴い、修正していく必要がある
- サイト運営者側がスクレイピング対策をしている
- 不適切なスクレイピングをすると逮捕
- サイトのHTML構造が不適切だとスクレイピング無理

スクレイピングはあくまでも、サイト上のデータを拾う作業。

データが拾えるかどうかは、サイト運営者の行動次第。手のひらで踊らされているに過ぎないのだ。

ゆえに、ときには諦めも肝心である。


## リンク集

- 公式: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- 公式の日本語版: http://kondou.com/BS4/


