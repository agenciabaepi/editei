import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 401 });
  }

  // Validate token format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    
    // Fetch project without user restriction for shared access
    const result = await client.query(
      `SELECT id, name, json, width, height, thumbnail, created_at, updated_at 
       FROM projects 
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = result.rows[0];
    
    // Add shared context
    const sharedProject = {
      ...project,
      isShared: true,
      shareToken: token,
    };

    return NextResponse.json({ data: sharedProject });
  } catch (error) {
    console.error("Error fetching shared project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
