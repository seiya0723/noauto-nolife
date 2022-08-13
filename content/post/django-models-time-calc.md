---
title: "【Django】モデルに計算可能な時間を記録する【勉強時間・筋トレ時間の記録系ウェブアプリの作成に】"
date: 2022-08-13T14:44:47+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django","models","上級者向け" ]
---

例えば、勉強時間や筋トレ時間を記録するウェブアプリを作るとする。

この時に、ネックになるのが、時間を記録するモデルフィールド。

IntegerFieldで記録するべきか、DatetimeFieldでtimedeltaを使うか。

いずれにせよ、合計や平均などを出さないといけないので、このフィールド選択を間違えると後々大変なことになる。

フォームの形式も考慮する必要がある。

そこで、本記事では、時間を記録する方法の最適解に近づけるよう考察する。

## 方法論と問題点

|方法論|問題点|
|:--:|:--:|
|開始時刻と終了時刻をDateTimeFieldで記録する|途中休憩を挟むことができない、休憩を挟むたびにレコードが入る|
|実行時間をIntegerFieldで記録する|時間の計算をする必要がある。単位をミリ秒とするか、秒とするかで揉める|
|timedelta型のDurationFieldを使う|計算は簡単だが、テンプレートの表示にも問題あり|


### DurationFieldとは？

秒単位でもフォーマット(時間:分:秒)でも指定可能なフィールド。datetime.timedelta型に変換してくれる。

DurationFieldはtimedelta型なので、計算処理は楽だ(平均、合計も簡単に出せる)。

だが、テンプレートの表示に問題がある。

<div class="img-center"><img src="/images/Screenshot from 2022-08-13 17-21-03.png" alt=""></div>

これさえどうにかなれば、DurationFieldを採用すると言う選択肢はアリだと思う。Stackoverflowで検索したところ、どうやらカスタムテンプレートタグしか選択肢はないようだ。

https://stackoverflow.com/questions/33105457/display-and-format-django-durationfield-in-template

上記サイトのカスタムテンプレートタグを使うことで解決できる。


## 結論

カスタムテンプレートタグが使える環境下であれば、DurationFieldを採用すると良いだろう。

カスタムテンプレートタグが使えない環境下であれば、IntegerFieldかDateTimeFieldしか選択肢はない。


