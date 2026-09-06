window.addEventListener("load" , function (){

    let search_elem  = document.querySelector("#search");
    //search_elem.addEventListener("keydown", function(e){ if( e.keyCode === 13 ){ search(this.value); } });

    if (search_elem.value){ search(search_elem.value); }
    search_elem.addEventListener("input", function(){ search(this.value); });




    // コードのクリップコピー機能の実装
    const pre_elems     = document.querySelectorAll("pre");
    for (let pre_elem of pre_elems ){
        pre_elem.innerHTML += '<span class="copy_button">Copy</span>';
    }

    const copy_buttons  = document.querySelectorAll(".copy_button");
    for (let copy_button of copy_buttons){
        copy_button.addEventListener("click" , (event) => {
            const code  = event.currentTarget.closest("pre").querySelector("code");

            if (navigator.clipboard && code){
                navigator.clipboard.writeText( code.textContent );
            }
        });
    }


});

function search(words){
    
    words   = words.replace(/　/g," ");
    let wl  = words.split(" ");

    let words_list  = wl.filter( w => w !== "" );
    let result_elem = document.querySelector("#search_result");
    let notice_elem = document.querySelector("#search_notice");

    if( words_list.length === 0 ){ 
        result_elem.innerHTML = "";
        notice_elem.innerHTML = "";
        return false;
    }

    let old_articles    = SEARCH_LIST;

    //AND検索するため、含んでいる記事をforループのたびに絞り込む
    for ( let w of words_list ){

        //ループするたびに新しく配列を作り直す。
        let new_articles    = [];

        //古い配列(初期はTEST_LIST)から次の文字列を含むかどうかチェックする。大文字小文字は区別しない。
        for (let r of old_articles){
            if ( r["title"].toLowerCase().indexOf(w.toLowerCase()) !== -1 ){
                new_articles.push(r);
            }
        }

        //AND検索するために古い配列は代入される。
        old_articles    = new_articles;
    }

    //レンダリング
    let result  = "";
    for (let w of old_articles){
        result += '<li><a href="' + w['link'] + '">' + w["title"] + '</a></li>'
    }

    result_elem.innerHTML   = result;

    //検索ヒット件数を表示
    let amount      = old_articles.length;
    if (amount > 0){ notice_elem.innerHTML   = String(amount) + "件ヒットしました"; }
    else{ notice_elem.innerHTML   = "見つかりませんでした"; }


}
