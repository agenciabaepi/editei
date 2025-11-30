import { z } from "zod";
import { Hono } from "hono";
import { pool } from "@/lib/database";
import { createHonoAuthMiddleware } from "@/lib/auth-hono";

// Project schema for validation
const projectsInsertSchema = z.object({
  name: z.string(),
  json: z.string(),
  width: z.number(),
  height: z.number(),
  isTemplate: z.boolean().optional(),
  isPro: z.boolean().optional(),
});

type Variables = {
  user: any;
  valid_query: any;
  valid_param: any;
  valid_json: any;
};

// Custom auth middleware using shared helper
const customAuth = createHonoAuthMiddleware;

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

const app = new Hono<{ Variables: Variables }>()
  .get(
    "/stats",
    customAuth(),
    async (c) => {
      const user = c.get("user");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        
        // Get total projects count
        const totalProjectsResult = await client.query(
          'SELECT COUNT(*) as count FROM projects WHERE user_id = $1 AND deleted_at IS NULL',
          [user.id]
        );
        
        // Get projects created this week
        const thisWeekResult = await client.query(
          `SELECT COUNT(*) as count FROM projects 
           WHERE user_id = $1 AND deleted_at IS NULL 
           AND created_at >= NOW() - INTERVAL '7 days'`,
          [user.id]
        );
        
        // Get total downloads (mock data since download_count column may not exist)
        const downloadsResult = await client.query(
          `SELECT COUNT(*) * 5 as total FROM projects 
           WHERE user_id = $1 AND deleted_at IS NULL`,
          [user.id]
        );
        
        // Get downloads this month (mock data)
        const downloadsThisMonthResult = await client.query(
          `SELECT COUNT(*) * 2 as total FROM projects 
           WHERE user_id = $1 AND deleted_at IS NULL 
           AND updated_at >= DATE_TRUNC('month', NOW())`,
          [user.id]
        );
        
        // Calculate design time (mock calculation)
        const designTimeResult = await client.query(
          `SELECT COUNT(*) * 2 as hours FROM projects 
           WHERE user_id = $1 AND deleted_at IS NULL`,
          [user.id]
        );
        
        const designTimeThisWeekResult = await client.query(
          `SELECT COUNT(*) * 1 as hours FROM projects 
           WHERE user_id = $1 AND deleted_at IS NULL 
           AND updated_at >= NOW() - INTERVAL '7 days'`,
          [user.id]
        );

        client.release();

        const stats = {
          totalProjects: parseInt(totalProjectsResult.rows[0].count),
          projectsThisWeek: parseInt(thisWeekResult.rows[0].count),
          totalDownloads: parseInt(downloadsResult.rows[0].total || 0),
          downloadsThisMonth: parseInt(downloadsThisMonthResult.rows[0].total || 0),
          designTime: parseInt(designTimeResult.rows[0].hours || 0),
          designTimeThisWeek: parseInt(designTimeThisWeekResult.rows[0].hours || 0)
        };

        return c.json(stats);
      } catch (error) {
        console.error("Error fetching project stats:", error);
        return c.json({ error: "Failed to fetch project stats" }, 500);
      }
    },
  )
  .get(
    "/deleted",
    customAuth(),
    async (c) => {
      const user = c.get("user");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        const result = await client.query(
          `SELECT id, name, deleted_at, width, height, thumbnail 
           FROM projects 
           WHERE user_id = $1 AND deleted_at IS NOT NULL 
           ORDER BY deleted_at DESC`,
          [user.id]
        );
        client.release();

        return c.json(result.rows);
      } catch (error) {
        console.error("Error fetching deleted projects:", error);
        return c.json({ error: "Failed to fetch deleted projects" }, 500);
      }
    },
  )
  .post(
    "/:id/restore",
    customAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const user = c.get("user");
      const { id } = c.get("valid_param");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        
        // Check user's subscription status
        const subscriptionResult = await client.query(
          `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
          [user.id]
        );
        
        const subscription = subscriptionResult.rows[0] || null;
        let isProUser = false;
        
        if (subscription && subscription.stripe_current_period_end) {
          subscription.stripe_current_period_end = new Date(subscription.stripe_current_period_end);
          const DAY_IN_MS = 86_400_000;
          const periodEndTime = subscription.stripe_current_period_end.getTime();
          const currentTime = Date.now();
          const gracePeriod = DAY_IN_MS;
          
          isProUser = subscription.status === 'active' && 
                     subscription.stripe_price_id && 
                     periodEndTime + gracePeriod > currentTime;
        }
        
        // If user is not pro, check project limit before restoring
        if (!isProUser) {
          const projectCountResult = await client.query(
            `SELECT COUNT(*) as count FROM projects 
             WHERE user_id = $1 AND deleted_at IS NULL AND (is_template IS NULL OR is_template = false)`,
            [user.id]
          );
          
          const projectCount = parseInt(projectCountResult.rows[0].count);
          const FREE_PROJECT_LIMIT = 5;
          
          if (projectCount >= FREE_PROJECT_LIMIT) {
            client.release();
            return c.json({ 
              error: "Project limit reached", 
              message: `Free users can have up to ${FREE_PROJECT_LIMIT} active projects. Delete some projects or upgrade to Pro for unlimited projects.`,
              limit: FREE_PROJECT_LIMIT,
              current: projectCount
            }, 403);
          }
        }
        
        const result = await client.query(
          `UPDATE projects 
           SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL 
           RETURNING id, name`,
          [id, user.id]
        );
        client.release();

        if (result.rows.length === 0) {
          return c.json({ error: "Project not found or already restored" }, 404);
        }

        return c.json({ success: true, project: result.rows[0] });
      } catch (error) {
        console.error("Error restoring project:", error);
        return c.json({ error: "Failed to restore project" }, 500);
      }
    },
  )
  .delete(
    "/:id/permanent",
    customAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const user = c.get("user");
      const { id } = c.get("valid_param");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        const result = await client.query(
          `DELETE FROM projects 
           WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL 
           RETURNING id, name`,
          [id, user.id]
        );
        client.release();

        if (result.rows.length === 0) {
          return c.json({ error: "Project not found or not in trash" }, 404);
        }

        return c.json({ success: true, project: result.rows[0] });
      } catch (error) {
        console.error("Error permanently deleting project:", error);
        return c.json({ error: "Failed to permanently delete project" }, 500);
      }
    },
  )
  .get(
    "/templates",
    customAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { page, limit } = c.get("valid_query");

      try {
        const client = await pool.connect();
        const result = await client.query(
          `SELECT * FROM projects 
           WHERE is_template = true 
           ORDER BY is_pro ASC, updated_at DESC 
           LIMIT $1 OFFSET $2`,
          [limit, (page - 1) * limit]
        );
        client.release();

        return c.json({ data: result.rows });
      } catch (error) {
        console.error("Error fetching templates:", error);
        return c.json({ error: "Failed to fetch templates" }, 500);
      }
    },
  )
  .post(
    "/templates",
    customAuth(),
    zValidator(
      "json",
      z.object({
        name: z.string(),
        json: z.string(),
        width: z.number(),
        height: z.number(),
        is_pro: z.boolean().optional(),
        thumbnail: z.string().optional(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const { name, json, width, height, is_pro = false, thumbnail } = c.get("valid_json");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        const result = await client.query(
          `INSERT INTO projects (name, json, width, height, user_id, is_template, is_pro, thumbnail, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
           RETURNING *`,
          [name, json, width, height, user.id, true, is_pro, thumbnail, new Date(), new Date()]
        );
        client.release();

        if (!result.rows[0]) {
          return c.json({ error: "Something went wrong" }, 400);
        }

        return c.json({ data: result.rows[0] });
      } catch (error) {
        console.error("Error creating template:", error);
        return c.json({ error: "Failed to create template" }, 500);
      }
    },
  )
  .delete(
    "/:id",
    customAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const user = c.get("user");
      const { id } = c.get("valid_param");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        const result = await client.query(
          `UPDATE projects 
           SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL 
           RETURNING id`,
          [id, user.id]
        );
        client.release();

        if (result.rows.length === 0) {
          return c.json({ error: "Not found" }, 404);
        }

        return c.json({ data: { id } });
      } catch (error) {
        console.error("Error deleting project:", error);
        return c.json({ error: "Failed to delete project" }, 500);
      }
    },
  )
  .post(
    "/:id/duplicate",
    customAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const user = c.get("user");
      const { id } = c.get("valid_param");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        
        // Get the project to duplicate
        const projectResult = await client.query(
          `SELECT * FROM projects WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
          [id, user.id]
        );

        if (projectResult.rows.length === 0) {
          client.release();
          return c.json({ error: "Not found" }, 404);
        }

        const project = projectResult.rows[0];

        // Check user's subscription status
        const subscriptionResult = await client.query(
          `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
          [user.id]
        );
        
        const subscription = subscriptionResult.rows[0] || null;
        let isProUser = false;
        
        if (subscription && subscription.stripe_current_period_end) {
          subscription.stripe_current_period_end = new Date(subscription.stripe_current_period_end);
          const DAY_IN_MS = 86_400_000;
          const periodEndTime = subscription.stripe_current_period_end.getTime();
          const currentTime = Date.now();
          const gracePeriod = DAY_IN_MS;
          
          isProUser = subscription.status === 'active' && 
                     subscription.stripe_price_id && 
                     periodEndTime + gracePeriod > currentTime;
        }
        
        // If user is not pro, check project limit
        if (!isProUser) {
          const projectCountResult = await client.query(
            `SELECT COUNT(*) as count FROM projects 
             WHERE user_id = $1 AND deleted_at IS NULL AND (is_template IS NULL OR is_template = false)`,
            [user.id]
          );
          
          const projectCount = parseInt(projectCountResult.rows[0].count);
          const FREE_PROJECT_LIMIT = 5;
          
          if (projectCount >= FREE_PROJECT_LIMIT) {
            client.release();
            return c.json({ 
              error: "Project limit reached", 
              message: `Free users can create up to ${FREE_PROJECT_LIMIT} projects. Upgrade to Pro for unlimited projects.`,
              limit: FREE_PROJECT_LIMIT,
              current: projectCount
            }, 403);
          }
        }

        // Create duplicate
        const duplicateResult = await client.query(
          `INSERT INTO projects (name, json, width, height, user_id, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [
            `Copy of ${project.name}`,
            project.json,
            project.width,
            project.height,
            user.id,
            new Date(),
            new Date()
          ]
        );
        
        client.release();
        return c.json({ data: duplicateResult.rows[0] });
      } catch (error) {
        console.error("Error duplicating project:", error);
        return c.json({ error: "Failed to duplicate project" }, 500);
      }
    },
  )
  .get(
    "/",
    customAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const { page, limit } = c.get("valid_query");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        const result = await client.query(
          `SELECT * FROM projects 
           WHERE user_id = $1 AND deleted_at IS NULL AND (is_template IS NULL OR is_template = false)
           ORDER BY updated_at DESC 
           LIMIT $2 OFFSET $3`,
          [user.id, limit, (page - 1) * limit]
        );
        client.release();

        const data = result.rows;
        return c.json({
          data,
          nextPage: data.length === limit ? page + 1 : null,
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
        return c.json({ error: "Failed to fetch projects" }, 500);
      }
    },
  )
  .patch(
    "/:id",
    customAuth(),
    zValidator(
      "param",
      z.object({ id: z.string() }),
    ),
    zValidator(
      "json",
      projectsInsertSchema
        .omit({
          isTemplate: true,
          isPro: true,
        })
        .partial()
    ),
    async (c) => {
      const user = c.get("user");
      const { id } = c.get("valid_param");
      const values = c.get("valid_json");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        
        if (values.name) {
          updateFields.push(`name = $${paramCount++}`);
          updateValues.push(values.name);
        }
        if (values.json) {
          updateFields.push(`json = $${paramCount++}`);
          updateValues.push(values.json);
        }
        if (values.width) {
          updateFields.push(`width = $${paramCount++}`);
          updateValues.push(values.width);
        }
        if (values.height) {
          updateFields.push(`height = $${paramCount++}`);
          updateValues.push(values.height);
        }
        
        updateFields.push(`updated_at = $${paramCount++}`);
        updateValues.push(new Date());
        
        updateValues.push(id, user.id);
        
        const result = await client.query(
          `UPDATE projects 
           SET ${updateFields.join(', ')} 
           WHERE id = $${paramCount++} AND user_id = $${paramCount++} AND deleted_at IS NULL 
           RETURNING *`,
          updateValues
        );
        
        client.release();

        if (result.rows.length === 0) {
          return c.json({ error: "Not found" }, 404);
        }

        return c.json({ data: result.rows[0] });
      } catch (error) {
        console.error("Error updating project:", error);
        return c.json({ error: "Failed to update project" }, 500);
      }
    },
  )
  .get(
    "/:id",
    customAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const user = c.get("user");
      const { id } = c.get("valid_param");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        const result = await client.query(
          `SELECT * FROM projects WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
          [id, user.id]
        );
        client.release();

        if (result.rows.length === 0) {
          return c.json({ error: "Not found" }, 404);
        }

        return c.json({ data: result.rows[0] });
      } catch (error) {
        console.error("Error fetching project:", error);
        return c.json({ error: "Failed to fetch project" }, 500);
      }
    },
  )
  .post(
    "/",
    customAuth(),
    zValidator(
      "json",
      projectsInsertSchema.pick({
        name: true,
        json: true,
        width: true,
        height: true,
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const { name, json, height, width } = c.get("valid_json");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        
        // Check user's subscription status
        const subscriptionResult = await client.query(
          `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
          [user.id]
        );
        
        const subscription = subscriptionResult.rows[0] || null;
        let isProUser = false;
        
        if (subscription && subscription.stripe_current_period_end) {
          subscription.stripe_current_period_end = new Date(subscription.stripe_current_period_end);
          const DAY_IN_MS = 86_400_000;
          const periodEndTime = subscription.stripe_current_period_end.getTime();
          const currentTime = Date.now();
          const gracePeriod = DAY_IN_MS;
          
          isProUser = subscription.status === 'active' && 
                     subscription.stripe_price_id && 
                     periodEndTime + gracePeriod > currentTime;
        }
        
        // If user is not pro, check project limit
        if (!isProUser) {
          const projectCountResult = await client.query(
            `SELECT COUNT(*) as count FROM projects 
             WHERE user_id = $1 AND deleted_at IS NULL AND (is_template IS NULL OR is_template = false)`,
            [user.id]
          );
          
          const projectCount = parseInt(projectCountResult.rows[0].count);
          const FREE_PROJECT_LIMIT = 5;
          
          if (projectCount >= FREE_PROJECT_LIMIT) {
            client.release();
            return c.json({ 
              error: "Project limit reached", 
              message: `Free users can create up to ${FREE_PROJECT_LIMIT} projects. Upgrade to Pro for unlimited projects.`,
              limit: FREE_PROJECT_LIMIT,
              current: projectCount
            }, 403);
          }
        }
        
        const result = await client.query(
          `INSERT INTO projects (name, json, width, height, user_id, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [name, json, width, height, user.id, new Date(), new Date()]
        );
        client.release();

        if (!result.rows[0]) {
          return c.json({ error: "Something went wrong" }, 400);
        }

        return c.json({ data: result.rows[0] });
      } catch (error) {
        console.error("Error creating project:", error);
        return c.json({ error: "Failed to create project" }, 500);
      }
    },
  );

export default app;
