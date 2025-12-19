import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. 状態を取得する (ロード時)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // ユーザーがいなければデフォルトを返す
  if (!user) {
    return NextResponse.json({ currentOutfit: 'maid', currentEvent: null });
  }

  return NextResponse.json({
    currentOutfit: user.currentOutfit,
    currentEvent: user.currentEvent,
  });
}

// 2. 状態を保存する (着替え・イベント発生時)
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, outfit, event } = body;

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  // ユーザーを作成または更新
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      currentOutfit: outfit,
      currentEvent: event, // nullなら解除
    },
    create: {
      id: userId,
      currentOutfit: outfit || 'maid',
      currentEvent: event,
    },
  });

  return NextResponse.json(user);
}