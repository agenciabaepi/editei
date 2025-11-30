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

    // Get all projects with user information
    const projectsResult = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.user_id,
        p.is_template,
        p.width,
        p.height,
        p.created_at,
        p.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM projects p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.updated_at DESC
    `);
    
    client.release();

    return NextResponse.json({ projects: projectsResult.rows });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
