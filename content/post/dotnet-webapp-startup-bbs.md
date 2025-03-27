---
title: "ASP .NET Coreで簡易掲示板をつくる"
date: 2025-03-22T17:17:28+09:00
lastmod: 2025-03-22T17:17:28+09:00
draft: false
thumbnail: "images/csharp.jpg"
categories: [ "サーバーサイド" ]
tags: [ "C＃",".NET" ]
---


.NETを急いで覚える必要があるため、まずは簡易掲示板をつくる。

## プロジェクトをつくる

まず、.NETには、プロジェクトの構成として、MVC と Razor Pagesの2パターンがある。

PazorPagesは基本的なウェブページのみで構成されたシンプルなウェブアプリ。

一方、MVCはモデル・ビュー・コントローラがすべて揃った状態で作られる本格的なウェブアプリ。

今回は後者でつくる。

new mvc コマンドでプロジェクトをつくる。

```
dotnet new mvc -o StartupBBS
```

```
drwxrwxr-x 2 akagi akagi 4096  3月 26 13:22 Controllers
drwxrwxr-x 2 akagi akagi 4096  3月 26 13:22 Models
-rw-rw-r-- 1 akagi akagi  670  3月 26 13:22 Program.cs
drwxrwxr-x 2 akagi akagi 4096  3月 26 13:22 Properties
-rw-rw-r-- 1 akagi akagi  219  3月 26 13:22 StartupBBS.csproj
drwxrwxr-x 4 akagi akagi 4096  3月 26 13:22 Views
-rw-rw-r-- 1 akagi akagi  127  3月 26 13:22 appsettings.Development.json
-rw-rw-r-- 1 akagi akagi  151  3月 26 13:22 appsettings.json
drwxrwxr-x 2 akagi akagi 4096  3月 26 13:22 obj
drwxrwxr-x 5 akagi akagi 4096  3月 26 13:22 wwwroot
```

ちなみにプロジェクトの構成を役割に応じてまとめると以下のようになる。

```
StartupBBS/
│
├── Controllers/         # コントローラ (MVCの「C」部分)
│   └── HomeController.cs
│
├── Models/              # モデル (MVCの「M」部分)
│   └── ErrorViewModel.cs
│
├── Views/               # ビュー (MVCの「V」部分)
│   ├── Home/
│   │   └── Index.cshtml
│   └── Shared/
│       └── _Layout.cshtml
│
├── wwwroot/             # 静的ファイル（CSS, JavaScript, 画像など）
│   ├── css/
│   ├── js/
│   └── images/
│
├── appsettings.json     # アプリケーションの設定ファイル
├── Program.cs           # エントリーポイント (アプリケーションの開始処理)
└── StartupBBS.csproj    # プロジェクトファイル
```

djangoのようにアプリの概念はなく、プロジェクト直下にモデルやコントローラ、ビューやルーティング設定が含まれる。

どちらかと言うとLaravelに近い。


### RazorPages

もしウェブページだけのウェブアプリを作りたい場合はこうする。

```
dotnet new webapp -o StartupBBS
```

```
drwxrwxr-x 3 akagi akagi 4096  3月 22 16:46 Pages
-rw-rw-r-- 1 akagi akagi  573  3月 22 16:46 Program.cs
drwxrwxr-x 2 akagi akagi 4096  3月 22 16:46 Properties
-rw-rw-r-- 1 akagi akagi  154  3月 22 16:46 appsettings.Development.json
-rw-rw-r-- 1 akagi akagi  151  3月 22 16:46 appsettings.json
drwxrwxr-x 3 akagi akagi 4096  3月 22 16:46 bin
drwxrwxr-x 3 akagi akagi 4096  3月 22 16:46 obj
-rw-rw-r-- 1 akagi akagi  219  3月 22 16:46 StartupBBS.csproj
drwxrwxr-x 5 akagi akagi 4096  3月 22 16:46 wwwroot
```


## Program.cs でSQLite を使うように設定する

```
using Microsoft.EntityFrameworkCore;
using StartupBBS.Data;

var builder = WebApplication.CreateBuilder(args);

// DbContext の登録
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=app.db")); // SQLite での例

var app = builder.Build();

// その他の設定...

app.Run();
```


