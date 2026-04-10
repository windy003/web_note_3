import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from .models import Note
from .forms import RegisterForm


def home(request):
    """首页：未登录显示欢迎页，已登录显示笔记列表"""
    if request.user.is_authenticated:
        notes = Note.objects.filter(user=request.user)
        return render(request, 'home.html', {'notes': notes})
    return render(request, 'home.html')


def login_view(request):
    """登录页"""
    if request.user.is_authenticated:
        return redirect('home')

    error = ''
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            error = '用户名或密码错误'

    return render(request, 'login.html', {'error': error})


def register_view(request):
    """注册页"""
    if request.user.is_authenticated:
        return redirect('home')

    error = ''
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            User.objects.create_user(username=username, password=password)
            return redirect('login')
        else:
            # 获取第一个错误信息
            for field, errors in form.errors.items():
                error = errors[0]
                break

    return render(request, 'register.html', {'error': error})


def logout_view(request):
    """退出登录"""
    logout(request)
    return redirect('login')


@login_required
def note_create(request):
    """新建笔记页"""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '')
        if title:
            Note.objects.create(title=title, content=content, user=request.user)
            return redirect('home')
    return render(request, 'note_create.html')


@login_required
def note_edit(request, note_id):
    """编辑笔记页"""
    note = get_object_or_404(Note, id=note_id, user=request.user)
    return render(request, 'note_edit.html', {'note': note})


# ---- JSON API 接口（供编辑页 AJAX 使用）----

@login_required
@require_http_methods(["GET"])
def api_notes_list(request):
    """获取当前用户所有笔记（JSON）"""
    notes = Note.objects.filter(user=request.user).values('id', 'title', 'content', 'created_at', 'updated_at')
    return JsonResponse(list(notes), safe=False)


@login_required
@require_http_methods(["GET"])
def api_note_detail(request, note_id):
    """获取单个笔记（JSON）"""
    note = get_object_or_404(Note, id=note_id, user=request.user)
    return JsonResponse({
        'id': note.id,
        'title': note.title,
        'content': note.content,
        'created_at': note.created_at.isoformat() if note.created_at else '',
        'updated_at': note.updated_at.isoformat() if note.updated_at else '',
    })


@login_required
@require_http_methods(["PUT"])
def api_note_update(request, note_id):
    """更新笔记（JSON API）"""
    note = get_object_or_404(Note, id=note_id, user=request.user)
    data = json.loads(request.body)
    note.title = data.get('title', note.title)
    note.content = data.get('content', note.content)
    note.save()
    return JsonResponse({'success': True, 'message': '笔记已保存'})


@login_required
@require_http_methods(["DELETE"])
def api_note_delete(request, note_id):
    """删除笔记（JSON API）"""
    note = get_object_or_404(Note, id=note_id, user=request.user)
    note.delete()
    return JsonResponse({'success': True, 'message': '笔记已删除'})
