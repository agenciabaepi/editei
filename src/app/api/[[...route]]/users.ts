import { z } from "zod";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/database";
import { getCurrentSession } from "@/lib/auth";

// Validation middleware
const zValidator = (type: string, schema: z.ZodSchema) => {
  return async (c: any, next: any) => {
    try {
      let data;
      if (type === "query") {
        data = c.req.query();
      } else if (type === "param") {
        data = c.req.param();
      } else if (type === "json") {
        data = await c.req.json();
      }
      
      const result = schema.safeParse(data);
      if (!result.success) {
        return c.json({ error: "Validation failed", details: result.error }, 400);
      }
      
      c.set(`valid_${type}`, result.data);
      await next();
    } catch (error) {
      return c.json({ error: "Validation failed" }, 400);
    }
  };
};

type Variables = {
  valid_json: any;
};

const app = new Hono<{ Variables: Variables }>()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(3).max(20),
      })
    ),
    async (c) => {
      const { name, email, password } = c.get("valid_json") as { name: string; email: string; password: string };

      try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const client = await pool.connect();
        
        // Check if email already exists
        const existingUser = await client.query(
          `SELECT id FROM users WHERE email = $1`,
          [email]
        );

        if (existingUser.rows.length > 0) {
          client.release();
          return c.json({ error: "Email already in use" }, 400);
        }

        // Create new user
        await client.query(
          `INSERT INTO users (email, name, password, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5)`,
          [email, name, hashedPassword, new Date(), new Date()]
        );
        
        client.release();
        return c.json(null, 200);
      } catch (error) {
        console.error("Error creating user:", error);
        return c.json({ error: "Failed to create user" }, 500);
      }
    },
  )
  .get("/:userId/stats", async (c) => {
    try {
      const session = await getCurrentSession();
      
      if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const userId = c.req.param("userId");
      
      // Only allow users to access their own stats
      if (session.user.id !== userId) {
        return c.json({ error: "Forbidden" }, 403);
      }

      const client = await pool.connect();
      
      try {
        // Get total projects count
        const totalProjectsResult = await client.query(
          'SELECT COUNT(*) as count FROM projects WHERE user_id = $1 AND deleted_at IS NULL',
          [userId]
        );
        
        // Get total images uploaded (from images table if exists, or estimate from projects)
        const totalImagesResult = await client.query(
          'SELECT COUNT(*) as count FROM images WHERE user_id = $1',
          [userId]
        );
        
        // Get recent activity (projects updated in last 7 days)
        const recentActivityResult = await client.query(
          `SELECT COUNT(*) as count FROM projects 
           WHERE user_id = $1 AND deleted_at IS NULL 
           AND updated_at >= NOW() - INTERVAL '7 days'`,
          [userId]
        );
        
        // Get user creation date for account age
        const userResult = await client.query(
          'SELECT created_at FROM users WHERE id = $1',
          [userId]
        );
        
        const userCreatedAt = new Date(userResult.rows[0]?.created_at);
        const now = new Date();
        const accountAgeDays = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate storage used (rough estimate based on project count)
        const storageUsedMB = Math.round(parseInt(totalProjectsResult.rows[0].count) * 2.5); // ~2.5MB per project estimate
        
        const stats = {
          totalProjects: parseInt(totalProjectsResult.rows[0].count),
          totalImages: parseInt(totalImagesResult.rows[0]?.count || 0),
          recentActivity: parseInt(recentActivityResult.rows[0].count),
          storageUsed: `${storageUsedMB} MB`,
          accountAge: accountAgeDays === 0 ? "Today" : accountAgeDays === 1 ? "1 day" : `${accountAgeDays} days`,
          lastActive: "Just now" // Could be enhanced with actual last activity tracking
        };

        return c.json(stats);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return c.json({ error: "Failed to fetch user stats" }, 500);
    }
  });

export default app;
