import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";
import { saveUploadedFile } from "@/lib/file-upload";

export const dynamic = 'force-dynamic';

export async function GET() {
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
    try {
      const result = await client.query(
        'SELECT id, name, width, height, is_pro, thumbnail, created_at FROM projects WHERE is_template = true ORDER BY created_at'
      );
      
      return NextResponse.json({ templates: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const json = formData.get("json") as string;
    const width = parseInt(formData.get("width") as string);
    const height = parseInt(formData.get("height") as string);
    const is_pro = formData.get("is_pro") === "true";
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!name || !json || !width || !height) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate JSON
    try {
      JSON.parse(json);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    // Handle thumbnail upload if provided
    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        thumbnailUrl = await saveUploadedFile(thumbnailFile, 'templates');
      } catch (error) {
        console.error('Failed to save thumbnail:', error);
        return NextResponse.json(
          { error: "Failed to save thumbnail image" },
          { status: 500 }
        );
      }
    }

    try {
      // Check if template with same name already exists
      const existingResult = await client.query(
        'SELECT id FROM projects WHERE name = $1 AND is_template = true',
        [name]
      );

      if (existingResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Template with this name already exists" },
          { status: 409 }
        );
      }

      // Insert new template
      const result = await client.query(
        'INSERT INTO projects (name, json, width, height, user_id, is_template, is_pro, thumbnail, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [name, json, width, height, session.user.id, true, is_pro, thumbnailUrl, new Date(), new Date()]
      );

      const newTemplate = result.rows[0];

      return NextResponse.json({
        message: "Template uploaded successfully",
        template: {
          id: newTemplate.id,
          name: newTemplate.name,
          width: newTemplate.width,
          height: newTemplate.height,
          is_pro: newTemplate.is_pro,
          thumbnail: newTemplate.thumbnail,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error uploading template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
