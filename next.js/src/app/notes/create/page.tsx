'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CreateNotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    if (data.success) {
      router.push('/');
    }
  }

  if (status === 'loading' || !session) return null;

  return (
    <>
      <Navbar />
      <div className="container mt-3">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <h1 className="mb-4">新建笔记</h1>
            <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="btn btn-sm btn-primary me-2">
                      <i className="bi bi-check-lg"></i> 保存
                    </button>
                    <Link href="/" className="btn btn-sm btn-secondary">
                      <i className="bi bi-x-lg"></i> 取消
                    </Link>
                  </div>
                </div>
                <textarea
                  className="form-control" id="content" rows={10}
                  value={content} onChange={e => setContent(e.target.value)}
                  style={{ fontSize: '22px', lineHeight: 1.8, padding: '20px' }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
