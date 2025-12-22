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
    
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;
    const planName = session.metadata?.planName;

    if (userId) {
      try {
        if (type === 'plan' && planName) {
          // パターンA: プラン加入（ここでポイントも付与する！）
          
          // プランに応じたポイントを決定（名前はご自身のプラン名に合わせて調整してください）
          // 例: 'Royal'なら500、それ以外(Standard)なら300
          let pointsToAdd = 300; 
          if (planName.includes('Royal') || planName.includes('royal')) {
             pointsToAdd = 500;
          }

          await prisma.user.update({
            where: { id: userId },
            data: { 
              plan: planName as any,
              points: { increment: pointsToAdd } // ★ここを追加しました！
            },
          });
          console.log(`User ${userId} upgraded to ${planName} and got ${pointsToAdd} points.`);

        } else if (type === 'ticket') {
          // パターンB: 単発チケット（ポイント）購入
          // もしチケット＝ポイント購入なら、ここも points カラムにすべきかもしれません
          await prisma.user.update({
            where: { id: userId },
            data: { 
              // purchasedTickets: { increment: 100 } // 元のコード
              points: { increment: 100 } // ★ポイントを増やす形に変更（必要であれば）
            },
          });
          console.log(`User ${userId} purchased points.`);
        }
      } catch (dbError) {
        console.error('Database update failed:', dbError);
        return NextResponse.json({ error: 'DB Error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}