## モデル


モデル作成 (Models/Comment.cs)

```
using System;

namespace StartupBBS.Models
{
    public class Comment
    {
        public int Id { get; set; }  // プライマリキー
        public string UserName { get; set; }  // 投稿者の名前
        public string Content { get; set; }  // コメント内容
        public DateTime PostedAt { get; set; }  // 投稿日時
    }
}
```

### 【補足】名前空間 StartupBBS

名前空間とは、ファイルを論理的にグループ化させるためのもの。

一般的に.NETでは プロジェクト名と同じ名前空間を指定する。ただし、プロジェクト名とは違う名前空間でも問題はない。

例えば、以下の名前空間でもエラーは出ない。

```
namespace StartupBBS.Models
```

また、プロジェクト名自体はただのディレクトリ名であり内部的に紐付いているわけではない。

よって、今回プロジェクト名をStartupBBSとしたが、これは後から変更することもできる。



### 【補足】 { get; set; } とは？

その名の通り、データの取得と設定を許可するという意味。

## マイグレーション


DbContext の作成 (Data/ApplicationDbContext.cs)

```
using Microsoft.EntityFrameworkCore;
using StartupBBS.Models;


namespace StartupBBS.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        { }

        // デザイン時に使用する接続設定を追加
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlite("Data Source=app.db"); // SQLiteの接続設定（デザイン時）
            }
        }

        public DbSet<Comment> Comments { get; set; }
    }
}

```

このDbContextを元にマイグレーションファイルをつくる。

```
dotnet ef migrations add InitialCreate
```

これによりInitialCreateという名前のマイグレーションファイルが作られる。未適応DbContextがすべてこのマイグレーションファイルで作られる。

続いて、マイグレーションファイルをDBに反映させる。
```
dotnet ef database update
```


### 【補足】DbContextとModelの関係は？

DbContextは、テーブルの作成やカラムの追加などのDB設計をするためのもの。

Modelはデータの読み書きをするためのもの。



### マイグレーションのコマンドでエラーが出る場合は？

```
$ dotnet ef migrations add InitialCreate


指定されたコマンドまたはファイルが見つからなかったため、実行できませんでした。
これには、次のような理由が考えられます: 
 * 組み込みの dotnet コマンドのスペルが間違っています。
 * .NET プログラムを実行しようとしましたが、dotnet-ef が存在しません。
 * グローバル ツールを実行しようとしましたが、この名前の dotnet プレフィックス付き実行可能ファイルが PATH に見つかりませんでした。
```

と出てくる場合、dotnet-ef がインストールされていない可能性がある。

```
dotnet tool install --global dotnet-ef


dotnet new tool-manifest
dotnet tool install dotnet-ef
```


### エラーの内容を出力するには？

```
dotnet build 
```
でビルドする。

```
$ dotnet build
  復元対象のプロジェクトを決定しています...
  復元対象のすべてのプロジェクトは最新です。
/home/akagi/Documents/programming/csharp/StartupBBS/Data/ApplicationDbContext.cs(1,17): error CS0234: 型または名前空間の名前 'EntityFrameworkCore' が名前空間 'Microsoft' に存在しません (アセンブリ参照があることを確認してください) [/home/akagi/Documents/programming/csharp/StartupBBS/StartupBBS.csproj]
/home/akagi/Documents/programming/csharp/StartupBBS/Data/ApplicationDbContext.cs(6,41): error CS0246: 型または名前空間の名前 'DbContext' が見つかりませんでした (using ディレクティブまたはアセンブリ参照が指定されていることを確認してください) [/home/akagi/Documents/programming/csharp/StartupBBS/StartupBBS.csproj]
/home/akagi/Documents/programming/csharp/StartupBBS/Data/ApplicationDbContext.cs(8,37): error CS0246: 型または名前空間の名前 'DbContextOptions<>' が見つかりませんでした (using ディレクティブまたはアセンブリ参照が指定されていることを確認してください) [/home/akagi/Documents/programming/csharp/StartupBBS/StartupBBS.csproj]
/home/akagi/Documents/programming/csharp/StartupBBS/Data/ApplicationDbContext.cs(10,16): error CS0246: 型または名前空間の名前 'DbSet<>' が見つかりませんでした (using ディレクティブまたはアセンブリ参照が指定されていることを確認してください) [/home/akagi/Documents/programming/csharp/StartupBBS/StartupBBS.csproj]

ビルドに失敗しました。

```
このようなエラーが出る。



