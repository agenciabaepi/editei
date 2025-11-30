import { Hono } from "hono";
import { handle } from "hono/vercel";
import { HTTPException } from "hono/http-exception";
import { pool } from "@/lib/database";
import { getCurrentSession } from "@/lib/auth";

const app = new Hono().basePath("/api");

// Get deleted projects
app.get("/projects/deleted", async (c) => {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT id, name, deleted_at, width, height, thumbnail 
         FROM projects 
         WHERE user_id = $1 AND deleted_at IS NOT NULL 
         ORDER BY deleted_at DESC`,
        [session.user.id]
      );

      return c.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching deleted projects:", error);
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

// Restore a project
app.post("/projects/:id/restore", async (c) => {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const projectId = c.req.param("id");
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE projects 
         SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL 
         RETURNING id, name`,
        [projectId, session.user.id]
      );

      if (result.rows.length === 0) {
        throw new HTTPException(404, { message: "Project not found or already restored" });
      }

      return c.json({ success: true, project: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error restoring project:", error);
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

// Permanently delete a project
app.delete("/projects/:id", async (c) => {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const projectId = c.req.param("id");
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `DELETE FROM projects 
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL 
         RETURNING id, name`,
        [projectId, session.user.id]
      );

      if (result.rows.length === 0) {
        throw new HTTPException(404, { message: "Project not found or not in trash" });
      }

      return c.json({ success: true, project: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error permanently deleting project:", error);
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
