import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";
import { saveUploadedFile } from "@/lib/file-upload";

export const dynamic = 'force-dynamic';

// GET - List all custom fonts
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
        `SELECT 
          cf.id, 
          cf.name, 
          cf.family_name, 
          cf.category, 
          cf.weights, 
          cf.file_url, 
          cf.file_format, 
          cf.file_size, 
          cf.is_active, 
          cf.is_popular,
          cf.is_pro,
          cf.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ff.id,
                'file_url', ff.file_url,
                'file_format', ff.file_format,
                'file_size', ff.file_size,
                'weight', ff.weight,
                'style', ff.style
              )
            ) FILTER (WHERE ff.id IS NOT NULL),
            '[]'::json
          ) as font_files
        FROM custom_fonts cf
        LEFT JOIN font_files ff ON cf.id = ff.font_id
        GROUP BY cf.id
        ORDER BY cf.created_at DESC`
      );
      
      return NextResponse.json({ fonts: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching fonts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Upload a new font
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
    const familyName = formData.get("familyName") as string;
    const category = formData.get("category") as string || 'sans-serif';
    const isPopular = formData.get("isPopular") === "true";
    const isPro = formData.get("isPro") === "true";
    
    // Get all font files (can be single file or multiple for font family)
    const fontFiles: Array<{ file: File; weight: number; style: string }> = [];
    let fileIndex = 0;
    
    while (true) {
      const file = formData.get(`fontFile_${fileIndex}`) as File | null;
      if (!file) break;
      
      const weight = parseInt(formData.get(`weight_${fileIndex}`) as string || "400");
      const style = (formData.get(`style_${fileIndex}`) as string || "normal").toLowerCase();
      
      fontFiles.push({ file, weight, style });
      fileIndex++;
    }

    // Fallback to single file for backward compatibility
    if (fontFiles.length === 0) {
      const fontFile = formData.get("fontFile") as File | null;
      if (fontFile) {
        fontFiles.push({ file: fontFile, weight: 400, style: "normal" });
      }
    }

    if (!name || !familyName || fontFiles.length === 0) {
      client.release();
      return NextResponse.json(
        { error: "Missing required fields: name, familyName, and at least one fontFile are required" },
        { status: 400 }
      );
    }

    // Validate all files
    const allowedFormats = ['woff', 'woff2', 'ttf', 'otf'];
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    const allWeights: number[] = [];
    
    for (const fontFileData of fontFiles) {
      const fileExtension = fontFileData.file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedFormats.includes(fileExtension)) {
        client.release();
        return NextResponse.json(
          { error: `Invalid file format for ${fontFileData.file.name}. Allowed formats: ${allowedFormats.join(', ')}` },
          { status: 400 }
        );
      }

      if (fontFileData.file.size > maxSize) {
        client.release();
        return NextResponse.json(
          { error: `File ${fontFileData.file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }

      if (!allWeights.includes(fontFileData.weight)) {
        allWeights.push(fontFileData.weight);
      }
    }
    
    // Sort weights
    allWeights.sort((a, b) => a - b);

    // Check if font with same family name already exists
    const existingResult = await client.query(
      'SELECT id FROM custom_fonts WHERE family_name = $1',
      [familyName]
    );

    if (existingResult.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { error: "Font with this family name already exists" },
        { status: 409 }
      );
    }

    try {
      // Save all font files
      const savedFiles: Array<{ url: string; format: string; size: number; weight: number; style: string }> = [];
      
      for (const fontFileData of fontFiles) {
        try {
          const fileUrl = await saveUploadedFile(fontFileData.file, 'fonts');
          const fileExtension = fontFileData.file.name.split('.').pop()?.toLowerCase() || 'woff2';
          
          savedFiles.push({
            url: fileUrl,
            format: fileExtension,
            size: fontFileData.file.size,
            weight: fontFileData.weight,
            style: fontFileData.style
          });
        } catch (error) {
          console.error('Failed to save font file:', error);
          client.release();
          return NextResponse.json(
            { error: `Failed to save font file: ${fontFileData.file.name}` },
            { status: 500 }
          );
        }
      }

      // Get first file for backward compatibility (file_url in custom_fonts)
      const firstFile = savedFiles[0];
      const totalSize = savedFiles.reduce((sum, f) => sum + f.size, 0);

      // Insert new font
      const fontResult = await client.query(
        `INSERT INTO custom_fonts 
        (name, family_name, category, weights, file_url, file_format, file_size, is_active, is_popular, is_pro, created_by, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *`,
        [
          name,
          familyName,
          category,
          allWeights,
          firstFile.url,
          firstFile.format,
          totalSize,
          true,
          isPopular,
          isPro,
          session.user.id,
          new Date(),
          new Date()
        ]
      );

      const newFont = fontResult.rows[0];

      // Insert all font files into font_files table
      for (const savedFile of savedFiles) {
        await client.query(
          `INSERT INTO font_files (font_id, file_url, file_format, file_size, weight, style, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newFont.id,
            savedFile.url,
            savedFile.format,
            savedFile.size,
            savedFile.weight,
            savedFile.style,
            new Date()
          ]
        );
      }

      // Get font with all files
      const fontWithFiles = await client.query(
        `SELECT 
          cf.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ff.id,
                'file_url', ff.file_url,
                'file_format', ff.file_format,
                'file_size', ff.file_size,
                'weight', ff.weight,
                'style', ff.style
              )
            ) FILTER (WHERE ff.id IS NOT NULL),
            '[]'::json
          ) as font_files
        FROM custom_fonts cf
        LEFT JOIN font_files ff ON cf.id = ff.font_id
        WHERE cf.id = $1
        GROUP BY cf.id`,
        [newFont.id]
      );

      return NextResponse.json({
        message: "Font uploaded successfully",
        font: fontWithFiles.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error uploading font:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

