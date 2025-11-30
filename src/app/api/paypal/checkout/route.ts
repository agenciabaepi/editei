import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`);
    }

    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency') || 'USD';
    const planName = searchParams.get('planName');
    const planPeriod = searchParams.get('planPeriod');
    const mode = searchParams.get('mode') || 'sandbox';

    if (!amount || !planName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const isLive = mode === 'live';
    const clientId = isLive 
      ? process.env.PAYPAL_CLIENT_ID 
      : process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;

    // PayPal API base URL
    const baseURL = isLive 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    // Get PayPal access token
    const auth = Buffer.from(
      `${clientId}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();

    // Create PayPal order with user metadata
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
          description: `${planName} Plan - ${planPeriod}`,
          custom_id: session.user.id, // Store user ID for later processing
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paypal/success?userId=${session.user.id}&amount=${amount}&planName=${planName}&planPeriod=${planPeriod}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      },
    };

    const orderResponse = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const order = await orderResponse.json();

    // Find the approval URL
    const approvalUrl = order.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL found');
    }

    return NextResponse.redirect(approvalUrl);
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal checkout' },
      { status: 500 }
    );
  }
}
