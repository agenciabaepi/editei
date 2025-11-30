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

    // Get total users
    const usersResult = await client.query(`SELECT COUNT(*) as count FROM users`);
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get subscription stats
    const subscriptionsResult = await client.query(`SELECT COUNT(*) as count FROM subscriptions`);
    const totalSubscriptions = parseInt(subscriptionsResult.rows[0].count);

    const activeSubscriptionsResult = await client.query(`
      SELECT COUNT(*) as count FROM subscriptions 
      WHERE status = 'active' AND stripe_current_period_end > NOW()
    `);
    const activeSubscriptions = parseInt(activeSubscriptionsResult.rows[0].count);

    // Get project stats
    const projectsResult = await client.query(`
      SELECT COUNT(*) as count FROM projects 
      WHERE is_template = false OR is_template IS NULL
    `);
    const totalProjects = parseInt(projectsResult.rows[0].count);

    // Get template stats
    const templatesResult = await client.query(`
      SELECT COUNT(*) as count FROM projects WHERE is_template = true
    `);
    const totalTemplates = parseInt(templatesResult.rows[0].count);

    const proTemplatesResult = await client.query(`
      SELECT COUNT(*) as count FROM projects WHERE is_template = true AND is_pro = true
    `);
    const proTemplates = parseInt(proTemplatesResult.rows[0].count);

    // Get new users this month
    const newUsersResult = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const newUsersThisMonth = parseInt(newUsersResult.rows[0].count);

    // Calculate revenue this month (assuming $10/month per active subscription)
    const revenueThisMonth = activeSubscriptions * 10;

    // Get active users today (users who have projects updated today)
    const activeUsersResult = await client.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM projects 
      WHERE DATE(updated_at) = CURRENT_DATE
    `);
    const activeUsersToday = parseInt(activeUsersResult.rows[0].count);

    client.release();

    const stats = {
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalProjects,
      totalTemplates,
      proTemplates,
      newUsersThisMonth,
      revenueThisMonth,
      activeUsersToday,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
