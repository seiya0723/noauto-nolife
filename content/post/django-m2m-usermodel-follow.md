---
title: "【Django】カスタムユーザーモデルでブロック機能を実装させる【ManyToManyFieldでユーザーモデル自身を指定】"
date: 2021-06-21T21:36:59+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "django","tips","上級者向け" ]
---


本格的にSNS等のサービスを運用する時、必要になるのがユーザーフォロー(友達)やユーザーブロックの機能。

今回はユーザーブロックの機能をカスタムユーザーモデルを使って再現する。

コードは[【Django】allauthとカスタムユーザーモデルを実装した簡易掲示板を作る【AbstrastBaseUser】](/post/django-custom-user-model-allauth-bbs/)から流用している。



## ユーザーモデル

users/models.pyの内容、多対多で参照する中間テーブルのモデルクラスが定義されている。時刻を参照しないのであれば、中間テーブルのモデルクラスまで作る必要はない。

    from django.db import models
    
    from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
    from django.contrib.auth.validators import UnicodeUsernameValidator
    
    from django.utils import timezone
    
    from django.utils.translation import gettext_lazy as _
    from django.core.mail import send_mail
    
    import uuid 
    
    
    #ここ( https://github.com/django/django/blob/master/django/contrib/auth/models.py#L321 )から流用
    class CustomUser(AbstractBaseUser, PermissionsMixin):
    
        username_validator  = UnicodeUsernameValidator()
    
        id          = models.UUIDField( default=uuid.uuid4, primary_key=True, editable=False )
        username    = models.CharField(
                        _('username'),
                        max_length=150,
                        unique=True,
                        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
                        validators=[username_validator],
                        error_messages={
                            'unique': _("A user with that username already exists."),
                        },
                    )
    
        first_name  = models.CharField(_('first name'), max_length=150, blank=True)
        last_name   = models.CharField(_('last name'), max_length=150, blank=True)
    
        email       = models.EmailField(_('email address'))
    
    
        #ユーザーのブロック、第一引数"CustomUser"でも構わないが、クラス名が変わると通用しないので、"self"を指定。中間テーブルはBlockUser。
        blocked     = models.ManyToManyField("self",through="BlockUser",through_fields=('to_user', 'from_user'), verbose_name="ブロック",blank=True)
    
    
        is_staff    = models.BooleanField(
                        _('staff status'),
                        default=False,
                        help_text=_('Designates whether the user can log into this admin site.'),
                    )
    
        is_active   = models.BooleanField(
                        _('active'),
                        default=True,
                        help_text=_(
                            'Designates whether this user should be treated as active. '
                            'Unselect this instead of deleting accounts.'
                        ),
                    )
        date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    
        objects     = UserManager()
    
        EMAIL_FIELD = 'email'
        USERNAME_FIELD = 'username'
        REQUIRED_FIELDS = ['email']
    
        class Meta:
            verbose_name = _('user')
            verbose_name_plural = _('users')
            #abstract = True
    
        def clean(self):
            super().clean()
            self.email = self.__class__.objects.normalize_email(self.email)
    
        def get_full_name(self):
            """
            Return the first_name plus the last_name, with a space in between.
            """
            full_name = '%s %s' % (self.first_name, self.last_name)
            return full_name.strip()
    
        def get_short_name(self):
            """Return the short name for the user."""
            return self.first_name
    
        def email_user(self, subject, message, from_email=None, **kwargs):
            """Send an email to this user."""
            send_mail(subject, message, from_email, [self.email], **kwargs)
    
    
    class BlockUser(models.Model):
    
        class Meta:
            db_table    = "blockuser"
    
        #同じクラスを外部キーとして指定しているのでフィールドオプションとしてrelated_nameを指定する。
        id          = models.UUIDField( default=uuid.uuid4, primary_key=True, editable=False )
        dt          = models.DateTimeField(verbose_name="ブロックした日時",default=timezone.now)
        from_user   = models.ForeignKey(CustomUser,verbose_name="ブロック元のユーザー",on_delete=models.CASCADE,related_name="block_from_user")
        to_user     = models.ForeignKey(CustomUser,verbose_name="ブロック対象のユーザー",on_delete=models.CASCADE,related_name="block_to_user")
    
    
ManyToManyFieldでCustomUserクラス自身を参照する。そのため、文字列型の`"self"`と指定する。`"CustomUser"`でも良いが、それだとクラス名が変わったときに後から修正する必要があるため、この方法が良い。

そして、中間テーブルに当たるモデルクラス、BlockUserでは、2つのフィールドがCustomUserと1対多で繋がっている。2つのフィールドが同じモデルクラスに対して1対多で繋がっているので、フィールドオプションとして`related_name`を指定しないといけない。`related_name`の指定がないと、マイグレーション時にエラーを起こす。


