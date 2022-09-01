---
title: "jQueryでオートコンプリート(入力補正)を実装させる【表記ゆれ対策にも有効】"
date: 2020-10-29T16:52:35+09:00
draft: false
thumbnail: "images/jquery.jpg"
categories: [ "フロントサイド" ]
tags: [ "jQuery","tips","JavaScript" ]
---


ウェブアプリを作って、ユーザーに何かを文字列を入力させる時、大抵表記ゆれが起こる。

例えば、JAと農業協同組合と農協、ラズパイとラズベリーパイとRaspberry Piとraspberry piなど。

このような表記ゆれを一度でも許すと、検索で引っかからなくなる。しかし、SELECTタグを使うと、項目が増えた時、選択に時間がかかりすぎる。

そこで、文字入力(入力補正)と選択が同時にできるオートコンプリートをjQueryで用意した。有効に利用していきたい。


## 実装方法

まず、HTMLから。

    <div class="uio-comp">
        <input class="uio-comp_input" type="text">
        <div class="uio-comp_button"></div>
        <div class="uio-comp_menu">
            <div class="uio-comp_option">候補1</div>
            <div class="uio-comp_option">候補2</div>
            <div class="uio-comp_option">候補3</div>
        </div>
    </div>


CSS3で装飾

    .uio-comp {
        width:100%;
        position:relative;
        margin:0.25rem 0;
    }
    .uio-comp_input {
        width:100%;
        font-size:1.5rem;
        height:3rem;
        box-sizing:border-box;
        padding-left:0.5rem;
        border:solid 0.2rem orange;
        position:relative;
    }
    .uio-comp_button {
        position:absolute;
        top:0;
        right:0;
        width:3rem;
        height:3rem;
        border:solid 0.2rem orange;
        background:orange;
    
        box-sizing:border-box;
        cursor:pointer;
        transition:0.25s;
    }
    .uio-comp_button::after {
        content:"";
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        border-top:solid 0.75rem white;
        border-left:solid 0.75rem transparent;
        border-right:solid 0.75rem transparent;
        transition:0.25s;
    }
    .uio-comp_button:hover{
        background:white;
        transition:0.25s;
    }
    .uio-comp_button:hover::after{
        border-top:solid 0.75rem orange;
        transition:0.25s;
    }
    .uio-comp_menu {
        width:calc(100% - 3rem) ;
        font-size:1.5rem;
        border:solid 0.2rem orange;
        box-sizing:border-box;
        
        position:absolute;
        transform: translateY(-0.2rem);
        z-index:1;
    
        max-height:15rem;
        overflow:visible scroll;
    
        display:none;
    }
    .uio-comp_option {
        width:100%;
        padding-left:0.5rem;
        cursor:pointer;
        display:none;
        background:whitesmoke;
        box-sizing:border-box;
    }
    .uio-comp_option:hover {
        color:white;
        background:orange;
    }


