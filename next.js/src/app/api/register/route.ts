import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, createUser } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { username, password, confirmPassword } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
  }
  if (username.length < 4 || username.length > 20) {
    return NextResponse.json({ error: '用户名长度需要4-20个字符' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码长度至少6个字符' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: '两次输入的密码不匹配' }, { status: 400 });
  }

  const existing = getUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: '用户名已被使用' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  createUser(username, hash);

  return NextResponse.json({ success: true, message: '注册成功，请登录' });
}
