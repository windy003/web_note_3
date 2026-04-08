'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (session) router.push('/');
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('用户名或密码错误');
    } else {
      router.push('/');
    }
  }

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-container">
          <div className="login-form-wrapper">
            <div className="login-header">
              <div className="login-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L19 7L14.74 13.09L21 12L14.74 10.91L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 10.91L3 12L9.26 13.09L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <h1 className="login-title">欢迎回来</h1>
              <p className="login-subtitle">登录您的笔记账户</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}><span className="error">{error}</span></div>}

              <div className="form-group">
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                  </svg>
                  <input
                    type="text"
                    className="form-input"
                    placeholder=" "
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    minLength={4}
                    maxLength={20}
                  />
                  <label className="form-label">用户名</label>
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 17C10.89 17 10 16.1 10 15C10 13.89 10.89 13 12 13C13.11 13 14 13.89 14 15C14 16.1 13.11 17 12 17ZM18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM8.9 6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8H8.9V6Z" fill="currentColor"/>
                  </svg>
                  <input
                    type="password"
                    className="form-input"
                    placeholder=" "
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <label className="form-label">密码</label>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-wrapper">
                  <input type="checkbox" className="checkbox-input" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">保持登录状态</span>
                </label>
              </div>

              <button type="submit" className="login-btn">
                <span>登录</span>
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8.91 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.91 4.08" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>

            <div className="auth-links">
              <p>还没有账号？<Link href="/register" className="register-link">立即注册</Link></p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }
        .login-container { width: 100%; max-width: 420px; }
        .login-form-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .login-header { text-align: center; margin-bottom: 2.5rem; }
        .login-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px; color: white; margin-bottom: 1.5rem;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .login-title { font-size: 2rem; font-weight: 700; color: #2d3748; margin: 0 0 0.5rem 0; }
        .login-subtitle { color: #718096; font-size: 1rem; margin: 0; }
        .form-group { margin-bottom: 1.5rem; }
        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #a0aec0; z-index: 2; }
        .form-input {
          width: 100%; padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e2e8f0; border-radius: 12px;
          background-color: #f7fafc; font-size: 1rem;
          transition: all 0.3s ease; box-sizing: border-box;
        }
        .form-input:focus { outline: none; border-color: #667eea; background-color: #fff; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        .form-input:focus + .form-label,
        .form-input:not(:placeholder-shown) + .form-label {
          transform: translateY(-2.5rem) scale(0.85); color: #667eea;
        }
        .form-label {
          position: absolute; left: 3rem; top: 1rem; color: #a0aec0;
          font-size: 1rem; transition: all 0.3s ease; pointer-events: none; transform-origin: left top;
        }
        .checkbox-group { margin: 1.5rem 0; }
        .checkbox-wrapper { display: flex; align-items: center; cursor: pointer; user-select: none; }
        .checkbox-input { position: absolute; opacity: 0; cursor: pointer; }
        .checkbox-custom {
          width: 20px; height: 20px; border: 2px solid #e2e8f0; border-radius: 6px;
          margin-right: 0.75rem; position: relative; transition: all 0.3s ease; background-color: #f7fafc;
        }
        .checkbox-label { color: #4a5568; font-size: 0.95rem; }
        .login-btn {
          width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; border: none; padding: 1rem 2rem; border-radius: 12px;
          font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6); }
        .auth-links { text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; }
        .auth-links p { color: #718096; margin: 0; font-size: 0.95rem; }
        .error { color: #e53e3e; font-size: 0.85rem; font-weight: 500; }
        @media (max-width: 480px) {
          .login-page { padding: 1rem; min-height: calc(100vh - 80px); }
          .login-form-wrapper { padding: 2rem 1.5rem; border-radius: 16px; }
          .login-title { font-size: 1.75rem; }
          .login-icon { width: 60px; height: 60px; border-radius: 16px; }
        }
      `}</style>
    </>
  );
}
