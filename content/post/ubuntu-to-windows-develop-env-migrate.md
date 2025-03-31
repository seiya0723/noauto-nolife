---
title: "UbuntuからWindows開発環境への移行作業"
date: 2025-03-30T14:25:24+09:00
lastmod: 2025-03-30T14:25:24+09:00
draft: false
thumbnail: "images/ubuntu.jpg"
categories: [ "others" ]
tags: [ "Windows","Ubuntu","開発環境" ]
---


慣れ親しんだUbuntuからWindowsへメインマシンを移行し、開発環境を構築する必要が出てきたので、ここにその手順をまとめておく。


## VirtualBoxのインストール

とりあえず、VirtualBoxさえあれば元のUbuntu環境をある程度の再現はできるので事前にインストールしておく。

https://www.oracle.com/jp/virtualization/technologies/vm/downloads/virtualbox-downloads.html


Windows の場合、Visual C++を事前にインストールしておく必要がある

https://1nux.com/archives/318


このページのX64 をDLしてインストールしたうえで、VirtualBoxをインストールさせる。

https://learn.microsoft.com/ja-jp/cpp/windows/latest-supported-vc-redist?view=msvc-170


## WSLのインストール

性能上の問題がある場合はWSLを使う。

とはいえ、WSLを使うメリットは軽量であることとWindowsの内部でUbuntuを動かすことぐらいなので、VirtualBoxを使える環境下であればVirtualBoxのほうが再現性が高くて良さそう。

フォント設定やビープ音の設定などが非常に煩わしい

https://hydro.iis.u-tokyo.ac.jp/~akira/page/Others/contents/Windows/WSL/beep.html

また、wsl.exeのターミナルはクリップボードのコピーもできないので、WindowsTerminalをインストールして使う方法をおすすめする。


## VScodeのインストール

VScodeを使ってコードを書く。スニペットと設定の移行も忘れなく。

https://code.visualstudio.com/


## Firefoxのインストール

最近はFirefoxと検索すると、不要なソフトも抱き合わせでインストールさせるサイトが出てくるので、以下Mozilla公式URLを使う。

https://www.mozilla.org/ja/firefox/


### userChrome.cssを使ってタブのバツボタンを削除


```
C:\Users\user\AppData\Roaming\Mozilla\Firefox\Profiles\XXXXXXXXXXX.default-release\chrome\
```

この中にuserChrome.cssを作って、


```
/* タブを閉じるボタン */
#tabbrowser-tabs .tabbrowser-tab .tab-close-button {
    display: none!important;
}
```

このコードを含める。


- https://puppet.asablo.jp/blog/2014/11/03/7482308
- https://dev.macha795.com/firefox72-unread-tab-customize-enable/

### Firefox アカウントにログインしてブックマークとパスワードリストを同期

事前に用意しておいたアカウントを使う。


## teraterm のインストール

GitHubからインストーラーをDLして動かす。

https://github.com/TeraTermProject/teraterm/releases


## GoogleIMEのインストール

https://www.google.co.jp/ime/

辞書ファイルの設定も忘れずに。


## その他Windowsの設定

### OneDriveの無効化

### UTF-8をデフォルトの文字コードに設定


