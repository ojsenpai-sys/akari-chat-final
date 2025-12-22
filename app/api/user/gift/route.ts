import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // ▼ 修正点1：ここでメールアドレスを変数に確保してしまう
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cost, affectionGain } = await req.json();

    if (typeof cost !== 'number' || typeof affectionGain !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // トランザクション処理
    const result = await prisma.$transaction(async (tx) => {
      // 1. 最新のユーザー情報を取得
      const user = await tx.user.findUnique({
        // ▼ 修正点2：session...ではなく、確保した変数を使う
        where: { email: userEmail },
      });

      if (!user) throw new Error('User not found');

      // 2. ポイントが足りるかチェック
      if (user.points < cost) {
        throw new Error('Insufficient points');
      }

      // 3. データを更新
      const updatedUser = await tx.user.update({
        // ▼ 修正点3：ここも変数を使う
        where: { email: userEmail },
        data: {
          points: { decrement: cost },
          affection: { increment: affectionGain },
        },
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      points: result.points,
      affection: result.affection,
    });

  } catch (error: any) {
    if (error.message === 'Insufficient points') {
      return NextResponse.json({ error: 'ポイントが不足しています' }, { status: 402 });
    }
    console.error('Gift Transaction Error:', error);
    return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
  }
}