---
title: "PythonからWindows共有サーバー(Samba)にアクセスする"
date: 2024-08-20T21:26:59+09:00
lastmod: 2024-08-20T21:26:59+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "tips" ]
---




```
import platform
from smb.SMBConnection import SMBConnection

# connection open
conn = SMBConnection(
    '',
    '',
    platform.uname().node,
    '192.168.11.100',
    domain='WORKGROUP',
    use_ntlm_v2=True)
conn.connect('192.168.11.100', 139)


# IPアドレス以降のファイルパスを設定
items = conn.listPath('share' , "sdb1")
print([item.filename for item in items])

print(conn.echo('echo success'))

conn.close()
```



## 参照

https://qiita.com/t2kojima/items/250d68c56a8c9fe95f52




