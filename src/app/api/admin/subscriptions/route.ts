import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const client = await pool.connect();
    const userResult = await client.query(
      `SELECT role FROM users WHERE id = $1`,
      [session.user.id]
    );
    
    if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
      client.release();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all subscriptions with user information
    const subscriptionsResult = await client.query(`
      SELECT 
        s.id,
        s.user_id,
        s.stripe_subscription_id,
        s.stripe_customer_id,
        s.status,
        s.stripe_current_period_end,
        s.created_at,
        u.email as user_email,
        u.name as user_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    
    client.release();

    return NextResponse.json({ subscriptions: subscriptionsResult.rows });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    
    // Check if user is admin
    const userResult = await client.query(
      `SELECT role FROM users WHERE id = $1`,
      [session.user.id]
    );
    
    if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
      client.release();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { user_id, plan, status } = await request.json();

    if (!user_id || !plan || !status) {
      client.release();
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists
    const userExists = await client.query(
      `SELECT id FROM users WHERE id = $1`,
      [user_id]
    );

    if (!userExists.rows[0]) {
      client.release();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await client.query(
      `SELECT id FROM subscriptions WHERE user_id = $1 AND status = 'active'`,
      [user_id]
    );

    if (existingSubscription.rows[0]) {
      client.release();
      return NextResponse.json({ error: "User already has an active subscription" }, { status: 400 });
    }

    // Generate mock Stripe IDs for demo purposes
    const stripeCustomerId = `cus_${Math.random().toString(36).substring(2, 15)}`;
    const stripeSubscriptionId = `sub_${Math.random().toString(36).substring(2, 15)}`;
    
    // Calculate period end based on plan
    const currentPeriodEnd = new Date();
    if (plan === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (plan === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    // Create subscription
    const result = await client.query(`
      INSERT INTO subscriptions (
        user_id, 
        stripe_subscription_id, 
        stripe_customer_id, 
        status, 
        stripe_current_period_end,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [user_id, stripeSubscriptionId, stripeCustomerId, status, currentPeriodEnd]);

    client.release();

    return NextResponse.json({ 
      message: "Subscription created successfully",
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
