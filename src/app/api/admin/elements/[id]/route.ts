import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";
import { saveUploadedFile } from "@/lib/file-upload";

export const dynamic = 'force-dynamic';

// GET - Get single element
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = await client.query(
      'SELECT * FROM elements WHERE id = $1',
      [params.id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 });
    }

    return NextResponse.json({ element: result.rows[0] });
  } catch (error) {
    console.error("Error fetching element:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update element
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string | null;
    const fileType = formData.get("file_type") as string | null;
    const isPro = formData.get("is_pro");
    const isActive = formData.get("is_active");
    const tagsString = formData.get("tags") as string | null;
    const width = formData.get("width") ? parseInt(formData.get("width") as string) : null;
    const height = formData.get("height") ? parseInt(formData.get("height") as string) : null;
    
    const elementFile = formData.get("file") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    // Get current element
    const currentResult = await client.query(
      'SELECT * FROM elements WHERE id = $1',
      [params.id]
    );

    if (currentResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: "Element not found" }, { status: 404 });
    }

    const currentElement = currentResult.rows[0];

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== null) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== null) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (category !== null) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    if (fileType !== null) {
      updates.push(`file_type = $${paramCount}`);
      values.push(fileType);
      paramCount++;
    }

    if (isPro !== null) {
      updates.push(`is_pro = $${paramCount}`);
      values.push(isPro === "true");
      paramCount++;
    }

    if (isActive !== null) {
      updates.push(`is_active = $${paramCount}`);
      values.push(isActive === "true");
      paramCount++;
    }

    if (tagsString !== null) {
      const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];
      updates.push(`tags = $${paramCount}`);
      values.push(tags);
      paramCount++;
    }

    if (width !== null) {
      updates.push(`width = $${paramCount}`);
      values.push(width);
      paramCount++;
    }

    if (height !== null) {
      updates.push(`height = $${paramCount}`);
      values.push(height);
      paramCount++;
    }

    // Handle file uploads
    if (elementFile && elementFile.size > 0) {
      try {
        const fileUrl = await saveUploadedFile(elementFile, 'elements');
        updates.push(`file_url = $${paramCount}`);
        values.push(fileUrl);
        paramCount++;
      } catch (error) {
        console.error('Failed to save element file:', error);
      }
    }

    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        const thumbnailUrl = await saveUploadedFile(thumbnailFile, 'elements/thumbnails');
        updates.push(`thumbnail_url = $${paramCount}`);
        values.push(thumbnailUrl);
        paramCount++;
      } catch (error) {
        console.error('Failed to save thumbnail:', error);
      }
    }

    if (updates.length === 0) {
      client.release();
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(params.id);

    const result = await client.query(
      `UPDATE elements SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    client.release();

    return NextResponse.json({
      message: "Element updated successfully",
      element: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating element:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete element
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const result = await client.query(
      'DELETE FROM elements WHERE id = $1 RETURNING *',
      [params.id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Element deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting element:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

