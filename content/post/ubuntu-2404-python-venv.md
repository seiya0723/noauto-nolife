---
title: "Ubuntu 24.04 LTS での python仮想環境構築"
date: 2025-03-29T13:32:49+09:00
lastmod: 2025-03-29T13:32:49+09:00
draft: false
thumbnail: "images/python.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Ubuntu","Python" ]
---



Ubuntu 24.04LTS では rootにPythonライブラリをインストールすることはできないようになっている。

```
$ sudo pip3 install --user virtualenv

error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to
    install.

    If you wish to install a non-Debian-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip. Make
    sure you have python3-full installed.

    If you wish to install a non-Debian packaged Python application,
    it may be easiest to use pipx install xyz, which will manage a
    virtual environment for you. Make sure you have pipx installed.

    See /usr/share/doc/python3.12/README.venv for more information.

note: If you believe this is a mistake, please contact your Python installation or OS distribution provider. You can override this, at the risk of breaking your Python installation or OS, by passing --break-system-packages.
hint: See PEP 668 for the detailed specification.
```


これはDebian系OSであるRaspberryPi OSでも同様。

そこで、virtualenv ではなく pythonのvenvを使う。しかし、

```
$ python3 -m venv venv


The virtual environment was not created successfully because ensurepip is not
available.  On Debian/Ubuntu systems, you need to install the python3-venv
package using the following command.

    apt install python3.12-venv

You may need to use sudo with that command.  After installing the python3-venv
package, recreate your virtual environment.

Failing command: /home/user/Documents/user/venv/bin/python3
```

このように、venvがデフォルトで入っているわけではないため、

```
sudo apt install python3.12-venv 
```

を実行してvenvをUbuntuにインストールしておく。その上で仮想環境を作り、pip install ~ を実行する。

