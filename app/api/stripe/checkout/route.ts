import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@/lib/stripe';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe'; // 型定義のためにimport

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { priceId, mode, planName } = await req.json();

    const metadata: any = {
      userId: user.id,
      type: mode === 'payment' ? 'ticket' : 'plan',
    };

    if (mode === 'subscription') {
      metadata.planName = planName;
    }

    // ★修正: mode の型を明示的に指定しました
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode, // ←ここを修正
      success_url: `${YOUR_DOMAIN}/plans?success=true`,
      cancel_url: `${YOUR_DOMAIN}/plans?canceled=true`,
      customer_email: user.email || undefined, // nullの場合はundefinedにする
      metadata: metadata,
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}