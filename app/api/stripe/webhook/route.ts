import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// 外部ファイル読み込みによるエラーを防ぐため、ここで直接初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // ★修正：headers() を使わず、req.headers から直接取得（これで赤字解消）
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is missing');
    }
    // 署名の検証（なりすまし防止）
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed.', error.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // ■ 決済完了イベントの処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // メタデータの取り出し
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan; 

    if (userId && plan) {
      try {
        if (plan === 'TICKET') {
          // ==========================================
          // パターンB: 会話チケット単発購入
          // ==========================================
          await prisma.user.update({
            where: { id: userId },
            data: { 
              purchasedTickets: { increment: 100 } 
            },
          });
          console.log(`User ${userId} purchased +100 tickets.`);

        } else {
          // ==========================================
          // パターンA: サブスクプラン加入 (PRO / ROYAL)
          // ==========================================
          
          // プラン加入時のボーナスポイント
          let pointsToAdd = 0;
          if (plan === 'PRO') pointsToAdd = 500;   // PROなら500pt
          if (plan === 'ROYAL') pointsToAdd = 1000; // ROYALなら1000pt

          await prisma.user.update({
            where: { id: userId },
            data: { 
              plan: plan as any, // 'PRO' or 'ROYAL'
              points: { increment: pointsToAdd }, // ポイントも付与
            },
          });
          console.log(`User ${userId} upgraded to ${plan}. Points +${pointsToAdd}`);
        }

      } catch (dbError) {
        console.error('Database update failed:', dbError);
        return NextResponse.json({ error: 'DB Error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}