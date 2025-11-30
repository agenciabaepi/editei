import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

// DELETE - Delete a font
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    try {
      // Get font info before deleting
      const fontResult = await client.query(
        'SELECT file_url FROM custom_fonts WHERE id = $1',
        [id]
      );

      if (fontResult.rows.length === 0) {
        client.release();
        return NextResponse.json({ error: "Font not found" }, { status: 404 });
      }

      // Delete font from database
      await client.query('DELETE FROM custom_fonts WHERE id = $1', [id]);

      // TODO: Optionally delete the file from filesystem
      // const filePath = join(process.cwd(), 'public', fontResult.rows[0].file_url);
      // if (existsSync(filePath)) {
      //   await unlink(filePath);
      // }

      return NextResponse.json({ message: "Font deleted successfully" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting font:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update font (toggle active/popular)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { is_active, is_popular, is_pro } = body;

    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (typeof is_active === 'boolean') {
        updates.push(`is_active = $${paramCount++}`);
        values.push(is_active);
      }

      if (typeof is_popular === 'boolean') {
        updates.push(`is_popular = $${paramCount++}`);
        values.push(is_popular);
      }

      if (typeof is_pro === 'boolean') {
        updates.push(`is_pro = $${paramCount++}`);
        values.push(is_pro);
      }

      if (updates.length === 0) {
        client.release();
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
      }

      updates.push(`updated_at = $${paramCount++}`);
      values.push(new Date());
      values.push(id);

      const result = await client.query(
        `UPDATE custom_fonts 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        client.release();
        return NextResponse.json({ error: "Font not found" }, { status: 404 });
      }

      return NextResponse.json({
        message: "Font updated successfully",
        font: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating font:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

