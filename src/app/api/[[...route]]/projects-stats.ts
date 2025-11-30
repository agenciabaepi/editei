import { Hono } from "hono";
import { handle } from "hono/vercel";
import { HTTPException } from "hono/http-exception";
import { pool } from "@/lib/database";
import { getCurrentSession } from "@/lib/auth";

const app = new Hono().basePath("/api");

app.get("/projects/stats", async (c) => {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const client = await pool.connect();
    
    try {
      // Get total projects count
      const totalProjectsResult = await client.query(
        'SELECT COUNT(*) as count FROM projects WHERE user_id = $1 AND deleted_at IS NULL',
        [session.user.id]
      );
      
      // Get projects created this week
      const thisWeekResult = await client.query(
        `SELECT COUNT(*) as count FROM projects 
         WHERE user_id = $1 AND deleted_at IS NULL 
         AND created_at >= NOW() - INTERVAL '7 days'`,
        [session.user.id]
      );
      
      // Get total downloads (assuming we track this in a downloads table or project field)
      const downloadsResult = await client.query(
        `SELECT COALESCE(SUM(download_count), 0) as total FROM projects 
         WHERE user_id = $1 AND deleted_at IS NULL`,
        [session.user.id]
      );
      
      // Get downloads this month
      const downloadsThisMonthResult = await client.query(
        `SELECT COALESCE(SUM(download_count), 0) as total FROM projects 
         WHERE user_id = $1 AND deleted_at IS NULL 
         AND updated_at >= DATE_TRUNC('month', NOW())`,
        [session.user.id]
      );
      
      // Calculate design time (mock calculation based on project count and updates)
      const designTimeResult = await client.query(
        `SELECT COUNT(*) * 2 as hours FROM projects 
         WHERE user_id = $1 AND deleted_at IS NULL`,
        [session.user.id]
      );
      
      const designTimeThisWeekResult = await client.query(
        `SELECT COUNT(*) * 0.5 as hours FROM projects 
         WHERE user_id = $1 AND deleted_at IS NULL 
         AND updated_at >= NOW() - INTERVAL '7 days'`,
        [session.user.id]
      );

      const stats = {
        totalProjects: parseInt(totalProjectsResult.rows[0].count),
        projectsThisWeek: parseInt(thisWeekResult.rows[0].count),
        totalDownloads: parseInt(downloadsResult.rows[0].total || 0),
        downloadsThisMonth: parseInt(downloadsThisMonthResult.rows[0].total || 0),
        designTime: parseInt(designTimeResult.rows[0].hours || 0),
        designTimeThisWeek: parseInt(designTimeThisWeekResult.rows[0].hours || 0)
      };

      return c.json(stats);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching project stats:", error);
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