```
dotnet add package Microsoft.EntityFrameworkCore
```


```
dotnet add package Microsoft.EntityFrameworkCore.Design
```

SQLiteを使う場合このコマンドを実行しておく。

```
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```




## コントローラ

コントローラ作成 (Controllers/HomeController.cs)


```
using Microsoft.AspNetCore.Mvc;
using StartupBBS.Data;
using StartupBBS.Models;
using System.Linq;

namespace StartupBBS.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: コメント一覧の表示
        public IActionResult Index()
        {
            var comments = _context.Comments.ToList();  // コメント一覧を取得
            return View(comments);
        }

        // POST: コメントの投稿
        [HttpPost]
        public IActionResult PostComment(string userName, string content)
        {
            var comment = new Comment
            {
                UserName = userName,
                Content = content,
                PostedAt = DateTime.Now
            };

            _context.Comments.Add(comment);  // コメントをDBに追加
            _context.SaveChanges();  // 変更を保存

            return RedirectToAction("Index");  // コメント投稿後にトップページへリダイレクト
        }
    }
}
```


コンストラクタHomeController でレンダリング時に引き渡すcontextを生成している。

IActionResult は アクションメソッドの戻り値のデータ型である。戻り値である View() や RedirectToAction() も IActionResult 型である。これでコントローラのアクションをつくることができる。


### 【補足】 [HttpPost] とは何か？

これはHTTP POSTメソッドに対応したアクションメソッドであることを示す、アトリビュートである。

この指定により、POSTリクエストを受け取ったときに実行されるようになる。

ちなみに、DELETE、PUT、PATCHなどのメソッドを受け取ることもできる。

```
[HttpDelete]

[HttpPut]

[HttpPatch]
```

ただし、通常のformタグではGETとPOSTしかサポートしていないため、DELETE、PUT、PATCHメソッドを送信したい場合はJavaScriptのFetchAPIなどを使う。


### 【補足】このコントローラではバリデーションはしていない

このコントローラはバリデーションはしていない。

もしバリデーションをするのであれば、モデルバインディングを使ってこうする。

```
// POST: コメントの投稿
[HttpPost]
public IActionResult PostComment(Comment, comment)
{

    if(ModelState.IsValid){
        _context.Comments.Add(comment);
        _context.SaveChanges();
    }

    return RedirectToAction("Index");
}
```

このModelStateはアクションメソッド内で使用することができる。あえてusingをする必要はない。


### 【補足】モデル名の複数形はどういう理屈で変換されているのか？

C# の Entity Framework Core (EF Core) により変換されている。

一般的な英語の複数形のルールに従っている。

例えば、 City はCitys ではなく Citiesと変換される。 CategoryもCategories になる。

ただし、特殊な単語や辞書に載っていない単語は、単純にsがつくか、何もつかないかのどちらかになる。

確認をするには以下のコードを使うとよいだろう。

```
using System;
using System.Data.Entity.Design.PluralizationServices;
using System.Globalization;

class Program
{
    static void Main()
    {
        // PluralizationService のインスタンスを作成
        var pluralizationService = PluralizationService.CreateService(new CultureInfo("en-US"));

        // 調べたい単語のリスト
        string[] words = { "City", "User", "Category", "Status", "Metadata", "Pokemon", "MyCustomWord" };

        // 結果を表示
        foreach (var word in words)
        {
            string plural = pluralizationService.Pluralize(word);
            Console.WriteLine($"{word} → {plural}");
        }
    }
}
```

### .NETのORMはどう使う？

この.NETのORMは、LINQという。厳密にはORMではない。C#によるものである。

データベースだけでなく、配列やリストに対しても有効。そのため、これさえ覚えておけば、C#の別フレームワークなどでも通用する。

#### 全データの取り出し .ToList()

```
var comments = _context.Comments.ToList();
```

#### 絞り込み .Where()

