import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getNotesByUserId, createNote } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = (session.user as any).id as number;
  const notes = getNotesByUserId(userId);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { title, content } = await req.json();
  if (!title) {
    return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
  }

  const userId = (session.user as any).id as number;
  const id = createNote(title, content || '', userId);
  return NextResponse.json({ success: true, id });
}
