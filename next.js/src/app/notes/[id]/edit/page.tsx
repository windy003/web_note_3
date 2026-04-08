'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';

export default function EditNotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (session?.user && noteId) {
      fetch(`/api/notes/${noteId}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) { router.push('/'); return; }
          setTitle(data.title || '');
          setContent(data.content || '');
        });
    }
  }, [session, noteId, router]);

  const saveNote = useCallback(async () => {
    setSaving(true);
    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(data.success ? '保存成功' : '保存失败');
    setTimeout(() => setMessage(''), 2000);
  }, [noteId, title, content]);

  const deleteNote = useCallback(async () => {
    if (!confirm('确定要删除这个笔记吗？')) return;
    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    router.push('/');
  }, [noteId, router]);

  // Ctrl+S 保存快捷键
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNote]);

  if (status === 'loading' || !session) return null;

  return (
    <>
      <Navbar />
      <div className="container mt-3">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <h1 className="mb-4">编辑笔记</h1>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">标题</label>
              <input
                type="text" className="form-control" id="title"
                value={title} onChange={e => setTitle(e.target.value)}
                required style={{ fontSize: '20px', padding: '12px 15px' }}
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label htmlFor="content" className="form-label mb-0">内容</label>
                <div>
                  <button onClick={saveNote} className="btn btn-sm btn-primary me-2" disabled={saving}>
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button onClick={deleteNote} className="btn btn-sm btn-danger">删除</button>
                </div>
              </div>
              <textarea
                className="form-control" id="content" rows={25}
                value={content} onChange={e => setContent(e.target.value)}
                style={{ fontSize: '22px', lineHeight: 1.8, padding: '20px', whiteSpace: 'pre-wrap' }}
              />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, padding: '10px 20px',
          borderRadius: 4, zIndex: 10000, backgroundColor: 'rgba(40,167,69,0.9)',
          color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}>
          {message}
        </div>
      )}
    </>
  );
}
