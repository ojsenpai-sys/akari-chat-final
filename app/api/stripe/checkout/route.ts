import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Stripe from 'stripe';

// 7行目のエラー修正: apiVersionの指定を削除（自動設定に任せる）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(req: Request) {
  try {
    // 13行目のエラー修正: { req } だと型エラーになる場合があるため { req: req as any } に変更
    const token = await getToken({ req: req as any });

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub; 
    const userEmail = token.email; 

    // クライアントからは「プラン名」だけを受け取る
    const { plan } = await req.json();

    let priceId = '';
    // 型エラー防止のため、Stripeの型定義を使用せずに文字列として扱う
    let mode: 'subscription' | 'payment' = 'subscription';

    switch (plan) {
      case 'PRO':
        priceId = process.env.STRIPE_PRICE_ID_PRO!;
        mode = 'subscription';
        break;
      case 'ROYAL':
        priceId = process.env.STRIPE_PRICE_ID_ROYAL!;
        mode = 'subscription';
        break;
      case 'TICKET':
        priceId = process.env.STRIPE_PRICE_ID_TICKET!;
        mode = 'payment'; 
        break;
      default:
        return NextResponse.json({ error: '無効なプランです' }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: 'Server Error: Price ID not found' }, { status: 500 });
    }

    const origin = process.env.NEXTAUTH_URL || 'https://akari-chat-final.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId,
        plan: plan,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}