次、JavaScript(jQuery)

    window.addEventListener("load" , function (){
    
        var $demo_elem  = $(".ui_demo_area");
        var $ex_elem    = $(".ui_explain_area");
        var $demo_child = $demo_elem.children();
    
        for ( let i=0 ; i< $demo_child.length ; i++){
            $ex_elem[i].innerText = $demo_child[i].className;
        }
    
        const country = ["アイスランド","アイルランド","アゼルバイジャン","アフガニスタン","アメリカ合衆国","アメリカ領ヴァージン諸島","アメリカ領サモア","アラブ首長国連邦","アルジェリア","アルゼンチン","アルバ","アルバニア","アルメニア","アンギラ","アンゴラ","アンティグア・バーブーダ","アンドラ","イエメン","イギリス","イギリス領インド洋地域","イギリス領ヴァージン諸島","イスラエル","イタリア","イラク","イラン|イラン・イスラム共和国","インド","インドネシア","ウォリス・フツナ","ウガンダ","ウクライナ","ウズベキスタン","ウルグアイ","エクアドル","エジプト","エストニア","エチオピア","エリトリア","エルサルバドル","オーストラリア","オーストリア","オーランド諸島","オマーン","オランダ","ガーナ","カーボベルデ","ガーンジー","ガイアナ","カザフスタン","カタール","合衆国領有小離島","カナダ","ガボン","カメルーン","ガンビア","カンボジア","北マリアナ諸島","ギニア","ギニアビサウ","キプロス","キューバ","キュラソー島|キュラソー","ギリシャ","キリバス","キルギス","グアテマラ","グアドループ","グアム","クウェート","クック諸島","グリーンランド","クリスマス島 (オーストラリア)|クリスマス島","グルジア","グレナダ","クロアチア","ケイマン諸島","ケニア","コートジボワール","ココス諸島|ココス（キーリング）諸島","コスタリカ","コモロ","コロンビア","コンゴ共和国","コンゴ民主共和国","サウジアラビア","サウスジョージア・サウスサンドウィッチ諸島","サモア","サントメ・プリンシペ","サン・バルテルミー島|サン・バルテルミー","ザンビア","サンピエール島・ミクロン島","サンマリノ","サン・マルタン (西インド諸島)|サン・マルタン（フランス領）","シエラレオネ","ジブチ","ジブラルタル","ジャージー","ジャマイカ","シリア|シリア・アラブ共和国","シンガポール","シント・マールテン|シント・マールテン（オランダ領）","ジンバブエ","スイス","スウェーデン","スーダン","スヴァールバル諸島およびヤンマイエン島","スペイン","スリナム","スリランカ","スロバキア","スロベニア","スワジランド","セーシェル","赤道ギニア","セネガル","セルビア","セントクリストファー・ネイビス","セントビンセント・グレナディーン|セントビンセントおよびグレナディーン諸島","セントヘレナ・アセンションおよびトリスタンダクーニャ","セントルシア","ソマリア","ソロモン諸島","タークス・カイコス諸島","タイ王国|タイ","大韓民国","台湾","タジキスタン","タンザニア","チェコ","チャド","中央アフリカ共和国","中華人民共和国|中国","チュニジア","朝鮮民主主義人民共和国","チリ","ツバル","デンマーク","ドイツ","トーゴ","トケラウ","ドミニカ共和国","ドミニカ国","トリニダード・トバゴ","トルクメニスタン","トルコ","トンガ","ナイジェリア","ナウル","ナミビア","南極","ニウエ","ニカラグア","ニジェール","日本","西サハラ","ニューカレドニア","ニュージーランド","ネパール","ノーフォーク島","ノルウェー","ハード島とマクドナルド諸島","バーレーン","ハイチ","パキスタン","バチカン|バチカン市国","パナマ","バヌアツ","バハマ","パプアニューギニア","バミューダ諸島|バミューダ","パラオ","パラグアイ","バルバドス","パレスチナ","ハンガリー","バングラデシュ","東ティモール","ピトケアン諸島|ピトケアン","フィジー","フィリピン","フィンランド","ブータン","ブーベ島","プエルトリコ","フェロー諸島","フォークランド諸島|フォークランド（マルビナス）諸島","ブラジル","フランス","フランス領ギアナ","フランス領ポリネシア","フランス領南方・南極地域","ブルガリア","ブルキナファソ","ブルネイ|ブルネイ・ダルサラーム","ブルンジ","ベトナム","ベナン","ベネズエラ|ベネズエラ・ボリバル共和国","ベラルーシ","ベリーズ","ペルー","ベルギー","ポーランド","ボスニア・ヘルツェゴビナ","ボツワナ","BES諸島|ボネール、シント・ユースタティウスおよびサバ","ボリビア|ボリビア多民族国","ポルトガル","香港","ホンジュラス","マーシャル諸島","マカオ","マケドニア共和国|マケドニア旧ユーゴスラビア共和国","マダガスカル","マヨット","マラウイ","マリ共和国|マリ","マルタ","マルティニーク","マレーシア","マン島","ミクロネシア連邦","南アフリカ共和国|南アフリカ","南スーダン","ミャンマー","メキシコ","モーリシャス","モーリタニア","モザンビーク","モナコ","モルディブ","モルドバ|モルドバ共和国","モロッコ","モンゴル国|モンゴル","モンテネグロ","モントセラト","ヨルダン","ラオス|ラオス人民民主共和国","ラトビア","リトアニア","リビア","リヒテンシュタイン","リベリア","ルーマニア","ルクセンブルク","ルワンダ","レソト","レバノン","レユニオン","ロシア|ロシア連邦"];
    
        var $menu       = $(".uio-comp_menu");
        var html        = "";
    
        for (let i=0;i<country.length;i++){
            html += '<div class="uio-comp_option">' + country[i] + '</div>';
        }
    
        for (let i=0; i<$menu.length ;i++){
            $menu.eq(i).html(html);
        }
        
    
    });
    
    
    //オートコンプリートイベントハンドラ定義
    $(function (){
    
        //オートコンプリートのボタンを押したときの処理(プルダウンメニューの表示)
        $(".uio-comp_button").on("click", function (){
            var $menu   = $(this).next(".uio-comp_menu");
    
            //自要素以外のmenuを消す
            $(".uio-comp_menu").not($menu).hide();
    
            if ($menu.css("display") === "none"){ 
                $menu.show(); 
                $menu.children(".uio-comp_option").show();
            }
            else{ 
                $menu.hide();
                $menu.children(".uio-comp_option").show();
            }
        });
    
        //プルダウンメニューから候補を選んでクリックしたときの処理
        $(".uio-comp_option").on("click" ,function () {
            var menu_text   = $(this).text();
    
            $(this).parent().prevAll(".uio-comp_input").val(menu_text);
            $(this).parent().hide();
        });
    
        //テキストが入力されたときの処理。
        $(".uio-comp_input").on("input click",function (){
    
            var input_text      = $(this).val();
    
            var $menu           = $(this).nextAll(".uio-comp_menu");
            var $menu_option    = $(this).nextAll(".uio-comp_menu").children(".uio-comp_option");
            var counter             = 0;
    
            //自要素以外のmenuを消す
            $(".uio-comp_menu").not($menu).hide();
            
            if (input_text === ""){
                $menu.hide();
                return false;
            }
    
            //ループを回して文字列の中に存在するかチェック
            for (let i=0;i<$menu_option.length;i++){
                var option_str  = $menu_option.eq(i).text()
    
                if ( option_str.indexOf(input_text) != -1 ){
                    $menu_option.eq(i).show();
                    counter += 1;
                }
                else{
                    $menu_option.eq(i).hide();
                }
            }
    
            //存在しない場合はメニューを閉じる
            if (counter){ $menu.show(); }
            else{ $menu.hide(); }
        });
    
        //範囲外をクリックでメニューの非表示
        $(document).click(function(event) {
            if( !$(event.target).closest('.uio-comp').length ){
                $(".uio-comp_menu").hide();
            }
        });
    
    });


