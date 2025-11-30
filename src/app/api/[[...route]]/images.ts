import { Hono } from "hono";
import { pool } from "@/lib/database";
import { createHonoAuthMiddleware } from "@/lib/auth-hono";

import { unsplash } from "@/lib/unsplash";

const DEFAULT_COUNT = 20;
const DEFAULT_COLLECTION_IDS = ["317099"];

type Variables = {
  user: any;
};

// Custom auth middleware for Hono
const customAuth = createHonoAuthMiddleware;

const app = new Hono<{ Variables: Variables }>()
  .get("/", customAuth(), async (c) => {
    const user = c.get("user");
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      // Get user uploaded images from database
      const userImagesResult = await pool.query(
        `SELECT id, name, url, thumbnail_url, width, height, size, created_at 
         FROM images 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [user.id]
      );
      const userImages = userImagesResult.rows;

      // Get Unsplash images with timeout and retry logic
      let unsplashResponse: any[] = [];
      try {
        const unsplashImages = await Promise.race([
          unsplash.photos.getRandom({
            collectionIds: DEFAULT_COLLECTION_IDS,
            count: DEFAULT_COUNT,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Unsplash API timeout')), 8000)
          )
        ]) as any;

        if (!unsplashImages.errors && unsplashImages.response) {
          let response = unsplashImages.response;
          if (!Array.isArray(response)) {
            response = [response];
          }
          unsplashResponse = response;
        }
      } catch (unsplashError: any) {
        console.warn("Unsplash API error (using fallback images):", unsplashError?.message || 'Unknown error');
        // Use fallback images when Unsplash fails
        unsplashResponse = [
          {
            id: "fallback-1",
            urls: {
              regular: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop"
            },
            alt_description: "Mountain landscape",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-2", 
            urls: {
              regular: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=150&fit=crop"
            },
            alt_description: "Forest path",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-3",
            urls: {
              regular: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop", 
              thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop"
            },
            alt_description: "Ocean waves",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-4",
            urls: {
              regular: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=150&fit=crop"
            },
            alt_description: "Sunset sky",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-5",
            urls: {
              regular: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=200&h=150&fit=crop"
            },
            alt_description: "City skyline",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-6",
            urls: {
              regular: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=200&h=150&fit=crop"
            },
            alt_description: "Golden wheat field",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-7",
            urls: {
              regular: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=150&fit=crop"
            },
            alt_description: "Tropical beach",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-8",
            urls: {
              regular: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop"
            },
            alt_description: "Snowy mountains",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-9",
            urls: {
              regular: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=150&fit=crop"
            },
            alt_description: "Flower field",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-10",
            urls: {
              regular: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200&h=150&fit=crop"
            },
            alt_description: "Architectural building",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-11",
            urls: {
              regular: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=150&fit=crop"
            },
            alt_description: "Lake reflection",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          },
          {
            id: "fallback-12",
            urls: {
              regular: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
              small: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
              thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=150&fit=crop"
            },
            alt_description: "Autumn forest",
            user: { name: "Unsplash" },
            links: { html: "https://unsplash.com" }
          }
        ];
      }

      // Transform user images to match Unsplash format
      const transformedUserImages = userImages.map((img: any) => ({
        id: img.id,
        urls: {
          regular: img.url,
          small: img.thumbnail_url || img.url,
          thumb: img.thumbnail_url || img.url,
        },
        alt_description: img.name,
        user: {
          name: "Your Upload",
        },
        links: {
          html: "#",
        },
        isUserUpload: true,
      }));

      // Combine user images first, then Unsplash images
      const combinedImages = [...transformedUserImages, ...unsplashResponse];

      console.log(`Returning ${transformedUserImages.length} user images and ${unsplashResponse.length} Unsplash images`);
      
      return c.json({ data: combinedImages });
    } catch (error) {
      console.error("Error fetching images:", error);
      return c.json({ error: "Failed to fetch images" }, 500);
    }
  })
  .post("/", customAuth(), async (c) => {
    const user = c.get("user");
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const { name, url, thumbnailUrl, width, height, size } = await c.req.json();

      if (!name || !url) {
        return c.json({ error: "Name and URL are required" }, 400);
      }

      // Save image to database
      const imageId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO images (id, user_id, name, url, thumbnail_url, width, height, size, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [imageId, user.id, name, url, thumbnailUrl, width, height, size]
      );

      const newImage = {
        id: imageId,
        name,
        url,
        thumbnailUrl,
        width,
        height,
        size,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return c.json({ data: newImage });
    } catch (error) {
      console.error("Error saving image:", error);
      return c.json({ error: "Failed to save image" }, 500);
    }
  })
  .delete("/:id", customAuth(), async (c) => {
    const user = c.get("user");
    const imageId = c.req.param("id");
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      // Delete image from database
      const result = await pool.query(
        `DELETE FROM images WHERE id = $1 AND user_id = $2`,
        [imageId, user.id]
      );

      if (result.rowCount === 0) {
        return c.json({ error: "Image not found or unauthorized" }, 404);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting image:", error);
      return c.json({ error: "Failed to delete image" }, 500);
    }
  });

export default app;
