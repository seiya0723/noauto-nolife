const SEARCH_LIST = [
{ "link": "/post/django-deploy-heroku/", "title" : "DjangoをDEBUG=FalseでHerokuにデプロイする方法" }, 
{ "link": "/post/python-google-trans-install/", "title" : "【Python】pipで翻訳系ライブラリのgoogletransをインストールする【※バージョン指定しないとエラー】" }, 
{ "link": "/post/javascript-stopwatch-and-timer/", "title" : "JavaScript(jQuery)でストップウォッチとタイマーを作る【勉強や運動の記録などに】" }, 
{ "link": "/post/startup-django/", "title" : "Djangoビギナーが40分で掲示板アプリを作る方法" }, 
{ "link": "/post/django-attr-method-sort/", "title" : "【Django】operatorでモデルのフィールド、メソッドを指定してソーティングをする【ランキングの実装に有効】" }, 
{ "link": "/post/django-custom-user-model-allauth-bbs/", "title" : "【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】" }, 
{ "link": "/post/django-allauth-custom-urls/", "title" : "【Django】allauthのurls.pyをカスタムする【新規アカウント作成、パスワード変更処理の無効化など】" }, 
{ "link": "/post/django-multi-send/", "title" : "【Django】1回のリクエストで複数のデータを投稿する【request.POST.getlist()】" }, 
{ "link": "/post/django-custom-user-model-uuid/", "title" : "DjangoでUUIDを主キーとし、first_nameとlast_nameを1つにまとめたカスタムユーザーモデルを作る【AbstractBaseUserとallauth】" }, 
{ "link": "/post/jquery-ajax-detail/", "title" : "【保存版】Ajax(jQuery)の仕組みと仕様" }, 
{ "link": "/post/javascript-replace-trap/", "title" : "【JavaScript】.replace()で検索した文字列すべてを置換したい場合は正規表現を使う" }, 
{ "link": "/post/django-create-origin-mixin/", "title" : "【Django】自前でLoginRequiredMixinのような物を作るには、dispatchメソッドを使う【多重継承】" }, 
{ "link": "/post/django-allauth-why-not-verify-email/", "title" : "Django-allauthのメールを使用したログイン方式で、アカウント新規作成時、確認URLにアクセスしていないにもかかわらず、ログインできてしまうのはなぜか？" }, 
{ "link": "/post/django-calendar-ui/", "title" : "DjangoでカレンダーのUIを作る" }, 
{ "link": "/post/css3-modal-dialog/", "title" : "CSS3とHTML5だけでモーダルダイアログを作る【JS不要】" }, 
{ "link": "/post/django-openpyxl/", "title" : "【Django】openpyxlでエクセルファイルを新規作成、バイナリでダウンロードする" }, 
{ "link": "/post/flatpickr-install/", "title" : "【日付入力】flatpickrの実装方法(ロケール日本語化、日時入力対応化)" }, 
{ "link": "/post/sendgrid-account-suspended/", "title" : "Sendgridのアカウントが一時的に凍結された場合の対処法と対策" }, 
{ "link": "/post/startup-django-allauth/", "title" : "【メール認証】Django-allauthの実装方法とテンプレート編集【ID認証】" }, 
{ "link": "/post/javascript-memory-weakness/", "title" : "JavaScript(jQuery)で神経衰弱" }, 
{ "link": "/post/django-settings-installed-apps/", "title" : "【Django】settings.pyのINSTALLED_APPSにはどのように書くのが適切か【順番とapps】" }, 
{ "link": "/post/django-createuser-save-method-override/", "title" : "【Django】ユーザー作成時に何らかの処理を行う方法【saveメソッドオーバーライド】" }, 
{ "link": "/post/django-deploy-ubuntu-venv/", "title" : "UbuntuにDjangoをデプロイする【PostgreSQL+Nginx、Virtualenv使用】" }, 
{ "link": "/post/django-many-to-many/", "title" : "Djangoで多対多のリレーションの構造と作り方、テンプレートで表示する方法【ManyToManyField】" }, 
{ "link": "/post/startup-wordpress-ubuntu/", "title" : "UbuntuにWordpressをインストールする【MariaDB+Apache】" }, 
{ "link": "/post/django-admin-custom/", "title" : "Djangoの管理サイト(admin)をカスタムする【全件表示、全フィールド表示、並び替え、画像表示、検索など】" }, 
{ "link": "/post/startup-git/", "title" : "【git/GitHub】コマンドと使い方の一覧" }, 
{ "link": "/post/startup-create-rdd/", "title" : "要件定義書の書き方" }, 
{ "link": "/post/django-templates-extends-and-block/", "title" : "【Django】DTLのextendsとblockを使って、テンプレートを継承をする" }, 
{ "link": "/post/django-login-required-mixin/", "title" : "【Django】未認証ユーザーをログインページにリダイレクトする【LoginRequiredMixinもしくは@login_required】" }, 
{ "link": "/post/django-deploy-heroku-cloudinary/", "title" : "DjangoをHeroku+Cloudinary(基本無料ストレージ)の環境にデプロイする【ウェブアプリのデモを一般公開したい場合などに】" }, 
{ "link": "/post/django-models-delete-and-edit/", "title" : "Djangoで投稿したデータに対して編集・削除を行う【urls.pyを使用してビューに数値型の引数を与える】" }, 
{ "link": "/post/startup-openpyxl/", "title" : "【openpyxl】PythonからExcelファイルを読み書きする" }, 
{ "link": "/post/django-models-foreignkey/", "title" : "Djangoで1対多のリレーションを構築する【カテゴリ指定、コメントの返信などに】【ForeignKey】" }, 
{ "link": "/post/javascript-qrcode/", "title" : "JavaScript(jQuery)でQRコードを表示させる" }, 
{ "link": "/post/django-paginator/", "title" : "Djangoでページネーションを実装する方法【django.core.paginator】【パラメータ両立】" }, 
{ "link": "/post/django-context-processors/", "title" : "【Django】context_processorsを使い、全ページに対して同じコンテキストを提供する【サイドバーのカテゴリ欄、ニュース欄などに有効】" }, 
{ "link": "/post/django-filter-method/", "title" : "【Django】モデルクラスのfilterメソッドで検索・絞り込みをする" }, 
{ "link": "/post/django-fileupload-rename/", "title" : "【Django】ファイルアップロード時にファイル名をリネーム(改名)する" }, 
{ "link": "/post/django-fileupload-limit-size/", "title" : "【Django】アップロードするファイルサイズに上限をセットする【validators】" }, 
{ "link": "/post/django-message-framework/", "title" : "DjangoのMessageFrameworkで投稿とエラーをフロント側に表示する" }, 
{ "link": "/post/django-fileupload/", "title" : "Djangoで画像及びファイルをアップロードする方法【ImageFieldとFileField】【python-magicでMIMEの判定あり】" }, 
{ "link": "/post/django-custom-user-model-mydata-edit/", "title" : "【Django】カスタムユーザーモデルに記録した自分のユーザー情報を編集する【ユーザー情報変更画面に】" }, 
{ "link": "/post/python3-update/", "title" : "UbuntuにインストールされているPythonをアップデートする" }, 
{ "link": "/post/polling-long-polling-websocket-difference/", "title" : "WebSocketとポーリング、ロングポーリングの違い【非同期通信と双方向通信】" }, 
{ "link": "/post/css3-sidebar/", "title" : "CSS3で折りたたみ式のサイドバーを実装させる【checkbox+transition+position】" }, 
{ "link": "/post/django-non-nullable/", "title" : "DjangoでYou are Trying to add a non-nullable fieldと表示されたときの対策【makemigrations】" }, 
{ "link": "/post/jquery-number-form-auto/", "title" : "【jQuery】数値入力フォームを押しっぱなしで入力する仕様に仕立てる" }, 
{ "link": "/post/startup-django-channels-web-socket/", "title" : "【Django】channelsを使ってWebSocketを実現させる【チャットサイト開発に】" }, 
{ "link": "/post/django-session-expire-second-and-browser-close/", "title" : "【Django】セッションの有効期限をセット、もしくはブラウザを閉じた時にセッションを無効化【settings.py】" }, 
{ "link": "/post/leaflet-draw-circle-5000m/", "title" : "【Leaflet.js】半径5km圏内の領域に円を描画する【circle】" }, 
{ "link": "/post/leaflet-overlays/", "title" : "【Leaflet.js】クリックした地図上に画像を配置する【overlays】" }, 
{ "link": "/post/django-models-add-field/", "title" : "【Django】models.pyにフィールドを追加・削除する【マイグレーションできないときの原因と対策も】" }, 
{ "link": "/post/django-ajax-long-polling/", "title" : "【Django】Ajax(jQuery)でロングポーリングを実装させる【チャットサイトの開発に】" }, 
{ "link": "/post/django-custom-user-model-foreignkey/", "title" : "Djangoでカスタムユーザーモデルを外部キーとして指定する方法【1対多】" }, 
{ "link": "/post/startup-web-application-framework/", "title" : "ウェブアプリケーションフレームワークを使う前に知っておきたい知識【Django/Laravel/Rails】" }, 
{ "link": "/post/django-allauth-loginpage/", "title" : "Django-allauthのログインページの装飾を装飾する【テンプレートの追加】" }, 
{ "link": "/post/django-allauth-center-loginpage/", "title" : "Django-allauthにてフォームを中央寄せにさせる【ログインページのテンプレートのカスタマイズ】" }, 
{ "link": "/post/startup-php-nginx-ubuntu/", "title" : "Ubuntu20.04にNginxとPHP7.4をインストールしてHelloWorldをする" }, 
{ "link": "/post/django-ajax-multi-img-upload/", "title" : "【Django】Ajaxで複数枚の画像を一回のリクエストでアップロードする。" }, 
{ "link": "/post/django-or-and-search-revision/", "title" : "【Django】スペース区切りでOR・AND検索を改定する" }, 
{ "link": "/post/leaflet-marker-gps-position/", "title" : "【OSM+leaflet.js】ブラウザからGPS(位置情報)を取得し、マーカーを配置させる" }, 
{ "link": "/post/django-osm-leaflet-mapping-ajax/", "title" : "【Django】Ajaxを使ってOSMとLeaflet.jsでマーカーを配置させる" }, 
{ "link": "/post/django-osm-leaflet-mapping/", "title" : "DjangoでOpenStreetMap(OSM)とleaflet.jsを使ってマッピングアプリを作る" }, 
{ "link": "/post/django-models-datetime-auto-now-add/", "title" : "【Django】DateTimeFieldに自動的に現在時刻を入れるには、auto_now_addもしくはauto_nowフィールドオプションを指定【新規作成時・編集時の時刻】【※編集不可】" }, 
{ "link": "/post/javascript-query-change-and-get-method/", "title" : "JavaScriptでクエリパラメータを書き換え、GETメソッドを送信する【通販サイトなどの絞り込み検索に有効】" }, 
{ "link": "/post/django-foreign-count/", "title" : "【Django】外部キーに対応したデータの個数をカウントして表示【リプライ・コメント数の表示に有効】【annotate+Count】" }, 
{ "link": "/post/django-models-origin-validators/", "title" : "【Django】models.pyにて、オリジナルのバリデーション処理を追加する【validators】【正規表現が通用しない場合等に有効】" }, 
{ "link": "/post/django-foreignkey-user/", "title" : "【Django】ユーザーモデルと1対多のリレーションを組む方法【カスタムユーザーモデル不使用】" }, 
{ "link": "/post/django-year-month-search-and-list/", "title" : "【Django】年月検索と、年別、月別アーカイブを表示させる【最新と最古のデータから年月リストを作成(Trunc不使用)】" }, 
{ "link": "/post/jquery-ajax-postcode/", "title" : "【jQuery】Ajaxで郵便番号検索を行う【通販サイトなどの住所登録に有効】" }, 
{ "link": "/post/django-xmlhttprequest-ajax-not-use-jquery/", "title" : "素のJavaScriptのXMLHttpRequest(Ajax)で通信する【jQuery不使用】" }, 
{ "link": "/post/startup-django-stripe/", "title" : "【Stripe】Djangoにクレジットカード決済機能を実装させる" }, 
{ "link": "/post/linux-commandline-clipboard/", "title" : "Linuxでコマンドラインからクリップボードにコピーする【UbuntuもOK】" }, 
{ "link": "/post/django-forms-validate/", "title" : "【Django】forms.pyでバリデーションをする【モデルを利用したFormクラス】" }, 
{ "link": "/post/django-admin-log-delete/", "title" : "【Django】管理サイト(admin)のログを削除する【DBの使用量削減に】" }, 
{ "link": "/post/django-or-and-search/", "title" : "Djangoでスペース区切りでOR検索、AND検索をする方法【django.db.models.Q】" }, 
{ "link": "/post/django-deploy-linux/", "title" : "DjangoをLinux(Ubuntu)サーバーにデプロイする方法【Nginx+PostgreSQL】" }, 
{ "link": "/post/hugo-install-latest/", "title" : "【HUGO】最新版をインストールして、サイトを作り、テーマを当ててビルドするまで" }, 
{ "link": "/post/startup-netlify/", "title" : "Netlifyと静的サイトジェネレーターHUGOで1ヶ月約100円でブログ運営をする方法【独自ドメイン使用】" }, 
{ "link": "/post/python-google-isbn-api/", "title" : "【Python】GoogleのISBNのAPIを使い、書籍の情報を手に入れる" }, 
{ "link": "/post/django-static-file-settings/", "title" : "【Django】テンプレートからstaticディレクトリに格納したCSSやJSを読み込む【静的ファイル】" }, 
{ "link": "/post/django-star-average/", "title" : "【Django】星の平均をアイコンで表示させる【3.5の時、三星と半星で表示】" }, 
{ "link": "/post/django-admin/", "title" : "Djangoで管理サイトを作り、投稿されたデータの読み・書き・編集・削除を行う【admin.py】" }, 
{ "link": "/post/html-atag-download-attribute/", "title" : "【HTML】ダウンロードのダイアログを表示させたい場合、aタグにはdownload属性を付与する" }, 
{ "link": "/post/django-filefield-only-filename/", "title" : "【Django】FilefieldやImageFieldでファイル名だけを表示させる方法【モデルにメソッドを追加】" }, 
{ "link": "/post/django-essential-python/", "title" : "Djangoをやる前に知っておきたいPython構文【オブジェクト指向(class文)と別ファイル読み込み(import文)は特に重要】" }, 
{ "link": "/post/jquery-number-form/", "title" : "【jQuery】数値入力フォームをボタンで入力する仕様に仕立てる" }, 
{ "link": "/post/django-rest-framework-changing/", "title" : "【Restful化】DjangoRestframeworkの導入・移行作業【ビュークラス継承元の書き換え、Serializerの運用】" }, 
{ "link": "/post/django-rest-framework-need-ajax/", "title" : "DjangoRestFrameworkは本当に必要なのか？【Restful化とAjaxでデータを送信するときの問題】" }, 
{ "link": "/post/heroku-origin-domain/", "title" : "Herokuの無料プランで独自ドメインを設定し、HTTPS通信を行う方法【ムームードメイン+Cloudflare】" }, 
{ "link": "/post/django-models-query/", "title" : "【Django】実行されるクエリ(SQL)を確認する【.query】" }, 
{ "link": "/post/jquery-ymd-search/", "title" : "【jQuery】selectタグで年月日検索をする【うるう年対応】" }, 
{ "link": "/post/startup-ubuntu-docker/", "title" : "UbuntuでUbuntuのdockerイメージを作るまで" }, 
{ "link": "/post/docker-image-file-share/", "title" : "dockerのイメージファイルを出力し(docker save)、出力されたファイルを読み込む(docker load)" }, 
{ "link": "/post/css3-star-review-radio/", "title" : "HTML5とCSS3だけでAmazon風の星レビューのフォームを再現する【ホバーした時、ラジオボタンのチェックされた時に星を表示】【flex-direction:row-reverseで逆順対応可】" }, 
{ "link": "/post/django-models-choices/", "title" : "Djangoのモデルにて指定された選択肢をセットし、それだけ入力を許可する【choicesフィールドオプションで都道府県の指定をする】" }, 
{ "link": "/post/django-thereafter-timezone-now/", "title" : "Djangoで現在時刻以降の日時入力を促すのであれば、MinValueValidatorを使用する【DateTimeField】" }, 
{ "link": "/post/django-deploy-docker-centos/", "title" : "docker上のCentOS(NginxとPostgreSQL)にDjangoをデプロイさせる" }, 
{ "link": "/post/startup-postgresql/", "title" : "PostgreSQLインストールから、ユーザーとDBを作る" }, 
{ "link": "/post/django-drf-api/", "title" : "Django Rest Frameworkにて、APIを提供する" }, 
{ "link": "/post/django-admin-save-method/", "title" : "【Django】管理サイトで保存した時、何か処理(メール送信など)を実行して欲しい時【saveメソッドオーバーライドは通用しない】" }, 
{ "link": "/post/django-method-put-delete-patch/", "title" : "【Django】PUT、PATCH、DELETEメソッドのリクエストを送信する【Django REST Framework】" }, 
{ "link": "/post/django-view-def-and-class/", "title" : "【Django】ビュー関数とビュークラスの違い、一覧と使い方" }, 
{ "link": "/post/element-tube/", "title" : "【PR】ElementTube 一般公開" }, 
{ "link": "/post/django-sendgrid/", "title" : "DjangoでSendgridを実装させる方法【APIキーと2段階認証を利用する】" }, 
{ "link": "/post/django-error-messages-origin/", "title" : "【Django】任意のエラーメッセージを表示させる【forms.pyでerror_messagesを指定】" }, 
{ "link": "/post/django-allauth-custom-user-model-sendgrid/", "title" : "【Django】allauthを使用し、カスタムユーザーモデルを搭載させ、SendgridのAPIでメール認証をする簡易掲示板【保存版】" }, 
{ "link": "/post/startup-mogrify/", "title" : "mogrifyコマンドを使って画像を一括クロップ(トリミング)する" }, 
{ "link": "/post/django-secure-subprocess/", "title" : "Djangoでpython3のsubprocessモジュールを使い、任意のコマンドをなるべく安全に配慮して実行させる" }, 
{ "link": "/post/django-control-cookie/", "title" : "【Django】Cookieをサーバーサイドで操作する" }, 
{ "link": "/post/django-add-context/", "title" : "【Django】ビュークラスの継承を使い、予めcontextを追加させる" }, 
{ "link": "/post/django-auth-not-allauth/", "title" : "【Django】allauth未使用でユーザー認証機能を実装した簡易掲示板【ログインとログアウトのみ】" }, 
{ "link": "/post/chartjs-responsive-chart/", "title" : "chart.jsでグラフ表示幅と高さを指定する。" }, 
{ "link": "/post/django-admin-custom-form/", "title" : "Djangoの管理サイト(admin)のフォームをforms.pyを使用してカスタムする【文字列入力フォームをtextareaタグで表現】" }, 
{ "link": "/post/django-template-integer-for-loop/", "title" : "【Django】テンプレートで数値を使用したforループを実行する方法【レビューの星のアイコン表示などに有効】" }, 
{ "link": "/post/laravel-heroku-cloudinary-deploy/", "title" : "LaravelをCloudinaryを使用したHerokuにデプロイ、画像やファイルをアップロードする" }, 
{ "link": "/post/laravel-env-check/", "title" : "Laravelで.env(環境変数)に指定した値をチェックする方法【コントローラ・ビュー】" }, 
{ "link": "/post/laravel-fileupload/", "title" : "Laravelで画像とファイルをアップロードする" }, 
{ "link": "/post/laravel8-route-error/", "title" : "Laravel 8.x系のroute/web.phpはこう書く【Target class [Controller Name] does not exist.】" }, 
{ "link": "/post/laravel-m2m-foreignkey/", "title" : "Laravelで1対多、多対多のリレーションを作る【トピックに対してコメントの投稿、トピックタグの指定】" }, 
{ "link": "/post/form-tags-onsubmit/", "title" : "HTMLのformタグで送信(submit)をする際に、確認をとった上で送信を行う【onsubmit属性】" }, 
{ "link": "/post/laravel8-paginator-svg/", "title" : "Laravel8.xでページネーターのSVGの矢印がおかしいので修正する。" }, 
{ "link": "/post/laravel-to-resource/", "title" : "Laravelで--resourceで作ったコントローラのルーティングを解体する" }, 
{ "link": "/post/laravel-search-paginate/", "title" : "Laravelで検索とページネーションを両立させる【ANDとOR検索も】" }, 
{ "link": "/post/laravel-database-regenerate/", "title" : "【Laravel】Sqliteのデータベースファイルをワンライナーで再生成する【findコマンド+-exec評価式+alias】【migrate:fresh】" }, 
{ "link": "/post/laravel-crud-restful/", "title" : "初心者でもlaravel 7.x を使い、45分でCRUD簡易掲示板を作る【Restful対応】" }, 
{ "link": "/post/laravel-heroku-deploy-php-version-error/", "title" : "LaravelのHerokuデプロイがPHPバージョン問題で必ず失敗する問題は、バージョンアップで対処する【ERROR: Dependency installation failed!】" }, 
{ "link": "/post/startup-vba/", "title" : "VBAでHelloWorld、セルの色変え、計算などの基本操作をやってみる【LibreOffice】" }, 
{ "link": "/post/github-token-generate/", "title" : "【GitHub】gitコマンドでリモートリポジトリへプッシュするためのトークンをジェネレートする" }, 
{ "link": "/post/django-dumpdata/", "title" : "DjangoでDBに格納したデータをダンプ(バックアップ)させる【dumpdata】" }, 
{ "link": "/post/django-rest-framework-listfield/", "title" : "【DRF】Django Rest Frameworkでリスト型のバリデーションも行う【UUIDや文字列を格納したリスト型のバリデーションに】" }, 
{ "link": "/post/windows-taskscheduler/", "title" : "WindowsのタスクスケジューラーでPythonスクリプトを実行させる【スクレイピングの予約実行などに】" }, 
{ "link": "/post/django-forms-save-model-object-id/", "title" : "【Django】Modelクラス、Formクラス、もしくはSerializerクラスのsaveメソッドで保存した後、保存したモデルオブジェクトのIDを手に入れる方法【データ保存した後、関連するデータも追加したい場合】" }, 
{ "link": "/post/django-request-meta/", "title" : "【Django】requestオブジェクトからクライアントのUAやIPアドレス、CSRFCookieなどをチェック、テンプレート上に表示する。" }, 
{ "link": "/post/startup-chartjs/", "title" : "【JavaScript】Chart.jsでグラフを描画する【棒グラフ、円グラフ、折れ線グラフ】" }, 
{ "link": "/post/favicon-404/", "title" : "サイトのアイコンを指定して、Favicon 404 NotFound問題を解決する【フリー素材使用】" }, 
{ "link": "/post/laravel-sendgrid/", "title" : "LaravelでSendgridを使ってメール送信【認証・通知に、ライブラリのインストールは不要】" }, 
{ "link": "/post/leaflet-marker-delete/", "title" : "【Leaflet.js】地図をクリックしてマーカーを配置した時、古いマーカーを削除する" }, 
{ "link": "/post/django-templates-extends/", "title" : "【Django】簡易掲示板に折りたたみ式サイドバーを実装させる【extends】" }, 
{ "link": "/post/leaflet-marker-original-icon/", "title" : "【Leaflet.js】オリジナルのアイコン画像を使用して、地図上に表示させる【飲食店のマッピングであれば食べ物の画像を使って視認性UP】" }, 
{ "link": "/post/laravel-heroku-deploy/", "title" : "LaravelをHerokuにデプロイする【Heroku-postgresql使用】" }, 
{ "link": "/post/laravel-deploy-after-https-force/", "title" : "【Laravel】Herokuにデプロイした後、URLをhttpsにする【デフォルトではhttpから始まるため、クライアントのブラウザが静的ファイルの読み込みに失敗する問題の対策】" }, 
{ "link": "/post/laravel-static-files/", "title" : "【Laravel】CSSやJS等の静的ファイルを読み込む【public/static/】" }, 
{ "link": "/post/laravel-public-dirname-caution/", "title" : "【Laravel】静的ファイルのディレクトリ作るときの注意点【publicのディレクトリ名で即404エラー】" }, 
{ "link": "/post/vim-laravel-autoindent/", "title" : "VimでLaravelのビューを書いているとき、オートインデントが発動しない問題を対処する【.vimrc】" }, 
{ "link": "/post/pycharm-config/", "title" : "Pycharmを使う前にやっておきたい設定と覚えておくと良い操作方法" }, 
{ "link": "/post/python-requests-post-method/", "title" : "【Python】requestsライブラリを使用して、DjangoにPOSTメソッドのHTTPリクエストを送信する(管理サイトへのログイン)【セッションを維持してCSRF問題の対策】" }, 
{ "link": "/post/python-brackets/", "title" : "Pythonの角括弧と丸括弧の違い、丸括弧を使う場合の注意点【()と[]、タプル型とリスト型】" }, 
{ "link": "/post/laravel-ipaddress/", "title" : "【Laravel】IPアドレスを取得して、DBへ記録する【犯罪・不正利用の抑止、荒らし対策などに】" }, 
{ "link": "/post/laravel-notnull-exception/", "title" : "【Laravel】マイグレーション時の『Cannot add a NOT NULL column with default value NULL』問題を対処する【エラー】" }, 
{ "link": "/post/laravel-essential-php/", "title" : "Laravelに必要なPHP構文【if,for,function,class,型変換、配列操作など】" }, 
{ "link": "/post/laravel-overview/", "title" : "Laravelの全体像、ファイル・ディレクトリごとの役割と関係性を俯瞰する【各コンポーネントごとに解説】" }, 
{ "link": "/post/startup-laravel/", "title" : "Laravelビギナーが30分で掲示板アプリを作る方法" }, 
{ "link": "/post/laravel-project-rename/", "title" : "Laravelのプロジェクト名を書き換える【設定に依存していないのであれば、普通にディレクトリ名を書き換えるだけでOK】" }, 
{ "link": "/post/laravel-artisan-command/", "title" : "Laravelのartisanコマンドのまとめ【開発用サーバー立ち上げ、コントローラやマイグレーションファイル等の作成、ルーティングの確認などに】" }, 
{ "link": "/post/laravel-log/", "title" : "laravelで開発中、ログを表示させる【エラー箇所の確認・デバッグ作業に】" }, 
{ "link": "/post/laravel-validate/", "title" : "【Request】Laravelでリクエストのバリデーションを行う【不適切なデータのチェックに】" }, 
{ "link": "/post/vscode-config/", "title" : "VisualStudioCode(VScode)を使う前にやっておきたい設定と覚えておくと良い操作方法" }, 
{ "link": "/post/share-link/", "title" : "HUGOでSNS等のシェアリンク(シェアボタン)をブログ内に配置して、PVを増やす【Twitter、Facebook、はてなブログ、LINE】" }, 
{ "link": "/post/django-loaddata/", "title" : "Djangoで開発中、データベースへ初期データを入力する【バックアップしたデータをloaddataコマンドでリストア】" }, 
{ "link": "/post/vim-comment-settings/", "title" : "Vimのコメントの自動補完を無効化させる【JavaScriptやCSS、シェルスクリプトでコメントアウトした後、Enter押すと自動で出てくるアレ】" }, 
{ "link": "/post/django-request-get-and-post/", "title" : "【Django】formタグを使ってHTTPリクエストのGETメソッド、POSTメソッドを送信する" }, 
{ "link": "/post/django-ajax/", "title" : "DjangoでAjax(jQuery)を実装、送信と同時に投稿内容を確認する【Django Rest Framework不使用版】" }, 
{ "link": "/post/django-models-do-not-set-table-name/", "title" : "【Django】複数のアプリを作る場合、models.pyのモデルクラスにテーブル名を指定するべきではない【重複問題】" }, 
{ "link": "/post/django-shell/", "title" : "Djangoのインタラクティブシェルを使う【python3 manage.py shell】" }, 
{ "link": "/post/startup-geodjango/", "title" : "【地理空間情報】GeoDjangoの実装方法【PostGIS+PostgreSQL+国土地理院データ】" }, 
{ "link": "/post/django-templates-language/", "title" : "【Django】開発を始める上で最初に覚えておいたほうがよい Django Templates Language(DTL)" }, 
{ "link": "/post/django-canvas-send-img-by-ajax/", "title" : "【Django】canvasで描画した画像をAjax(jQuery)で送信【お絵かきBBS、イラストチャット、ゲームのスクショ共有などに】" }, 
{ "link": "/post/startup-pandas-openpyxl-matplotlib/", "title" : "【データ分析】pandasの基本的な使い方、グラフ描画、ファイル読み書き、計算等【バックエンドにopenpyxlとmatplotlibを使う】" }, 
{ "link": "/post/laravel-ajax/", "title" : "laravelでAjax(jQuery)を送信する【POST+DELETE】" }, 
{ "link": "/post/django-model-objects-for-in-zip/", "title" : "【Django】要素数が同じモデルオブジェクトをDTLで一緒にループして表示させる【.annotate()やモデルクラスにメソッドを追加などが通用しない場合の対策】" }, 
{ "link": "/post/css3-tab-system/", "title" : "CSS3とHTML5だけでタブを作り、複数のページを表示させる【JS不要】" }, 
{ "link": "/post/django-post-request/", "title" : "DjangoでHTTPリクエストのPOSTメソッドを送信する" }, 
{ "link": "/post/django-anti-scraping/", "title" : "Djangoでスクレイピング対策をする【MIDDLEWAREでUA除外、ランダムでHTML構造変化等】" }, 
{ "link": "/post/django-http-response/", "title" : "Djangoで任意のHTTPレスポンス(ForbiddenやNotFoundなど)を返却する【HttpResponse subclasses】" }, 
{ "link": "/post/django-deploy-heroku-cloudinary-file-reference/", "title" : "【Django】Heroku+Cloudinaryの環境にアップロードしたファイルを参照する方法【MIMEとサイズ】" }, 
{ "link": "/post/cloudinary-blocked-for-delivery/", "title" : "CloudinaryでPDF等の画像や動画以外のファイルをアップロードし、共有する方法【blocked for delivery】" }, 
{ "link": "/post/startup-django-helloworld/", "title" : "DjangoでHelloWorld【HttpResponse及びレンダリング】" }, 
{ "link": "/post/raspberypi-zero-limit-access/", "title" : "Raspberry Pi Zeroに搭載したNginxの限界を試す【curlコマンド】" }, 
{ "link": "/post/nginx-deny-ip-address/", "title" : "Nginxで特定IPアドレスのリクエストを拒否する" }, 
{ "link": "/post/javascript-carousel-origin-slider/", "title" : "【jQuery】ボタン式の横スライダーを自作する【通販サイト・コンテンツ共有サイトなどに】" }, 
{ "link": "/post/django-ajax-thumbnail-upload/", "title" : "Djangoで動画投稿時にサムネイルもセットでアップロードする【DRF+Ajax(jQuery)+canvas】" }, 
{ "link": "/post/nginx-log-check-by-awk/", "title" : "Nginxのログをawkコマンドを使用して調べる【crontabで特定の条件下のログを管理者へ報告】" }, 
{ "link": "/post/django-admin-protect/", "title" : "【Django】デプロイ後に管理サイトを管理者以外がアクセスできないようにする【UUID+MIDDLEWAREによるURL複雑化とIPアドレス制限】" }, 
{ "link": "/post/recaptcha-setting/", "title" : "独自ドメインのサイトにreCAPTCHAを実装させる方法と仕組み【ボット対策】" }, 
{ "link": "/post/shellscript-auto-backup/", "title" : "リモートサーバーのデータを自動的にバックアップする方法論【scp+crontab】" }, 
{ "link": "/post/startup-server-manage/", "title" : "サーバーを本格的に運用するようになったらやること・守ること" }, 
{ "link": "/post/shellscript-server-checker/", "title" : "シェルスクリプトでウェブサーバーの応答不能・ステータスコードをチェックして記録・通知する【pingとcurl、即メール送信にも有効】" }, 
{ "link": "/post/uuid-generate/", "title" : "UUIDを生成するコマンドuuidgen【予測されたくないページのURL割り当て等】" }, 
{ "link": "/post/nginx-log-check/", "title" : "Nginxのログをチェックする、ログの出力設定を変更する" }, 
{ "link": "/post/laravel-gitignore-add/", "title" : "【Laravel】GitHubにプッシュする時.gitignoreに追加する必要のあるファイル、ディレクトリ" }, 
{ "link": "/post/django-secret-key-regenerate/", "title" : "【Django】settings.pyのSECRET_KEYを再発行(リジェネレート)する【alias登録で即生成・即実装からの再起動】" }, 
{ "link": "/post/django-sendgrid-processing/", "title" : "【Django+Sendgrid】サーバー処理中(ビュー、独自コマンド)に通知メール(To,CC,BCC)を送信する" }, 
{ "link": "/post/laravel-migrations-files-detect/", "title" : "【Laravel】コマンドからマイグレーションファイルを立ち上げる時、こうすればうまく行く【ワイルドカードとTabキー】" }, 
{ "link": "/post/startup-ubuntu2004-server/", "title" : "サーバー版Ubuntu 20.04のインストールから設定、SSHログインまで【固定IPアドレス、タイムゾーン、bashrcなど】" }, 
{ "link": "/post/django-jumanpp-trend/", "title" : "【形態素解析】DjangoとJUMAN++を使ってトレンドワード(名詞のみ)を表示する【定期実行で1時間以内に投稿された内容を学習などに】" }, 
{ "link": "/post/django-deploy-ec2-origin-domain/", "title" : "【Django+AWS】独自ドメインを割り当てHTTPS通信を実現した状態で、EC2(Ubuntu+Nginx)へデプロイする" }, 
{ "link": "/post/django-show-ip-ua-gateway/", "title" : "DjangoでサイトにアクセスしたクライアントのIPアドレス、ユーザーエージェント(UA)、プロバイダ名(ゲートウェイ名)を表示する【犯罪・不正行為の抑止とセキュリティ】" }, 
{ "link": "/post/django-deploy-ec2/", "title" : "DjangoをAWSのEC2(Ubuntu)にデプロイする" }, 
{ "link": "/post/aws-do-not-spend-money/", "title" : "AWSでなるべくお金がかからないようにウェブアプリを運用する方法" }, 
{ "link": "/post/django-distinct-on-sqlite/", "title" : "【Django】SQLiteでも特定フィールドに対してのdistinctっぽい事(重複除去)を行う【通常はPostgreSQLのみ有効】" }, 
{ "link": "/post/ec2-origin-domain-https/", "title" : "【AWS】EC2にムームドメインで取得した独自ドメインを割り当て、HTTPS通信を行う【Route 53 + Certificate Manager + ロードバランサ(ELB)】" }, 
{ "link": "/post/django-custom-template-tags-hashtags/", "title" : "【Django】カスタムテンプレートタグ(フィルタ)でリンク付きのハッシュタグを実現する。【#から始まる正規表現】" }, 
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
{ "link": "/post/django-id-list-filter/", "title" : "Djangoで主キーのリスト型を作り、合致するレコードを検索する【values_list + filter】" }, 
{ "link": "/post/javascript-download-csv/", "title" : "Javascriptを使ってCSVを生成してダウンロードする" }, 
{ "link": "/post/django-models-autofield-warnings/", "title" : "Djangoでマイグレーションした時、『Auto-created primary key used when not defining a primary key type』と警告される場合の対策" }, 
{ "link": "/post/django-deploy-ec2-rds-s3/", "title" : "DjangoをEC2(Ubuntu)、RDS(PostgreSQL)、S3の環境にデプロイをする" }, 
{ "link": "/post/ubuntu-ssh/", "title" : "UbuntuにSSHでリモートログインする方法【パスワード認証+公開鍵認証+scpコマンド】" }, 
{ "link": "/post/django-m2m-form/", "title" : "【Django】一対多、多対多のリレーションでforms.pyを使ったバリデーションとフォームを表示" }, 
{ "link": "/post/django-m2m-usermodel/", "title" : "【Django】カスタムユーザーモデルでユーザーブロック機能を実装させる【ManyToManyFieldでユーザーモデル自身を指定】" }, 
{ "link": "/post/django-m2m-through/", "title" : "【django】ManyToManyFieldでフィールドオプションthroughを指定、中間テーブルを詳細に定義する【登録日時など】" }, 
{ "link": "/post/virtualbox-ubuntu-install/", "title" : "VirtualBoxにUbuntuをインストールする" }, 
{ "link": "/post/ubuntu1804-settings/", "title" : "【保存版】Ubuntu18.04をインストールした後に真っ先にやる16の設定" }, 
{ "link": "/post/django-custom-template-tags-vs-before-view-calc/", "title" : "【Django】views.pyの事前処理 VS (埋め込み型)カスタムテンプレートタグ・フィルタ" }, 
{ "link": "/post/js-video-controller/", "title" : "video.jsを実装させ、コントローラをカスタムする【Brightcove Player】" }, 
{ "link": "/post/django-batch-thumbnail-create/", "title" : "【Django】バッチ処理でPS、AI(PDF)ファイルのサムネイルを自動生成させる【BaseCommand】" }, 
{ "link": "/post/django-aips-thumbnail-autocreate/", "title" : "Djangoでアップロードされた.aiと.psファイルのサムネイルを自動生成させる【PhotoShop,Illustrator】" }, 
{ "link": "/post/django-custom-template-tags-color/", "title" : "【Django】16進カラーコードから色名に書き換えるフィルタを自作する【カスタムテンプレートフィルタ】" }, 
{ "link": "/post/django-allauth-custom-user-model/", "title" : "Djangoにカスタムユーザーモデルを実装させる【AbstractUserとallauth】" }, 
{ "link": "/post/startup-npm-install/", "title" : "Ubuntu18.04にnode.jsとnpm、vue-cliをインストールする" }, 
{ "link": "/post/django-paginator-custom/", "title" : "【django.core.paginator】一度に2ページ以上ジャンプできるように改良する【inclusion_tag()】" }, 
{ "link": "/post/django-custom-template-tags/", "title" : "Djangoで埋め込みカスタムテンプレートタグを実装する方法" }, 
{ "link": "/post/django-reference-models-option/", "title" : "Djangoでviews.pyからmodels.pyのフィールドオプションを参照する【verbose_name,upload_to】" }, 
{ "link": "/post/jquery-to-javascript/", "title" : "jQueryのコードをJavascriptに書き換える【セレクタ、属性値の参照、イベントなど】" }, 
{ "link": "/post/django-makemigrations-not-applied/", "title" : "Djangoでmakemigrationsコマンドを実行しても、No changes detectedと言われる場合の対処法" }, 
{ "link": "/post/laravel-ubuntu-deploy/", "title" : "LaravelをUbuntuにデプロイする【Nginx+PostgreSQL】" }, 
{ "link": "/post/nomodal-edit-form/", "title" : "【Slack風】モーダルダイアログ無し、ページ遷移無しで編集フォームを作る【JS不使用】" }, 
{ "link": "/post/fontawesome-image-select/", "title" : "FontAwesomeや画像を選択できるプルダウンメニュー【JS不使用】" }, 
{ "link": "/post/hugo-js-search-system/", "title" : "HUGOにシェルスクリプトとJavaScriptの記事検索機能を実装させる" }, 
{ "link": "/post/javascript-cookie/", "title" : "JavascriptからCookieを扱う【動画の設定音量の記録と読み込み】" }, 
{ "link": "/post/django-forms-temp-not-use/", "title" : "Djangoのforms.pyが提供するフォームテンプレートは使わない" }, 
{ "link": "/post/startup-sqlite3/", "title" : "SQLiteの操作方法【テーブル一覧表示、SQLなど】" }, 
{ "link": "/post/selenium-read-profile/", "title" : "SeleniumでFirefoxブラウザのプロファイルを読み込む【Recaptcha突破、Cookie+アドオン読み込み】" }, 
{ "link": "/post/django-batch-opencv/", "title" : "【Django】バッチ処理のOpenCVが撮影した画像をDBに保存する" }, 
{ "link": "/post/laravel-uuid/", "title" : "Laravelで主キーにUUIDを実装させる方法【laravel-eloquent-uuid】" }, 
{ "link": "/post/cloud9-first-config/", "title" : "【AWS】Cloud9使う時にすぐやる設定【bashrc、Django等】" }, 
{ "link": "/post/laravel-heroku-405-error/", "title" : "Ajax搭載したLaravelをHerokuにデプロイした時、405エラーが出る問題の解決【method not allowed】" }, 
{ "link": "/post/fileupload-error/", "title" : "【Nginx】1MB以上のファイルアップロードが出来ない場合の対処法" }, 
{ "link": "/post/django-command-add/", "title" : "【Django】manage.pyコマンドを追加させる【バッチ処理、常駐プログラムなどに】" }, 
{ "link": "/post/laravel-command-ubuntu/", "title" : "laravelコマンドをUbuntuで実行可能にする方法" }, 
{ "link": "/post/vuejs-todo-crud/", "title" : "Vue.jsでTODOを作る【CRUD】" }, 
{ "link": "/post/django-args-kwargs/", "title" : "DjangoやPythonにおける*argsと**kwargsとは何か" }, 
{ "link": "/post/django-models-regex-validate/", "title" : "【Django】モデルフィールドに正規表現によるバリデーションを指定する【カラーコード・電話番号に有効】" }, 
{ "link": "/post/nonjs-pagespeed/", "title" : "JavaScriptほぼ不使用のサイトを作ってGoogle PageSpeed Insightsでスコアを調べてみた" }, 
{ "link": "/post/vuejs-modal/", "title" : "Vue.jsでモーダルダイアログを作る" }, 
{ "link": "/post/jquery-autocomplete/", "title" : "jQueryでオートコンプリート(入力補正)を実装させる【表記ゆれ対策にも有効】" }, 
{ "link": "/post/css3-accordion/", "title" : "CSS3だけで実装できるアコーディオン【checkbox+transition】" }, 
{ "link": "/post/css3-animation/", "title" : "CSS3を使用した簡単アニメーションの実装【transitionとtransform】" }, 
{ "link": "/post/css3-deep-bg/", "title" : "【CSS3】スクロール時に奥行きを感じる背景(background)の作り方" }, 
{ "link": "/post/css3-textborder/", "title" : "【CSS3】文字に縁取りを加えて視認性UPさせる方法【text-shadow】" }, 
{ "link": "/post/css3-toggle-switch/", "title" : "CSS3でiOS風のトグルスイッチを作る方法【transition+checkbox】" }, 
{ "link": "/post/heroku-postgres-settings/", "title" : "Herokuのデータベース(herokupostgres)の実装と設定方法【Hobby-Plan】" }, 
{ "link": "/post/drf-ajax-fileupload/", "title" : "DRF(Django REST Framework)+Ajax(jQuery)で画像とファイルをアップロードする方法" }, 
{ "link": "/post/django-templates-include/", "title" : "Django Templates Language(DTL)でincludeを実行する時に引数も与える" }, 
{ "link": "/post/django-id-to-uuid/", "title" : "Djangoでデフォルト数値型のid(主キー)からUUID型にする【データ移行】" }, 
{ "link": "/post/django-m2m-restful/", "title" : "Djangoで多対多のリレーションを含むデータをAjax(jQuery)+DRFで送信させる" }, 
{ "link": "/post/django-migrate-error/", "title" : "Djangoのマイグレーションのエラー時の対処法" }, 
{ "link": "/post/django-redirect/", "title" : "Djangoで『このページを表示するにはフォームデータを..』と言われたときの対処法" }, 
{ "link": "/post/django-scraping/", "title" : "DjangoにPythonスクレイピングを実装した簡易検索エンジンの作り方【BeautifulSoup】" }, 
{ "link": "/post/django-ajax-restful/", "title" : "【Restful】DjangoでAjax(jQuery)を実装する方法【Django REST Framework使用】" }, 
{ "link": "/post/django-comma/", "title" : "Djangoで数値のカンマ区切りを実装させる" }, 
];
