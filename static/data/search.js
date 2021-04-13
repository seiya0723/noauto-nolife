const SEARCH_LIST = [
{ "link": "/post/cloud9-first-config/", "title" : "【AWS】Cloud9使う時にすぐやる設定【bashrc、Django等】" }, 
{ "link": "/post/css3-accordion/", "title" : "CSS3だけで実装できるアコーディオン【checkbox+transition】" }, 
{ "link": "/post/css3-animation/", "title" : "CSS3を使用した簡単アニメーションの実装【transitionとtransform】" }, 
{ "link": "/post/css3-deep-bg/", "title" : "【CSS3】スクロール時に奥行きを感じる背景(background)の作り方" }, 
{ "link": "/post/css3-sidebar/", "title" : "CSS3で折りたたみ式のサイドバーを実装させる【checkbox+transition+position】" }, 
{ "link": "/post/css3-tab-system/", "title" : "CSS3とHTML5だけでタブを作り、複数のページを表示させる【JS不要】" }, 
{ "link": "/post/css3-textborder/", "title" : "【CSS3】文字に縁取りを加えて視認性UPさせる方法【text-shadow】" }, 
{ "link": "/post/css3-toggle-switch/", "title" : "CSS3でiOS風のトグルスイッチを作る方法【transition+checkbox】" }, 
{ "link": "/post/django-ajax-restful/", "title" : "【Restful】DjangoでAjax(jQuery)を実装する方法【Django REST Framework使用】" }, 
{ "link": "/post/django-ajax-thumbnail-upload/", "title" : "Djangoで動画投稿時にサムネイルもセットでアップロードする【DRF+Ajax(jQuery)】" }, 
{ "link": "/post/django-ajax/", "title" : "DjangoでAjax(jQuery)を実装する方法【非同期通信】【Restful不使用版】" }, 
{ "link": "/post/django-allauth-custom-user-model/", "title" : "Django-allauthでカスタムユーザーモデルを実装させる" }, 
{ "link": "/post/django-allauth-loginpage/", "title" : "Django-allauthのログインページの装飾を装飾する【テンプレートの追加】" }, 
{ "link": "/post/django-args-kwargs/", "title" : "DjangoやPythonにおける*argsと**kwargsとは何か" }, 
{ "link": "/post/django-batch-opencv/", "title" : "【Django】バッチ処理のOpenCVが撮影した画像をDBに保存する" }, 
{ "link": "/post/django-cleanup/", "title" : "【django-cleanup】画像等のファイルを自動的に削除する" }, 
{ "link": "/post/django-comma/", "title" : "Djangoで数値のカンマ区切りを実装させる" }, 
{ "link": "/post/django-command-add/", "title" : "【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】" }, 
{ "link": "/post/django-custom-template-tags/", "title" : "Djangoで埋め込みカスタムテンプレートタグを実装する方法" }, 
{ "link": "/post/django-custom-user-model-foreignkey/", "title" : "Djangoでカスタムユーザーモデルを外部キーとして指定する方法" }, 
{ "link": "/post/django-custom-user-model-uuid/", "title" : "DjangoでUUIDを主キーとしたカスタムユーザーモデルを作る【AbstractBaseUserとallauth】" }, 
{ "link": "/post/django-deploy-heroku/", "title" : "DjangoをDEBUG=FalseでHerokuにデプロイする方法【静的ファイルの設定が肝】" }, 
{ "link": "/post/django-deploy-linux/", "title" : "DjangoをLinux(Ubuntu)サーバーにデプロイする方法【Nginx+PostgreSQL】" }, 
{ "link": "/post/django-dumpdata/", "title" : "DjangoでDBに格納したデータをダンプ(バックアップ)させる【dumpdata】" }, 
{ "link": "/post/django-fileupload/", "title" : "Djangoで画像及びファイルをアップロードする方法" }, 
{ "link": "/post/django-foreign-count/", "title" : "【Django】外部キーに対応したデータの個数を表示する【リプライ・コメント数の表示に有効】" }, 
{ "link": "/post/django-id-to-uuid/", "title" : "Djangoでデフォルト数値型のid(主キー)からUUID型にする【データ移行】" }, 
{ "link": "/post/django-loaddata/", "title" : "Djangoで開発中、データベースへ初期データを入力する【loaddata】" }, 
{ "link": "/post/django-m2m-form/", "title" : "【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示" }, 
{ "link": "/post/django-m2m-restful/", "title" : "Djangoで多対多のリレーションを含むデータをAjax(jQuery)+DRFで送信させる" }, 
{ "link": "/post/django-many-to-many/", "title" : "Djangoで多対多のリレーションをテンプレートで表示する方法【ManyToManyField】" }, 
{ "link": "/post/django-migrate-error/", "title" : "Djangoのマイグレーションのエラー時の対処法" }, 
{ "link": "/post/django-models-regex-validate/", "title" : "【Django】モデルフィールドに正規表現によるバリデーションを指定する【カラーコード・電話番号に有効】" }, 
{ "link": "/post/django-non-nullable/", "title" : "DjangoでYou are Trying to add a non-nullable fieldと表示されたときの対策【makemigrations】" }, 
{ "link": "/post/django-or-and-search/", "title" : "Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】" }, 
{ "link": "/post/django-paginator/", "title" : "Djangoでページネーションを実装する方法【django.core.paginator】【パラメータ両立】" }, 
{ "link": "/post/django-redirect/", "title" : "Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法" }, 
{ "link": "/post/django-scraping/", "title" : "DjangoにPythonスクレイピングを実装した簡易検索エンジンの作り方【BeautifulSoup】" }, 
{ "link": "/post/django-sendgrid/", "title" : "DjangoでSendgridを実装させる方法【APIキーと2段階認証を利用する】" }, 
{ "link": "/post/django-templates-include/", "title" : "Django Templates Language(DTL)でincludeを実行する時に引数も与える" }, 
{ "link": "/post/drf-ajax-fileupload/", "title" : "DRF(Django REST Framework)+Ajax(jQuery)で画像とファイルをアップロードする方法" }, 
{ "link": "/post/fileupload-error/", "title" : "【Nginx】1MB以上のファイルアップロードが出来ない場合の対処法" }, 
{ "link": "/post/flatpickr-install/", "title" : "【日付入力】flatpickrの実装方法(ロケール日本語化、日時入力対応化)" }, 
{ "link": "/post/heroku-postgres-settings/", "title" : "Herokuのデータベース(herokupostgres)の実装と設定方法【Hobby-Plan】" }, 
{ "link": "/post/jquery-autocomplete/", "title" : "jQueryでオートコンプリート(入力補正)を実装させる【表記ゆれ対策にも有効】" }, 
{ "link": "/post/laravel-ajax/", "title" : "laravelでAjax(jQuery)を送信する【POST+DELETE】" }, 
{ "link": "/post/laravel-artisan-command/", "title" : "Laravelのartisanコマンドのまとめ" }, 
{ "link": "/post/laravel-command-ubuntu/", "title" : "laravelコマンドをUbuntuで実行可能にする方法" }, 
{ "link": "/post/laravel-crud-restful/", "title" : "laravelでCRUD簡易掲示板を作る【Restful】" }, 
{ "link": "/post/laravel-fileupload/", "title" : "Laravelで画像とファイルをアップロードする" }, 
{ "link": "/post/laravel-heroku-405-error/", "title" : "Ajax搭載したLaravelをHerokuにデプロイした時、405エラーが出る問題の解決【method not allowed】" }, 
{ "link": "/post/laravel-heroku-deploy/", "title" : "LaravelをHerokuにデプロイする【Heroku-postgresql使用】" }, 
{ "link": "/post/laravel-log/", "title" : "laravelで開発中、ログを表示させる" }, 
{ "link": "/post/laravel-public-dirname-caution/", "title" : "【Laravel】静的ファイルのディレクトリ作るときの注意点【publicのディレクトリ名で即404エラー】" }, 
{ "link": "/post/laravel-search-paginate/", "title" : "Laravelで検索とページネーションを両立させる【ANDとOR検索も】" }, 
{ "link": "/post/laravel-uuid/", "title" : "Laravelで主キーにUUIDを実装させる方法【laravel-eloquent-uuid】" }, 
{ "link": "/post/laravel-validate/", "title" : "Laravelでリクエストのバリデーションを行う" }, 
{ "link": "/post/nonjs-pagespeed/", "title" : "JavaScriptほぼ不使用のサイトを作ってGoogle PageSpeed Insightsでスコアを調べてみた" }, 
{ "link": "/post/selenium-read-profile/", "title" : "SeleniumでFirefoxブラウザのプロファイルを読み込む【Recaptcha突破、Cookie+アドオン読み込み】" }, 
{ "link": "/post/startup-django-allauth/", "title" : "【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】" }, 
{ "link": "/post/startup-django-helloworld/", "title" : "DjangoでHelloWorld【HttpResponse及びレンダリング】" }, 
{ "link": "/post/startup-django/", "title" : "Djangoビギナーが40分で掲示板アプリを作る方法" }, 
{ "link": "/post/startup-fontawesome/", "title" : "fontawesomeの実装と利用例のまとめ" }, 
{ "link": "/post/startup-geodjango/", "title" : "【地理空間情報】GeoDjangoの実装方法【PostGIS+PostgreSQL+国土地理院データ】" }, 
{ "link": "/post/startup-laravel/", "title" : "Laravelビギナーが30分で掲示板アプリを作る方法" }, 
{ "link": "/post/startup-netlify/", "title" : "Netlifyと静的サイトジェネレーターHUGOで1ヶ月約100円でブログ運営をする方法【独自ドメイン使用】" }, 
{ "link": "/post/startup-npm-install/", "title" : "Ubuntu18.04にnode.jsとnpm、vue-cliをインストールする" }, 
{ "link": "/post/startup-sqlite3/", "title" : "SQLiteの操作方法【テーブル一覧表示、SQLなど】" }, 
{ "link": "/post/vuejs-modal/", "title" : "Vue.jsでモーダルダイアログを作る" }, 
{ "link": "/post/vuejs-todo-crud/", "title" : "Vue.jsでTODOを作る【CRUD】" }, 
];
