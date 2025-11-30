import { Hono } from "hono";
import { pool } from "@/lib/database";
import { createHonoAuthMiddleware } from "@/lib/auth-hono";

type Variables = {
  user: any;
};

// Custom auth middleware
const customAuth = createHonoAuthMiddleware;

const app = new Hono<{ Variables: Variables }>()
  .post("/", customAuth(), async (c) => {
    const user = c.get("user");
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        return c.json({ error: "No file provided" }, 400);
      }

      // Convert file to base64 data URL for storage
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Save image to database
      const imageId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO images (id, user_id, name, url, size, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [imageId, user.id, file.name, dataUrl, file.size]
      );

      return c.json({ 
        data: {
          id: imageId,
          url: dataUrl,
          name: file.name,
          size: file.size
        }
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return c.json({ error: "Failed to upload file" }, 500);
    }
  });

export default app;
