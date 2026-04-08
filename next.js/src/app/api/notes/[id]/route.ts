import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getNoteById, updateNote, deleteNote } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const note = getNoteById(Number(params.id));
  if (!note || note.user_id !== (session.user as any).id) {
    return NextResponse.json({ error: '笔记不存在或无权限访问' }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const note = getNoteById(Number(params.id));
  if (!note || note.user_id !== (session.user as any).id) {
    return NextResponse.json({ error: '笔记不存在或无权限' }, { status: 404 });
  }

  const { title, content } = await req.json();
  updateNote(note.id, title ?? note.title ?? '', content ?? note.content ?? '');

  return NextResponse.json({ success: true, message: '笔记已保存' });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const note = getNoteById(Number(params.id));
  if (!note || note.user_id !== (session.user as any).id) {
    return NextResponse.json({ error: '笔记不存在或无权限' }, { status: 404 });
  }

  deleteNote(note.id);
  return NextResponse.json({ success: true, message: '笔记已删除' });
}
