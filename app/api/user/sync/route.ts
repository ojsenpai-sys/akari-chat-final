import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// SchemaのEnum定義に合わせてポイントを設定
const BONUS_POINTS = {
  FREE: 0,
  PRO: 300,
  ROYAL: 500,
};

// 日本時間(JST)で日付が同じか判定する関数
const isSameDayJST = (date1: Date, date2: Date) => {
  const d1 = new Date(date1).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const d2 = new Date(date2).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
  return d1 === d2;
};

// 1. 状態を取得する (ロード時 & ログインボーナス判定)
export async function GET() {
  const session = await getServerSession(authOptions);

  // セッションがない（ログインしていない）場合は401エラー
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    // lastLoginAtの初期値対応
    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(0);
    
    let bonusMessage = null;
    let pointsToAdd = 0;

    // --- ログインボーナス判定 ---
    // 日付が変わっている場合のみボーナス付与
    if (!isSameDayJST(lastLogin, now)) {
      // Enumの値をキーにしてポイントを取得 (大文字小文字の違いを吸収)
      const planKey = (user.plan as string).toUpperCase() as keyof typeof BONUS_POINTS || 'FREE';
      pointsToAdd = BONUS_POINTS[planKey] || 0;

      // ボーナス付与とログイン時刻の更新
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          points: { increment: pointsToAdd },
          lastLoginAt: now,
        },
      });

      // 最新の値を返すために変数を更新
      user.points = updatedUser.points;
      user.lastLoginAt = updatedUser.lastLoginAt;

      if (pointsToAdd > 0) {
        bonusMessage = `ログインボーナス！${pointsToAdd}ポイントを獲得しました。`;
      }
    } else {
      // 日付が同じでもログイン時刻だけは更新（活動ログ）
      await prisma.user.update({
        where: { email: session.user.email },
        data: { lastLoginAt: now },
      });
    }

    // フロントエンドに必要な全データを返す
    return NextResponse.json({
      currentOutfit: user.currentOutfit,
      currentEvent: user.currentEvent,
      points: user.points,
      affection: user.affection,
      plan: user.plan,
      bonusMessage: bonusMessage,
    });

  } catch (error) {
    console.error('Sync API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. 状態を保存する (着替え・イベント発生時)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { outfit, event } = body;

    // ユーザー情報を更新
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        currentOutfit: outfit, // undefinedなら更新されない
        currentEvent: event,   // nullなら解除
      },
    });

    return NextResponse.json({
      success: true,
      currentOutfit: user.currentOutfit,
      currentEvent: user.currentEvent,
    });

  } catch (error) {
    console.error('State Update Error:', error);
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}