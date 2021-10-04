const SEARCH_LIST = [
{ "link": "/post/django-admin-custom/", "title" : "Djangoの管理サイト(admin)をカスタムする【全件表示、全フィールド表示、並び替え、画像表示、検索など】" }, 
{ "link": "/post/django-models-add-field/", "title" : "【Django】models.pyにフィールドを追加・削除して、マイグレーションを実行する" }, 
{ "link": "/post/django-post-request/", "title" : "DjangoでHTTPリクエストのPOSTメソッドを送信する" }, 
{ "link": "/post/django-anti-scraping/", "title" : "Djangoでスクレイピング対策をする【MIDDLEWAREでUA除外、ランダムでHTML構造変化等】" }, 
{ "link": "/post/django-http-response/", "title" : "Djangoで任意のHTTPレスポンス(ForbiddenやNotFoundなど)を返却する【HttpResponse subclasses】" }, 
{ "link": "/post/django-deploy-heroku-cloudinary-file-reference/", "title" : "【Django】Heroku+Cloudinaryの環境にアップロードしたファイルを参照する方法【MIMEとサイズ】" }, 
{ "link": "/post/cloudinary-blocked-for-delivery/", "title" : "CloudinaryでPDF等の画像や動画以外のファイルをアップロードし、共有する方法【blocked for delivery】" }, 
{ "link": "/post/django-deploy-heroku-cloudinary/", "title" : "DjangoをHeroku+Cloudinary(基本無料ストレージ)の環境にデプロイする【ウェブアプリのデモを一般公開したい場合などに】" }, 
{ "link": "/post/django-forms-validate/", "title" : "【Django】forms.pyでバリデーションをする【モデルを継承したFormクラス】" }, 
{ "link": "/post/startup-django-helloworld/", "title" : "DjangoでHelloWorld【HttpResponse及びレンダリング】" }, 
{ "link": "/post/raspberypi-zero-limit-access/", "title" : "Raspberry Pi Zeroに搭載したNginxの限界を試す【curlコマンド】" }, 
{ "link": "/post/nginx-deny-ip-address/", "title" : "Nginxで特定IPアドレスのリクエストを拒否する" }, 
{ "link": "/post/javascript-carousel-origin-slider/", "title" : "【jQuery】ボタン式の横スライダーを自作する【通販サイト・コンテンツ共有サイトなどに】" }, 
{ "link": "/post/django-ajax-thumbnail-upload/", "title" : "Djangoで動画投稿時にサムネイルもセットでアップロードする【DRF+Ajax(jQuery)+canvas】" }, 
{ "link": "/post/startup-django/", "title" : "Djangoビギナーが40分で掲示板アプリを作る方法" }, 
{ "link": "/post/nginx-log-check-by-awk/", "title" : "Nginxのログをawkコマンドを使用して調べる【crontabで特定の条件下のログを管理者へ報告】" }, 
{ "link": "/post/django-admin-protect/", "title" : "【Django】デプロイ後に管理サイトを管理者以外がアクセスできないようにする【UUID+MIDDLEWAREによるURL複雑化とIPアドレス制限】" }, 
{ "link": "/post/recaptcha-setting/", "title" : "独自ドメインのサイトにreCAPTCHAを実装させる方法と仕組み【ボット対策】" }, 
{ "link": "/post/shellscript-auto-backup/", "title" : "リモートサーバーのデータを自動的にバックアップする方法論【scp+crontab】" }, 
{ "link": "/post/startup-server-manage/", "title" : "サーバーを本格的に運用するようになったらやること・守ること" }, 
{ "link": "/post/shellscript-server-checker/", "title" : "シェルスクリプトでウェブサーバーの応答不能・ステータスコードをチェックして記録・通知する【pingとcurl、即メール送信にも有効】" }, 
{ "link": "/post/uuid-generate/", "title" : "UUIDを生成するコマンドuuidgen【予測されたくないページのURL割り当て等】" }, 
{ "link": "/post/nginx-log-check/", "title" : "Nginxのログをチェックする、ログの出力設定を変更する" }, 
{ "link": "/post/laravel-m2m-foreignkey/", "title" : "Laravelで1対多、多対多のリレーションを作る【トピックに対してコメントの投稿、トピックタグの指定】" }, 
{ "link": "/post/laravel-gitignore-add/", "title" : "【Laravel】GitHubにプッシュする時.gitignoreに追加する必要のあるファイル、ディレクトリ" }, 
{ "link": "/post/laravel-database-regenerate/", "title" : "【Laravel】Sqliteのデータベースファイルをワンライナーで再生成する【findコマンド+-exec評価式+alias】" }, 
{ "link": "/post/django-secret-key-regenerate/", "title" : "【Django】settings.pyのSECRET_KEYを再発行(リジェネレート)する【alias登録で即生成・即実装からの再起動】" }, 
{ "link": "/post/django-sendgrid-processing/", "title" : "【Django+Sendgrid】サーバー処理中(ビュー、独自コマンド)に通知メール(To,CC,BCC)を送信する" }, 
{ "link": "/post/laravel-migrations-files-detect/", "title" : "【Laravel】コマンドからマイグレーションファイルを立ち上げる時、こうすればうまく行く【ワイルドカードとTabキー】" }, 
{ "link": "/post/startup-ubuntu2004-server/", "title" : "サーバー版Ubuntu 20.04のインストールから設定、SSHログインまで【固定IPアドレス、タイムゾーン、bashrcなど】" }, 
{ "link": "/post/django-jumanpp-trend/", "title" : "【形態素解析】DjangoとJUMAN++を使ってトレンドワード(名詞のみ)を表示する【定期実行で1時間以内に投稿された内容を学習などに】" }, 
{ "link": "/post/laravel-log/", "title" : "laravelで開発中、ログを表示させる" }, 
{ "link": "/post/django-deploy-ec2-origin-domain/", "title" : "【Django+AWS】独自ドメインを割り当てHTTPS通信を実現した状態で、EC2(Ubuntu+Nginx)へデプロイする" }, 
{ "link": "/post/django-show-ip-ua-gateway/", "title" : "DjangoでサイトにアクセスしたクライアントのIPアドレス、ユーザーエージェント(UA)、プロバイダ名(ゲートウェイ名)を表示する【犯罪・不正行為の抑止とセキュリティ】" }, 
{ "link": "/post/django-deploy-ec2/", "title" : "DjangoをAWSのEC2(Ubuntu)にデプロイする" }, 
{ "link": "/post/startup-postgresql/", "title" : "PostgreSQLインストールから、ユーザーとDBを作る" }, 
{ "link": "/post/aws-do-not-spend-money/", "title" : "AWSでなるべくお金がかからないようにウェブアプリを運用する方法" }, 
{ "link": "/post/django-distinct-on-sqlite/", "title" : "【Django】SQLiteでも特定フィールドに対してのdistinctっぽい事(重複除去)を行う【通常はPostgreSQLのみ有効】" }, 
{ "link": "/post/ec2-origin-domain-https/", "title" : "【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】" }, 
{ "link": "/post/django-custom-template-tags-hashtags/", "title" : "【Django】カスタムテンプレートタグ(フィルタ)でリンク付きのハッシュタグを実現する。【#から始まる正規表現】" }, 
{ "link": "/post/django-models-query/", "title" : "【Django】実行されるクエリを確認する【.query】" }, 
{ "link": "/post/django-args-kwargs-view-recycle/", "title" : "【Django】kwargsを使ってビューを使いまわす【urls.py+views.py】" }, 
{ "link": "/post/django-models-window/", "title" : "【Django】Windowを使ってレコードの累計値を計算して出力【売上の累計表示、小計(累積)表示などに有効】" }, 
{ "link": "/post/django-models-trunc/", "title" : "【Django】年、月、日単位でデータをファイリングする時はTruncを使用する【月ごとの売上、個数などの出力に有効】" }, 
{ "link": "/post/javascript-carousel-origin/", "title" : "【jQuery】HTML、CSS、JS合わせて100行以内でカルーセルを自作する【自動スライド】" }, 
{ "link": "/post/django-create-middleware-add-request-attribute/", "title" : "【Django】MIDDLEWAREを作って、常にデータを表示する【requestにモデルオブジェクトを属性として追加する】" }, 
{ "link": "/post/django-create-middleware/", "title" : "【Django】MIDDLEWAREを自作、未ログインユーザーにメディアファイルへのアクセスを拒否する【settings.py】" }, 
{ "link": "/post/django-cleanup/", "title" : "【django-cleanup】画像等のファイルを自動的に削除する" }, 
{ "link": "/post/django-same-user-operate-prevent/", "title" : "【Django】同一人物による工作(再生数の水増しなど)をいかにして防ぐか、方法と対策【unique_together,Recaptcha,UA,IPアドレス等】" }, 
{ "link": "/post/django-m2m-through-good-bad/", "title" : "Djangoで中間テーブルありの多対多フィールドを使用したモデルに良いね・悪いねする【related_nameとカスタムユーザーモデル】" }, 
{ "link": "/post/django-m2m-through-reverse-accessor-error/", "title" : "【Django】Reverse accessor for 'Topic.good' clashes with reverse accessor for 'Topic.user'.というエラーの対処【Topicに対する良いね、多対多中間フィールドあり】" }, 
{ "link": "/post/javascript-formdata-obj-set/", "title" : "FormDataをformタグではなく、オブジェクトにキーと値をセットした上でAjax送信" }, 
{ "link": "/post/css3-tab-system-transition/", "title" : "CSS3とHTML5のタブシステムをtransitionでアニメーション表示に仕立てる" }, 
{ "link": "/post/django-models-add-method-template-attribute/", "title" : "Djangoのモデルに独自メソッドを追加、テンプレートに表示【フィールド間の計算、他モデルの値の表示などに有効】" }, 
{ "link": "/post/django-foreign-count-distinct/", "title" : "Djangoで複数の外部キーに対応したフィールドの個数をカウントする【annotate(Count)+DISTINCT】" }, 
{ "link": "/post/django-models-save-delete-override/", "title" : "DjangoでDBへデータ格納時(save)、削除時(delete)に処理を追加する【models.py、forms.py、serializer.pyのメソッドオーバーライド】" }, 
{ "link": "/post/django-models-uuid-int-null/", "title" : "Djangoで数値型もしくはUUID型等のフィールドに、クライアント側から未入力を許可するにはnull=Trueとblank=Trueのオプションを" }, 
{ "link": "/post/startup-fontawesome/", "title" : "fontawesomeの実装と利用例のまとめ" }, 
{ "link": "/post/django-admin-custom-action/", "title" : "【Django】admin.pyからカスタムアクションを追加し、管理サイトから実行【crontab、BaseCommandが使えない場合の対処法】" }, 
{ "link": "/post/django-deploy-heroku-s3/", "title" : "DjangoをS3(AWS)ストレージ付きのHerokuにデプロイする" }, 
{ "link": "/post/django-foreign-count/", "title" : "【Django】外部キーに対応したデータの個数をカウントして表示【リプライ・コメント数の表示に有効】【annotate+Count】" }, 
{ "link": "/post/django-admin-custom-form/", "title" : "Djangoの管理サイトのフォームをカスタムする【forms.py】" }, 
{ "link": "/post/django-id-list-filter/", "title" : "Djangoで主キーのリスト型を作り、合致するレコードを検索する【values_list + filter】" }, 
{ "link": "/post/javascript-download-csv/", "title" : "Javascriptを使ってCSVを生成してダウンロードする" }, 
{ "link": "/post/django-models-autofield-warnings/", "title" : "Djangoでマイグレーションした時、『Auto-created primary key used when not defining a primary key type』と警告される場合の対策" }, 
{ "link": "/post/django-deploy-heroku/", "title" : "DjangoをDEBUG=FalseでHerokuにデプロイする方法" }, 
{ "link": "/post/django-deploy-ec2-rds-s3/", "title" : "DjangoをEC2(Ubuntu)、RDS(PostgreSQL)、S3の環境にデプロイをする" }, 
{ "link": "/post/ubuntu-ssh/", "title" : "UbuntuにSSHでリモートログインする方法【パスワード認証+公開鍵認証+scpコマンド】" }, 
{ "link": "/post/startup-django-allauth/", "title" : "【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】" }, 
{ "link": "/post/django-deploy-linux/", "title" : "DjangoをLinux(Ubuntu)サーバーにデプロイする方法【Nginx+PostgreSQL】" }, 
{ "link": "/post/django-m2m-form/", "title" : "【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示" }, 
{ "link": "/post/django-m2m-usermodel/", "title" : "【Django】カスタムユーザーモデルでユーザーブロック機能を実装させる【ManyToManyFieldでユーザーモデル自身を指定】" }, 
{ "link": "/post/python-brackets/", "title" : "Pythonの角括弧と丸括弧の違い、丸括弧を使う場合の注意点【()と[]、タプルとリスト】" }, 
{ "link": "/post/django-custom-user-model-allauth-bbs/", "title" : "【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】" }, 
{ "link": "/post/django-custom-user-model-uuid/", "title" : "DjangoでUUIDを主キーとしたカスタムユーザーモデルを作る【AbstractBaseUserとallauth】" }, 
{ "link": "/post/django-m2m-through/", "title" : "【django】ManyToManyFieldでフィールドオプションthroughを指定、中間テーブルを詳細に定義する【登録日時など】" }, 
{ "link": "/post/virtualbox-ubuntu-install/", "title" : "VirtualBoxにUbuntuをインストールする" }, 
{ "link": "/post/ubuntu1804-settings/", "title" : "【保存版】Ubuntu18.04をインストールした後に真っ先にやる16の設定" }, 
{ "link": "/post/django-or-and-search/", "title" : "Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】" }, 
{ "link": "/post/django-custom-template-tags-vs-before-view-calc/", "title" : "【Django】views.pyの事前処理 VS (埋め込み型)カスタムテンプレートタグ・フィルタ" }, 
{ "link": "/post/js-video-controller/", "title" : "video.jsを実装させ、コントローラをカスタムする【Brightcove Player】" }, 
{ "link": "/post/django-allauth-custom-urls/", "title" : "【Django】allauthのurls.pyをカスタムする【新規アカウント作成、パスワード変更処理の無効化など】" }, 
{ "link": "/post/django-batch-thumbnail-create/", "title" : "【Django】バッチ処理でPS、AI(PDF)ファイルのサムネイルを自動生成させる【BaseCommand】" }, 
{ "link": "/post/django-aips-thumbnail-autocreate/", "title" : "Djangoでアップロードされた.aiと.psファイルのサムネイルを自動生成させる【PhotoShop,Illustrator】" }, 
{ "link": "/post/django-custom-template-tags-color/", "title" : "【Django】16進カラーコードから色名に書き換えるフィルタを自作する【カスタムテンプレートフィルタ】" }, 
{ "link": "/post/django-allauth-custom-user-model/", "title" : "Djangoにカスタムユーザーモデルを実装させる【AbstractUserとallauth】" }, 
{ "link": "/post/startup-npm-install/", "title" : "Ubuntu18.04にnode.jsとnpm、vue-cliをインストールする" }, 
{ "link": "/post/django-paginator-custom/", "title" : "【django.core.paginator】一度に2ページ以上ジャンプできるように改良する【inclusion_tag()】" }, 
{ "link": "/post/django-paginator/", "title" : "Djangoでページネーションを実装する方法【django.core.paginator】【パラメータ両立】" }, 
{ "link": "/post/django-custom-template-tags/", "title" : "Djangoで埋め込みカスタムテンプレートタグを実装する方法" }, 
{ "link": "/post/django-reference-models-option/", "title" : "Djangoでviews.pyからmodels.pyのフィールドオプションを参照する【verbose_name,upload_to】" }, 
{ "link": "/post/jquery-to-javascript/", "title" : "jQueryのコードをJavascriptに書き換える【セレクタ、属性値の参照、イベントなど】" }, 
{ "link": "/post/django-ajax/", "title" : "DjangoでAjax(jQuery)を実装する方法【非同期通信】【DRF不使用版】" }, 
{ "link": "/post/django-makemigrations-not-applied/", "title" : "Djangoでmakemigrationsコマンドを実行しても、No changes detectedと言われる場合の対処法" }, 
{ "link": "/post/laravel-heroku-deploy/", "title" : "LaravelをHerokuにデプロイする【Heroku-postgresql使用】" }, 
{ "link": "/post/laravel-ubuntu-deploy/", "title" : "LaravelをUbuntuにデプロイする【Nginx+PostgreSQL】" }, 
{ "link": "/post/nomodal-edit-form/", "title" : "【Slack風】モーダルダイアログ無し、ページ遷移無しで編集フォームを作る【JS不使用】" }, 
{ "link": "/post/fontawesome-image-select/", "title" : "FontAwesomeや画像を選択できるプルダウンメニュー【JS不使用】" }, 
{ "link": "/post/hugo-js-search-system/", "title" : "HUGOにシェルスクリプトとJavaScriptの記事検索機能を実装させる" }, 
{ "link": "/post/django-fileupload/", "title" : "Djangoで画像及びファイルをアップロードする方法" }, 
{ "link": "/post/laravel-to-resource/", "title" : "Laravelで--resourceで作ったコントローラのルーティングを解体する" }, 
{ "link": "/post/laravel-crud-restful/", "title" : "laravelでCRUD簡易掲示板を作る【Restful】" }, 
{ "link": "/post/laravel-project-rename/", "title" : "Laravelのプロジェクト名を書き換える" }, 
{ "link": "/post/javascript-cookie/", "title" : "JavascriptからCookieを扱う【動画の設定音量の記録と読み込み】" }, 
{ "link": "/post/django-forms-temp-not-use/", "title" : "Djangoのforms.pyが提供するフォームテンプレートは使わない" }, 
{ "link": "/post/startup-sqlite3/", "title" : "SQLiteの操作方法【テーブル一覧表示、SQLなど】" }, 
{ "link": "/post/laravel-essential-php/", "title" : "Laravelに必要なPHP構文【if,for,function,class】" }, 
{ "link": "/post/laravel-overview/", "title" : "Laravelの全体像、ファイル・ディレクトリごとの役割と関係性を俯瞰する" }, 
{ "link": "/post/selenium-read-profile/", "title" : "SeleniumでFirefoxブラウザのプロファイルを読み込む【Recaptcha突破、Cookie+アドオン読み込み】" }, 
{ "link": "/post/django-sendgrid/", "title" : "DjangoでSendgridを実装させる方法【APIキーと2段階認証を利用する】" }, 
{ "link": "/post/django-batch-opencv/", "title" : "【Django】バッチ処理のOpenCVが撮影した画像をDBに保存する" }, 
{ "link": "/post/css3-tab-system/", "title" : "CSS3とHTML5だけでタブを作り、複数のページを表示させる【JS不要】" }, 
{ "link": "/post/laravel-uuid/", "title" : "Laravelで主キーにUUIDを実装させる方法【laravel-eloquent-uuid】" }, 
{ "link": "/post/laravel-validate/", "title" : "Laravelでリクエストのバリデーションを行う" }, 
{ "link": "/post/django-custom-user-model-foreignkey/", "title" : "Djangoでカスタムユーザーモデルを外部キーとして指定する方法" }, 
{ "link": "/post/cloud9-first-config/", "title" : "【AWS】Cloud9使う時にすぐやる設定【bashrc、Django等】" }, 
{ "link": "/post/django-allauth-loginpage/", "title" : "Django-allauthのログインページの装飾を装飾する【テンプレートの追加】" }, 
{ "link": "/post/laravel-heroku-405-error/", "title" : "Ajax搭載したLaravelをHerokuにデプロイした時、405エラーが出る問題の解決【method not allowed】" }, 
{ "link": "/post/laravel-public-dirname-caution/", "title" : "【Laravel】静的ファイルのディレクトリ作るときの注意点【publicのディレクトリ名で即404エラー】" }, 
{ "link": "/post/laravel-ajax/", "title" : "laravelでAjax(jQuery)を送信する【POST+DELETE】" }, 
{ "link": "/post/laravel-fileupload/", "title" : "Laravelで画像とファイルをアップロードする" }, 
{ "link": "/post/fileupload-error/", "title" : "【Nginx】1MB以上のファイルアップロードが出来ない場合の対処法" }, 
{ "link": "/post/django-command-add/", "title" : "【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】" }, 
{ "link": "/post/laravel-search-paginate/", "title" : "Laravelで検索とページネーションを両立させる【ANDとOR検索も】" }, 
{ "link": "/post/laravel-artisan-command/", "title" : "Laravelのartisanコマンドのまとめ" }, 
{ "link": "/post/laravel-command-ubuntu/", "title" : "laravelコマンドをUbuntuで実行可能にする方法" }, 
{ "link": "/post/startup-laravel/", "title" : "Laravelビギナーが30分で掲示板アプリを作る方法" }, 
{ "link": "/post/vuejs-todo-crud/", "title" : "Vue.jsでTODOを作る【CRUD】" }, 
{ "link": "/post/django-args-kwargs/", "title" : "DjangoやPythonにおける*argsと**kwargsとは何か" }, 
{ "link": "/post/django-models-regex-validate/", "title" : "【Django】モデルフィールドに正規表現によるバリデーションを指定する【カラーコード・電話番号に有効】" }, 
{ "link": "/post/nonjs-pagespeed/", "title" : "JavaScriptほぼ不使用のサイトを作ってGoogle PageSpeed Insightsでスコアを調べてみた" }, 
{ "link": "/post/startup-netlify/", "title" : "Netlifyと静的サイトジェネレーターHUGOで1ヶ月約100円でブログ運営をする方法【独自ドメイン使用】" }, 
{ "link": "/post/vuejs-modal/", "title" : "Vue.jsでモーダルダイアログを作る" }, 
{ "link": "/post/jquery-autocomplete/", "title" : "jQueryでオートコンプリート(入力補正)を実装させる【表記ゆれ対策にも有効】" }, 
{ "link": "/post/flatpickr-install/", "title" : "【日付入力】flatpickrの実装方法(ロケール日本語化、日時入力対応化)" }, 
{ "link": "/post/css3-accordion/", "title" : "CSS3だけで実装できるアコーディオン【checkbox+transition】" }, 
{ "link": "/post/css3-animation/", "title" : "CSS3を使用した簡単アニメーションの実装【transitionとtransform】" }, 
{ "link": "/post/css3-deep-bg/", "title" : "【CSS3】スクロール時に奥行きを感じる背景(background)の作り方" }, 
{ "link": "/post/css3-sidebar/", "title" : "CSS3で折りたたみ式のサイドバーを実装させる【checkbox+transition+position】" }, 
{ "link": "/post/css3-textborder/", "title" : "【CSS3】文字に縁取りを加えて視認性UPさせる方法【text-shadow】" }, 
{ "link": "/post/css3-toggle-switch/", "title" : "CSS3でiOS風のトグルスイッチを作る方法【transition+checkbox】" }, 
{ "link": "/post/heroku-postgres-settings/", "title" : "Herokuのデータベース(herokupostgres)の実装と設定方法【Hobby-Plan】" }, 
{ "link": "/post/startup-geodjango/", "title" : "【地理空間情報】GeoDjangoの実装方法【PostGIS+PostgreSQL+国土地理院データ】" }, 
{ "link": "/post/drf-ajax-fileupload/", "title" : "DRF(Django REST Framework)+Ajax(jQuery)で画像とファイルをアップロードする方法" }, 
{ "link": "/post/django-templates-include/", "title" : "Django Templates Language(DTL)でincludeを実行する時に引数も与える" }, 
{ "link": "/post/django-id-to-uuid/", "title" : "Djangoでデフォルト数値型のid(主キー)からUUID型にする【データ移行】" }, 
{ "link": "/post/django-loaddata/", "title" : "Djangoで開発中、データベースへ初期データを入力する【loaddata】" }, 
{ "link": "/post/django-m2m-restful/", "title" : "Djangoで多対多のリレーションを含むデータをAjax(jQuery)+DRFで送信させる" }, 
{ "link": "/post/django-many-to-many/", "title" : "Djangoで多対多のリレーションをテンプレートで表示する方法【ManyToManyField】" }, 
{ "link": "/post/django-migrate-error/", "title" : "Djangoのマイグレーションのエラー時の対処法" }, 
{ "link": "/post/django-non-nullable/", "title" : "DjangoでYou are Trying to add a non-nullable fieldと表示されたときの対策【makemigrations】" }, 
{ "link": "/post/django-redirect/", "title" : "Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法" }, 
{ "link": "/post/django-scraping/", "title" : "DjangoにPythonスクレイピングを実装した簡易検索エンジンの作り方【BeautifulSoup】" }, 
{ "link": "/post/django-ajax-restful/", "title" : "【Restful】DjangoでAjax(jQuery)を実装する方法【Django REST Framework使用】" }, 
{ "link": "/post/django-comma/", "title" : "Djangoで数値のカンマ区切りを実装させる" }, 
{ "link": "/post/django-dumpdata/", "title" : "DjangoでDBに格納したデータをダンプ(バックアップ)させる【dumpdata】" }, 
];
