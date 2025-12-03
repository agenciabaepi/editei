import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

// GET - Get public elements (for editor use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isPro = searchParams.get('is_pro'); // Filter by pro status if needed

    let query = `
      SELECT 
        id, name, description, category, file_url, thumbnail_url, 
        width, height, file_type, tags, is_pro, created_at
      FROM elements 
      WHERE is_active = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // If is_pro filter is provided, filter by it
    if (isPro !== null) {
      query += ` AND is_pro = $${paramCount}`;
      params.push(isPro === 'true');
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const client = await pool.connect();
    const result = await client.query(query, params);
    client.release();

    return NextResponse.json({ elements: result.rows });
  } catch (error) {
    console.error("Error fetching elements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

