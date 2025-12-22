import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is missing');
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed.', error.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // ■ イベント処理：決済完了（初回）
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // メタデータからユーザーIDや購入タイプを取得
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;         // 'plan' または 'ticket'
    const planName = session.metadata?.planName; // 'PRO' または 'ROYAL'

    if (userId) {
      try {
        if (type === 'plan' && planName) {
          // ==========================================
          // パターンA: サブスクプラン加入
          // ==========================================
          
          // プランに応じたポイントを決定
          // (Royalなら500pt、Proなら300pt)
          let pointsToAdd = 300; 
          if (planName.toUpperCase().includes('ROYAL')) {
             pointsToAdd = 500;
          }

          // DB更新: プラン変更 ＋ ポイント付与
          await prisma.user.update({
            where: { id: userId },
            data: { 
              plan: planName as any,       // 'PRO' or 'ROYAL'
              points: { increment: pointsToAdd },
              // ※プランに入ったらチケット残数をリセットしたい場合はここで purchasedTickets: 0 もありですが、
              //   今回は「繰り越し」仕様なのでリセットしません。
            },
          });
          console.log(`User ${userId} upgraded to ${planName} and got ${pointsToAdd} points.`);

        } else if (type === 'ticket') {
          // ==========================================
          // パターンB: 会話チケット単発購入
          // ==========================================
          
          // ポイントではなく「会話チケット残数」を増やす！
          await prisma.user.update({
            where: { id: userId },
            data: { 
              purchasedTickets: { increment: 100 } // ★ここが修正ポイント！
            },
          });
          console.log(`User ${userId} purchased +100 chat tickets.`);
        }

      } catch (dbError) {
        console.error('Database update failed:', dbError);
        return NextResponse.json({ error: 'DB Error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}