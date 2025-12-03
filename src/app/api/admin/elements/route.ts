import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";
import { saveUploadedFile } from "@/lib/file-upload";

export const dynamic = 'force-dynamic';

// GET - List all elements (with filters)
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM elements WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (isActive !== null) {
      query += ` AND is_active = $${paramCount}`;
      params.push(isActive === 'true');
      paramCount++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

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

// POST - Create new element
export async function POST(request: NextRequest) {
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
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string;
    const fileType = formData.get("file_type") as string;
    const isPro = formData.get("is_pro") === "true";
    const isActive = formData.get("is_active") !== "false"; // Default to true
    const tagsString = formData.get("tags") as string | null;
    const width = formData.get("width") ? parseInt(formData.get("width") as string) : null;
    const height = formData.get("height") ? parseInt(formData.get("height") as string) : null;
    
    const elementFile = formData.get("file") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!name || !category || !fileType || !elementFile) {
      client.release();
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse tags
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];

    // Handle file upload
    let fileUrl = null;
    if (elementFile && elementFile.size > 0) {
      try {
        fileUrl = await saveUploadedFile(elementFile, 'elements');
      } catch (error) {
        console.error('Failed to save element file:', error);
        client.release();
        return NextResponse.json(
          { error: "Failed to upload element file" },
          { status: 500 }
        );
      }
    }

    // Handle thumbnail upload
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        thumbnailUrl = await saveUploadedFile(thumbnailFile, 'elements/thumbnails');
      } catch (error) {
        console.error('Failed to save thumbnail:', error);
        // Don't fail if thumbnail fails, just log it
      }
    }

    // Insert new element
    const result = await client.query(
      `INSERT INTO elements (
        name, description, category, file_url, thumbnail_url, 
        width, height, file_type, tags, is_pro, is_active, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING *`,
      [
        name,
        description,
        category,
        fileUrl,
        thumbnailUrl,
        width,
        height,
        fileType,
        tags,
        isPro,
        isActive,
        session.user.id,
        new Date(),
        new Date()
      ]
    );

    const newElement = result.rows[0];
    client.release();

    return NextResponse.json({
      message: "Element created successfully",
      element: newElement,
    });
  } catch (error) {
    console.error("Error creating element:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