動かすとこんな感じになる。

<div class="img-center"><img src="/images/Screenshot from 2020-10-30 14-43-56.png" alt="オートコンプリート"></div>

ユーザーの文字入力に合わせて候補を表示することができる。

## 解説

まず、`input`タグの`type="text"`でテキストエリアを作る。ここに選択したい項目を入力する。続いて、後続の`div`タグ(`.uio-comp_botton`)は候補一覧表示のボタンを表示。その次の`.uio-comp_option`は候補を表示している。サンプルではJSでページ読み込み時に国名を入力させているが、実際にはサーバーから与えられた選択肢を描画させると良い。

後は、テキストエリアに入力が行われるたびに、候補の中から一致するものをあぶり出して表示しているだけ。候補がクリックされた時、その内容がテキストエリアの中に代入される。



ただこのコードには問題があり、文字入力中に候補が出てきても、カーソルキーを押して候補を選ぶことができない。

つまり、候補を表示させるためにキーボード入力を行った後、マウスで候補を選択しないといけないのである。これは操作性が悪い。

もっともスマホユーザー向けのアプリであればどうということは無いが、近々このコードは修正を考えている。


## 結論

後は、サーバー側で候補以外の文字列を送信しようとしたら、弾けばいい。バリデーションを使えばできるでしょう。

キーボードが使えないユーザーには単純にSELECTタグで選ぶタイプのUIでいいと思う。ただ、キーボードが使えるユーザーもいるわけで、そういった、あらゆる人にも扱いやすいUIにすることはユーザビリティを高める上で非常に重要。

オートコンプリート自体は珍しくはない、既に大手企業のフォームなどでは普通に実装されている。ただ、コードが古かったり、シンプルじゃなかったりでコレジャナイ感がすごかったので一から自分で作った。

改良の余地こそあれ、自分で作る経験に勝るものはない。
