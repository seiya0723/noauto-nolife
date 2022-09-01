---
title: "【Laravel】マイグレーション時の『Cannot add a NOT NULL column with default value NULL』問題を対処する【エラー】"
date: 2021-11-24T16:49:32+09:00
draft: false
thumbnail: "images/laravel.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Laravel","初心者向け","tips" ]
---

なぜ、このエラーが発生するのか。まず原因から解説する。

## 原因

要するにこういうこと。

<div class="img-center"><img src="/images/Screenshot from 2020-11-18 08-49-18.png" alt=""></div>

追加しようとしているフィールド(カラム)がNull禁止でデフォルトが無い。しかし、フィールド(カラム)を追加する以上、どうしてもNullになってしまう。この矛盾をどうするかと言うのがこの問題。

この状況が発生する条件は下記。下記を全て満たすと発生する。

- 条件1:既存のテーブルにカラムを追加する
- 条件2:追加するカラムにカラムにdefaultが指定されていない(defaultが無い状態)
- 条件3:追加するカラムにNullが許可されていない(Null禁止の状態)

## 対策

対策として、マイグレーションファイルとsqliteを全部削除して最初からマイグレーションファイルを作り直すという選択肢もある。

しかし、defaultを指定するか、nullを許可するほうが簡単である。下記に倣ってdefaultを指定しておけば、それでマイグレーションは問題なくできる。

    <?php
    
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    
    class AddIpaddress extends Migration
    {
        public function up()
        {   
            Schema::table('topics', function (Blueprint $table) {
                $table->string("title",100)->default("無題のタイトル");
            });
        }   
    
        public function down()
        {   
            Schema::table('topics', function (Blueprint $table) {
                //
            });
        }   
    }


## 結論

理屈はNull禁止であるにもかかわらずデフォルトが存在しない矛盾にある。だから、いずれかを指定してあげれば解決する話である。