```
var comments = _context.Comments.Where(c => c.UserName == "Alice").ToList();
```

.Where() メソッド内でアローを使い、アトリビュートを指定して絞り込み。


#### 並び替え 昇順: .OrderBy() 降順: .OrderByDescending()

```
var comments = _context.Comments.OrderBy(c => c.PostedAt).ToList();

var comments = _context.Comments.OrderByDescending(c => c.PostedAt).ToList();
```


#### 絞り込んで並び替えるには、チェーンにすれば良い

```
var comments = _context.Comments
    .Where(c => c.UserName == "Alice")
    .OrderByDescending(c => c.PostedAt)
    .ToList();
```

#### 1件だけ取り出す

```
var comment = _context.Comments.Where(c => c.UserName == "Alice").FirstOrDefault();
```

.First() もあるが、こちらはデータがない場合はエラーになる。

#### カウントするには

```
int count = _context.Comments.Where(c => c.UserName == "Alice").Count();
```


## ビュー


Views/Home/Index.cshtml

```
@model IEnumerable<StartupBBS.Models.Comment>

<h1>コメント掲示板</h1>

<!-- コメント一覧の表示 -->
<div>
    @foreach (var comment in Model)
    {
        <div>
            <strong>@comment.UserName</strong> (@comment.PostedAt)
            <p>@comment.Content</p>
        </div>
    }
</div>

<!-- コメント投稿フォーム -->
<h2>コメントを投稿</h2>
<form method="post" action="/Home/PostComment">
    <div>
        <label for="userName">名前：</label>
        <input type="text" id="userName" name="userName" required />
    </div>
    <div>
        <label for="content">コメント：</label>
        <textarea id="content" name="content" required></textarea>
    </div>
    <button type="submit">投稿</button>
</form>

```

### HTMLのname属性はスネークケースでは？

コントローラのアクションメソッドの引数で

```
        [HttpPost]
        public IActionResult PostComment(string userName, string content)
        {
            var comment = new Comment
            {
                UserName = userName,
                Content = content,
                PostedAt = DateTime.Now
            };

            _context.Comments.Add(comment);  // コメントをDBに追加
            _context.SaveChanges();  // 変更を保存

            return RedirectToAction("Index");  // コメント投稿後にトップページへリダイレクト
        }
```

userName , content としたため同じname属性にした。

モデルバインディングを使用している場合も、モデルのアトリビュートに対応させる必要がある。

.NETでは基本キャメルケースが使われるため、HTMLもそれに合わせる形になる。


### テンプレート言語 Razorでコメントアウトするには？


```
@* この部分はコメントアウトされる *@
```

こうする。HTMLコメントでもよいが、ページソースから丸見え。

### action属性のルーティング逆引き


もし直にURLを書きたくない場合はこうする。

```
<form method="post" action="@Url.Action("PostComment", "Home")">

以下略
```


## ルーティング


ルーティング設定 (Program.cs)

```
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StartupBBS.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// サービスの登録
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));  // SQLiteの接続文字列

var app = builder.Build();

// ミドルウェア設定
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");  // ルーティング設定

app.Run();
```

この内、ルーティング設定に関わっているのは。

```
app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");  // ルーティング設定

app.Run();
```

このコードで、このコードだけで以下のルーティング設定ができる。

- `Home/Index/` : HomeControllerのIndexアクション(明示的に指定)
- `Home/PostComment/` : HomeControllerのPostCommentアクション(HomeControllerの指定で自動的にルーティング設定)
- `/` : HomeControllerのIndexアクション(デフォルト)
- `Home/Index/1/` : HomeControllerのIndexアクションにidが1で実行

### なぜこのルーティング設定でIndexやPostComment のアクションが登録されるのか？

Indexは明示的に設定されているからわかるが、PostCommentはなぜこれで成立するのかというと、controller引数にHomeControllerが与えられているから。

これによりHomeController 内にあるすべてのアクションがURL登録される。


## サーバーを起動する

```
dotnet run
```

でサーバーが起動する。ただしファイルを途中で編集した場合、再度コマンドを実行して、サーバーを起動し直さないといけない。

そこで、ファイルの編集を監視する以下のコマンドをおすすめする。

```
dotnet watch run
```


