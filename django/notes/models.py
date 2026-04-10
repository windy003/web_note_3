from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    title = models.TextField(blank=True, default='')
    content = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title or f'笔记 #{self.id}'
