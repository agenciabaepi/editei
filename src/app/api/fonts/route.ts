import { NextResponse } from "next/server";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

// GET - List all active custom fonts (public endpoint for font-loader)
export async function GET() {
  try {
    console.log('[API /api/fonts] Request received');
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
      } catch (e) {
        // If no session, user is not PRO
        console.log('[API /api/fonts] No session or error checking subscription:', e);
      }

      // Return all active fonts, let frontend handle PRO filtering for better UX
      // This way users can see PRO fonts exist but will be blocked when trying to use
      console.log('[API /api/fonts] Querying database...');
      const result = await client.query(
        `SELECT 
          cf.id, 
          cf.name, 
          cf.family_name, 
          cf.category, 
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
        GROUP BY cf.id, cf.name, cf.family_name, cf.category, cf.is_popular, cf.is_pro, cf.created_at
        ORDER BY cf.is_popular DESC, cf.created_at DESC`
      );
      
      console.log('[API /api/fonts] Found', result.rows.length, 'fonts');
      return NextResponse.json({ fonts: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[API /api/fonts] Error fetching fonts:", error);
    return NextResponse.json(
      { fonts: [], error: error instanceof Error ? error.message : 'Unknown error' }, // Return empty array on error
      { status: 200 }
    );
  }
}

