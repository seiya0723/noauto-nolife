---
title: "【Heroku】デプロイ直後にコマンドを実行する【Procfile編集】"
date: 2024-10-04T18:47:25+09:00
lastmod: 2024-10-04T18:47:25+09:00
draft: false
thumbnail: "images/heroku.jpg"
categories: [ "インフラ" ]
tags: [ "デプロイ","heroku" ]
---

例えば、Djangoのデプロイ時に、マイグレーションをしてほしいのであれば、

```
release: python manage.py migrate
web: gunicorn config.wsgi:application --log-file -
```

とする。


## 並列で処理を実行して欲しい場合

worker を使う。

```
release: python manage.py migrate
worker: python manage.py custom_command
web: gunicorn config.wsgi:application --log-file -
```

## 参照

https://devcenter.heroku.com/articles/procfile




