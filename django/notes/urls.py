from django.urls import path
from . import views

urlpatterns = [
    # 页面路由
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('notes/create/', views.note_create, name='note_create'),
    path('notes/<int:note_id>/edit/', views.note_edit, name='note_edit'),

    # JSON API 接口
    path('api/notes/', views.api_notes_list, name='api_notes_list'),
    path('api/notes/<int:note_id>/', views.api_note_detail, name='api_note_detail'),
    path('api/notes/<int:note_id>/update/', views.api_note_update, name='api_note_update'),
    path('api/notes/<int:note_id>/delete/', views.api_note_delete, name='api_note_delete'),
]
