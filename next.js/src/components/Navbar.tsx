'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NoteItem {
  id: number;
  title: string;
  content: string | null;
}

export default function Navbar() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<NoteItem[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/notes')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setNotes(data.slice(0, 20));
        })
        .catch(() => {});
    }
  }, [session]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {session?.user ? (
          <>
            <div className="dropdown">
              <a
                className="navbar-brand dropdown-toggle"
                href="#"
                id="notesDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                笔记列表
              </a>
              <ul className="dropdown-menu" aria-labelledby="notesDropdown">
                {notes.map(note => (
                  <li key={note.id}>
                    <Link className="dropdown-item" href={`/notes/${note.id}/edit`}>
                      {note.title}
                      {!note.content && <span style={{ color: '#fd0707' }}> 空</span>}
                    </Link>
                  </li>
                ))}
                {notes.length === 0 && (
                  <li><span className="dropdown-item text-muted">暂无笔记</span></li>
                )}
              </ul>
            </div>

            {/* 移动端按钮 */}
            <div className="d-flex d-lg-none">
              <Link href="/" className="btn btn-sm btn-outline-light me-2">所有笔记</Link>
              <Link href="/notes/create" className="btn btn-sm btn-outline-light me-2">新建笔记</Link>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-sm btn-outline-light">退出</button>
            </div>

            {/* 大屏幕导航 */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item"><Link className="nav-link" href="/">所有笔记</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/notes/create">新建笔记</Link></li>
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-link nav-link">退出</button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link className="navbar-brand" href="/">笔记应用</Link>
            <div className="d-flex d-lg-none">
              <Link href="/login" className="btn btn-sm btn-outline-light me-2">登录</Link>
              <Link href="/register" className="btn btn-sm btn-outline-light">注册</Link>
            </div>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item"><Link className="nav-link" href="/login">登录</Link></li>
                <li className="nav-item"><Link className="nav-link" href="/register">注册</Link></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
