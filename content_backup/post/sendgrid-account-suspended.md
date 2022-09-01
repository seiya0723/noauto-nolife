---
title: "Sendgridのアカウントが一時的に凍結された場合の対処法と対策"
date: 2022-06-28T07:03:38+09:00
draft: false
thumbnail: "images/sendgrid.jpg"
categories: [ "インフラ" ]
tags: [ "sendgrid","tips" ]
---

某日、Sendgridからメールが届く。内容は下記。

    Dear Twilio SendGrid Customer,
    
    Your Twilio SendGrid account has been temporarily suspended as we have detected that your account's credentials (password and/or API key) are publicly listed on the code repository GitHub. This is a dangerous practice which may result in your account being used by unauthorized third parties to send malicious content and which may incur damage to your reputation as a quality sender and charges against your account for high usage that you did not perform.
    
    Before you ask for your account's reactivation, please ensure that you:
    1) Change your account's password: https://sendgrid.com/docs/ui/account-and-settings/resetting-your-username-and-password. If your account was created using Heroku or IBM BlueMix, you must use our password reset form.
    2) Delete and update exposed API keys in your account [APIのID] : https://sendgrid.com/docs/ui/account-and-settings/api-keys/#delete-an-api-key
    3) Enable two-factor authentication for your account
    4) Remove your account credentials and API keys from any public listings on code repositories or associated comments on sites such as GitHub or BitBucket.
    
    Please see the following link(s) for locations where your credentials have been found to be publicly exposed:
    ##ここにGitHubのURL##
    

要約すると、『あなたのアカウントのAPIキーがGitHubに漏れています。アカウントの凍結を解除するには、アカウントのパスワードを変更、該当APIキーを削除、二要素認証を実装、問題のGitHubリポジトリを削除してください。』

また、サイトに入ると下記バナーが表示されている。

<div class="img-center"><img src="/images/Screenshot from 2022-06-30 14-50-57.png" alt=""></div>

## 原因

うっかりGitHubにSendgridのAPIキーを含んだプロジェクトをプッシュしてしまった。

ただ、すぐに(1分以内)気づいたので、リポジトリごと削除、該当APIキーも削除することで対処した。

APIキーにはメールの送信機能しか権限を与えていないので、影響は殆ど無いだろうと思っていた。


これだけで、これほどの大事になるとは思ってもいなかったので、Sendgridからメール受け取ったときには言葉も出なかった。

つまり逆に考えると、Sendgridのボットも含め、GitHub内を巡回しているボットは、これほどの短時間でSendgridのAPIキーの流出を検知できるほど強力であるということだ。

## 影響

このメールを受け取ってしばらくの間、アカウントは監視下に置かれ、メール送信ができない状況に至った。

凍結されたアカウントは商用利用しているわけではないので、ビジネスには全く影響はなかったが、商用アカウントであれば被害が発生する。

よってその対策を考慮することにした。

## 対処

~ちなみに、今回の`suspended`はサポートにメールを送る必要はない。~

下記からログインしてサポートリクエストを送信する。

https://support.sendgrid.com/hc/en-us/requests

利用できない期間も課金状態は続くため、速やかにサポートリクエストを送ったほうが良い。

https://support.sendgrid.com/hc/en-us/articles/360041790293-Account-Under-Review

https://docs.sendgrid.com/ui/account-and-settings/account-under-review

## 対策

### 【対策1】.gitignoreを使ってAPIキーファイルを全てコミット対象外とする

手動でやらないといけないので効果は限定的かもしれないが、APIキーを含めたファイルを.gitignoreに記録、コミット対象外とするのが妥当である。

例えばPythonであれば、APIキーを読み込む側は下記のようにする。fromは適宜編集

    from local_settings import *

`local_settings.py`にAPIキーを含めた変数を定義。.gitignoreに`local_settings.py`を含める。

### 【対策2】シェルスクリプトでコミットする時、APIキーらしきものが含まれていないかチェックする

コミット前にAPIキーが含まれていないかチェックするのが、一番効果的と思われる。

grepコマンドを使うことでAPIキーの文字列を取得できる。

### 【対策3】git-secretsを使う

対策2よりも簡単な方法である。前もってインストールしておくと良いだろう。

https://qiita.com/jqtype/items/9196e047eddb53d07a91

パターンを登録することで、特定の文字列を含んだファイルがある場合、コミットできないようにすることができる


