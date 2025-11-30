import { NextResponse } from "next/server";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

// GET - List all active custom fonts (public endpoint for font-loader)
export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Get user subscription status if session exists
      let isPro = false;
      try {
        const { getCurrentSession } = await import("@/lib/auth");
        const session = await getCurrentSession();
        if (session?.user?.id) {
          const userClient = await pool.connect();
          try {
            const subResult = await userClient.query(
              `SELECT status, stripe_current_period_end 
               FROM subscriptions 
               WHERE user_id = $1 AND status = 'active' AND stripe_current_period_end > NOW()`,
              [session.user.id]
            );
            isPro = subResult.rows.length > 0;
          } finally {
            userClient.release();
          }
        }
      } catch {
        // If no session, user is not PRO
      }

      // Return all active fonts, let frontend handle PRO filtering for better UX
      // This way users can see PRO fonts exist but will be blocked when trying to use
      const result = await client.query(
        `SELECT 
          cf.id, 
          cf.name, 
          cf.family_name, 
          cf.category, 
          cf.weights, 
          cf.file_url, 
          cf.file_format, 
          cf.is_popular,
          cf.is_pro,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ff.id,
                'file_url', ff.file_url,
                'file_format', ff.file_format,
                'file_size', ff.file_size,
                'weight', ff.weight,
                'style', ff.style
              )
            ) FILTER (WHERE ff.id IS NOT NULL),
            '[]'::json
          ) as font_files
        FROM custom_fonts cf
        LEFT JOIN font_files ff ON cf.id = ff.font_id
        WHERE cf.is_active = true
        GROUP BY cf.id
        ORDER BY cf.is_popular DESC, cf.created_at DESC`
      );
      
      return NextResponse.json({ fonts: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching fonts:", error);
    return NextResponse.json(
      { fonts: [] }, // Return empty array on error
      { status: 200 }
    );
  }
}