## ユーザーブロック、解除を行う処理

`users/views.py`にて全て記述した。アプリ側の`bbs/views.py`でも動くが`users`アプリ内の`models.py`を直接インポートすることになるので、あまりよろしくない。ユーザーモデルに対する処理はusersのビューに任せるべきだと思う。

    from django.shortcuts import render,redirect
    from django.contrib.auth.mixins import LoginRequiredMixin
    
    from .models import BlockUser
    from .forms import BlockUserForm
    
    from django.views import View
    
    class UserBlockView(LoginRequiredMixin,View):
    
        def post(self,request,pk,*args,**kwargs):
    
            blockusers  = BlockUser.objects.filter(from_user=request.user.id,to_user=pk)
    
            #すでにある場合は該当レコードを削除、無い場合は挿入
            #TIPS:↑メソッドやビュークラスを切り分けてしまうと、多重に中間テーブルへブロックのレコードが挿入されてしまう可能性があるため1つのメソッド内で分岐するやり方が無難。
            if blockusers:
                print("ある")
                blockusers.delete()
    
                return redirect("/")
    
            else:
                print("無い")
    
            data    = { "from_user":request.user.id,"to_user":pk }
            form    = BlockUserForm(data)
    
            if form.is_valid():
                print("ブロックOK")
                form.save()
    
            else:
                print("ブロックNG")
    
            return redirect("/")
    
    
    block   = UserBlockView.as_view()


ユーザーモデルを見せびらかす必要はないので、POST文だけでOK。ただし、ブロック解除とブロックの処理はひとつのメソッド内に書き込み、分岐するようにしている。

ブロックと解除の処理をメソッドもしくはビュークラス単位で分けてしまうとブロックの処理を連続で行われる可能性があるからだ。つまり中間テーブルに同じ内容のデータが2個以上スタックされてしまう。

これを許すと中間テーブル内のレコードが増え続けるのでDBの圧迫につながる。そこでビュー側が現状をチェックして、解除するかブロックするか判定している。

ちなみに、BlockUserFormはそのままモデルを継承したフォームクラスである。`from_user`と`to_user`をfieldsに入れ判定している。

処理後のリダイレクト先にトップページを指定しているが、ここは適宜変えてもらいたい。


## テンプレート側の処理

`template/bbs/index.html`より。多対多のユーザーモデルなので、参照の仕方はやや特殊である。


    <!DOCTYPE html>
    <html lang="ja">
    <head>
    	<meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
    	<title>簡易掲示板</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    </head>
    <body>
    
        <main class="container">
    
            ようこそ、{{ request.user }}
    
    
            <form method="POST">
                {% csrf_token %}
                <textarea class="form-control" name="comment"></textarea>
                <input type="submit" value="送信">
            </form>
    
            {% for topic in topics %}
            <div class="border">
                <div>投稿者 {{ topic.user.last_name }}:{{ topic.user.first_name }}
    
                    {% if request.user.is_authenticated and request.user.id != topic.user.id %}
                    <form action="{% url 'users:block' topic.user.id %}" method="POST">
                        {% csrf_token %}
                        <!--ブロック中であればボタン表記を書き換え-->
                        {% if request.user in topic.user.blocked.all %}
                        <button class="btn btn-danger" type="submit">ブロック中</button>
                        {% else %}
                        <button class="btn btn-outline-danger" type="submit">ブロック</button>
                        {% endif %}
                    </form>
                    {% endif %}
                </div>
                <div>{{ topic.comment }}</div>
    
                <!--投稿者をブロック中かどうか判定する。レコード2個以上の場合、その数だけ出てしまう。-->
                {% for blocked in topic.user.blocked.all %}
                {% if request.user.id == blocked.id %}<div>この投稿者をブロックしています。</div>{% endif %}
                {% endfor %}
    
                {% if topic.user.blocked.all %}
                <div>{% for blocked in topic.user.blocked.all %}{{ blocked.last_name }}{{ blocked.first_name }} {% endfor %}
                     がこの投稿者をブロックしています。
                </div>
                {% endif %}
    
            </div>
            {% endfor %}
    
        </main>
    </body>
    </html>

Bootstrapのボタンの装飾を使って、ブロック中とブロックしていない状態で見た目を変えている。

実行するとこうなる。

<div class="img-center"><img src="/images/Screenshot from 2021-06-22 16-06-32.png" alt="ブロック"></div>


## 結論

フォローや通報、グループの作成などもこれで表現できそうだ。

ちなみに、下記リンクによると今回のようにManyToManyFieldを含んだモデルクラス自身を多対多の対象にしたい場合、文字列型の"self"を第一引数に指定するのが無難であるとのこと。

https://stackoverflow.com/questions/11721157/django-many-to-many-m2m-relation-to-same-model

## ソースコード


https://github.com/seiya0723/django_m2m_block

