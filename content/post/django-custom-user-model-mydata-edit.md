---
title: "【Django】カスタムユーザーモデルに記録した自分のユーザー情報を編集する【ユーザー情報変更画面に】"
date: 2022-05-03T17:23:44+09:00
draft: false
thumbnail: "images/django.jpg"
categories: [ "サーバーサイド" ]
tags: [ "Django" ]
---

Djangoでは新規会員登録したとき、記録できるのはユーザーIDとパスワードだけで、会員登録フォームの追加をしない限り、姓名の記録はできない。


仮に新規会員登録した時にフォームが与えられていたとしても、後にその編集をするページがなければ仕方ない。(例えば、姓名が変わった時に変更する手続きをするフォームページを用意していないと、後々問題になる)

そこで、本記事ではユーザー情報を編集するページを作る方法を解説する。

## カスタムユーザーモデル

主キーとemailしかカスタムしていないカスタムユーザーモデルである。

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
        


## カスタムユーザーモデルをバリデーションするフォームクラス

    from django import forms 
    
    
    from .models import Topic
    from users.models import CustomUser
    
    
    class CustomUserForm(forms.ModelForm):
    
        class Meta:
            model   = CustomUser
            fields  = [ "first_name","last_name" ]
    
## views.py
    

    from django.shortcuts import render,redirect
    
    from django.views import View
    from .models import Topic
    from .forms import CustomUserForm
    
    
    from users.models import CustomUser
    
    
    class IndexView(View):
    
        def get(self, request, *args, **kwargs):
    
            context = {}
    
            context["topics"]   = Topic.objects.all()
            context["users"]    = CustomUser.objects.all()
    
            print(context["users"])
    
    
            return render(request,"bbs/index.html",context)
    
        def post(self, request, *args, **kwargs):
    
            if not request.user.is_authenticated:
                print("未認証")
                return redirect("account_login")
    
            user    = CustomUser.objects.filter(id=request.user.id).first()
            form    = CustomUserForm(request.POST,instance=user)
    
            if form.is_valid():
                print("バリデーションOK")
                form.save()
            else:
                print("バリデーションNG")
                print(form.errors)
    
            return redirect("bbs:index")
    
    index   = IndexView.as_view()
    

## index.html

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
    
            <form action="" method="POST">
                {% csrf_token %}
                <input class="form-control" placeholder="姓" type="text" name="last_name">
                <input class="form-control" placeholder="名" type="text" name="first_name">
                <input class="form-control" type="submit" value="送信">
            </form>
    
            <div class="border">
    
                <div>あなたの名前</div>
    
                <div>{{ request.user.last_name }}</div>
                <div>{{ request.user.first_name }}</div>
            </div>
    
        </main>
    </body>
    </html>
    

## 結論

ユーザーモデルの編集に関しては、usersアプリ内に一連の処理を作り、テンプレート側はaction属性で呼び出す形式にしたほうが良いかも知れないが、今回はbbsアプリしか無いので実装の簡便さを考慮してそうした。

更に、usersアプリ内にユーザーモデルの編集処理を書くデメリットは、リダイレクト先を自由に指定できない点にあると思われる。

なにはともあれ、これで会員登録後に姓名の変更、メールアドレスの変更などができるようになる。

