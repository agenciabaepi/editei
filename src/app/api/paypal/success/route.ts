import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const amount = searchParams.get('amount');
    const planName = searchParams.get('planName');
    const planPeriod = searchParams.get('planPeriod');
    const token = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    if (!userId || !token || !payerId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription?error=missing_params`);
    }

    console.log('🎉 PayPal payment successful for user:', userId);
    console.log('PayPal token:', token, 'PayerID:', payerId);

    const client = await pool.connect();
    
    try {
      // Create subscription entry for successful PayPal payment
      const mockEndDate = new Date();
      mockEndDate.setMonth(mockEndDate.getMonth() + 1); // 1 month from now
      
      // Check if subscription already exists
      const existingResult = await client.query(
        `SELECT id FROM subscriptions WHERE user_id = $1`,
        [userId]
      );

      if (existingResult.rows.length > 0) {
        await client.query(
          `UPDATE subscriptions 
           SET stripe_subscription_id = $1, stripe_customer_id = $2, stripe_price_id = $3, 
               stripe_current_period_end = $4, status = $5, updated_at = $6 
           WHERE user_id = $7`,
          [
            `paypal_${token}`,
            `paypal_customer_${payerId}`,
            'price_paypal_pro',
            mockEndDate,
            'active',
            new Date(),
            userId
          ]
        );
        console.log('📝 Updated existing subscription with PayPal data');
      } else {
        await client.query(
          `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, stripe_current_period_end, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userId,
            `paypal_${token}`,
            `paypal_customer_${payerId}`,
            'price_paypal_pro',
            mockEndDate,
            'active',
            new Date(),
            new Date()
          ]
        );
        console.log('➕ Created new subscription with PayPal data');
      }
      
      client.release();
      console.log('✅ PayPal payment processed successfully for user:', userId);
      
      // Redirect to subscription page with success
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=paypal`);
    } catch (dbError) {
      console.error('❌ Database error processing PayPal payment:', dbError);
      client.release();
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription?error=db_error`);
    }
  } catch (error) {
    console.error('❌ Error processing PayPal success:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/subscription?error=processing_error`);
  }
}
