'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Note {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

function formatDatetime(dt: string): string {
  if (!dt) return '';
  const d = new Date(dt);
  // 转换为北京时间显示
  return d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

export default function HomePage() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/notes')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setNotes(data);
        });
    }
  }, [session]);

  if (!session) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <h1 className="mb-4">欢迎使用笔记应用</h1>
              <p className="lead mb-4">一个简单好用的在线笔记工具，随时记录你的想法。</p>
              <div className="d-flex justify-content-center gap-3">
                <Link href="/login" className="btn btn-primary btn-lg">登录</Link>
                <Link href="/register" className="btn btn-outline-secondary btn-lg">注册</Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-3">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">我的笔记</h1>
            <div className="mb-4">
              <Link href="/notes/create" className="btn btn-primary">新建笔记</Link>
            </div>
            {notes.length > 0 ? (
              <div className="row">
                {notes.map(note => (
                  <div key={note.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100" style={{ transition: 'transform 0.2s' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = '';
                        (e.currentTarget as HTMLElement).style.boxShadow = '';
                      }}
                    >
                      <div className="card-body">
                        <h5 className="card-title">
                          {note.title === '待做' || note.title === '待记忆' ? (
                            <span style={{ color: '#fd0707' }}>{note.title}</span>
                          ) : (
                            note.title
                          )}
                        </h5>
                        <p className="card-text">
                          {!note.content && <span style={{ color: '#fd0707' }}>空</span>}
                        </p>
                        <p className="card-text text-muted">
                          {note.updated_at
                            ? <>更新于: <span>{formatDatetime(note.updated_at)}</span></>
                            : <>创建于: <span>{formatDatetime(note.created_at)}</span></>
                          }
                        </p>
                        <Link href={`/notes/${note.id}/edit`} className="btn btn-outline-primary">编辑笔记</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                还没有笔记，开始创建你的第一个笔记吧！
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
