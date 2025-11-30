import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createHonoAuthMiddleware } from "@/lib/auth-hono";

import { replicate } from "@/lib/replicate";

// Custom auth middleware for Hono
const customAuth = createHonoAuthMiddleware;

const app = new Hono()
  .post(
    "/remove-bg",
    customAuth(),
    zValidator(
      "json",
      z.object({
        image: z.string(),
      }),
    ),
    async (c) => {
      const { image } = c.req.valid("json");

      try {
        const input = {
          image: image
        };
      
        const output: unknown = await replicate.run("cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003", { input });

        const res = output as string;

        return c.json({ data: res });
      } catch (error: any) {
        console.error("Replicate API error:", error);
        
        if (error.response?.status === 402) {
          return c.json({ 
            error: "AI credits exhausted. Please add credits to your Replicate account to continue using AI features.",
            code: "CREDITS_EXHAUSTED"
          }, 402);
        }
        
        if (error.response?.status === 401) {
          return c.json({ 
            error: "Invalid API key. Please check your Replicate API token.",
            code: "INVALID_API_KEY"
          }, 401);
        }
        
        return c.json({ 
          error: "Failed to remove background. Please try again later.",
          code: "PROCESSING_FAILED"
        }, 500);
      }
    },
  )
  .post(
    "/generate-image",
    customAuth(),
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      }),
    ),
    async (c) => {
      const { prompt } = c.req.valid("json");

      try {
        const input = {
          cfg: 3.5,
          steps: 28,
          prompt: prompt,
          aspect_ratio: "3:2",
          output_format: "webp",
          output_quality: 90,
          negative_prompt: "",
          prompt_strength: 0.85
        };
        
        const output = await replicate.run("stability-ai/stable-diffusion-3", { input });
        
        const res = output as Array<string>;

        return c.json({ data: res[0] });
      } catch (error: any) {
        console.error("Replicate API error:", error);
        
        if (error.response?.status === 402) {
          return c.json({ 
            error: "AI credits exhausted. Please add credits to your Replicate account to continue using AI features.",
            code: "CREDITS_EXHAUSTED"
          }, 402);
        }
        
        if (error.response?.status === 401) {
          return c.json({ 
            error: "Invalid API key. Please check your Replicate API token.",
            code: "INVALID_API_KEY"
          }, 401);
        }
        
        return c.json({ 
          error: "Failed to generate image. Please try again later.",
          code: "GENERATION_FAILED"
        }, 500);
      }
    },
  );

export default app;
