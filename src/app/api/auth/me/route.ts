import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get user role from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT role FROM users WHERE id = $1',
        [session.user.id]
      );
      
      const userRole = result.rows[0]?.role || 'user';
      
      return NextResponse.json({
        success: true,
        user: {
          ...session.user,
          role: userRole
        }
      });
    } finally {
      client.release();
    }
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}
