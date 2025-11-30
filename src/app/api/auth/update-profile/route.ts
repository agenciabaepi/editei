import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Profile update request received');
    
    const session = await getCurrentSession();
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session found for user:', session.user.id);

    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { name, email } = body;

    if (!name || !email) {
      console.log('❌ Missing required fields:', { name, email });
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      console.log('🔄 Updating user profile in database...');
      
      // Update user profile
      const result = await client.query(
        `UPDATE users 
         SET name = $1, email = $2, updated_at = $3 
         WHERE id = $4 
         RETURNING id, name, email`,
        [name, email, new Date(), session.user.id]
      );

      console.log('📊 Database update result:', result.rows);

      if (result.rows.length === 0) {
        console.log('❌ User not found in database');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updatedUser = result.rows[0];
      console.log('✅ Profile updated successfully:', updatedUser);
      
      return NextResponse.json({ 
        success: true, 
        user: updatedUser,
        message: 'Profile updated successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
