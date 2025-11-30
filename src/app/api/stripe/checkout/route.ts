import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userSession = await getCurrentSession();
    if (!userSession?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency') || 'usd';
    const planName = searchParams.get('planName');
    const planPeriod = searchParams.get('planPeriod');
    const mode = searchParams.get('mode') || 'sandbox';

    if (!amount || !planName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log("🛒 Creating Stripe checkout for user:", userSession.user.id, "plan:", planName);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `${planName} Plan`,
              description: `${planName} subscription - ${planPeriod}`,
            },
            unit_amount: parseInt(amount),
            recurring: planPeriod === 'month' ? {
              interval: 'month',
            } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: planPeriod === 'month' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=1`,
      metadata: {
        userId: userSession.user.id,
        planName,
        planPeriod,
        mode,
      },
    });

    console.log("✅ Stripe checkout session created:", checkoutSession.id);
    return NextResponse.redirect(checkoutSession.url!);
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
