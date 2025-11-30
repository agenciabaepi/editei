import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;
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
    try {
      // Check if template exists and is actually a template
      const checkResult = await client.query(
        'SELECT id FROM projects WHERE id = $1 AND is_template = true',
        [templateId]
      );

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      // Delete the template
      await client.query(
        'DELETE FROM projects WHERE id = $1 AND is_template = true',
        [templateId]
      );

      return NextResponse.json({
        message: "Template deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
