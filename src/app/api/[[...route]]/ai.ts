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

      console.log('[Replicate rembg] ===== REQUEST RECEIVED =====');
      console.log('[Replicate rembg] Image data length:', image?.length || 0);
      
      try {
        // Check if Replicate API token is configured
        if (!process.env.REPLICATE_API_TOKEN) {
          console.error('[Replicate rembg] REPLICATE_API_TOKEN not configured');
          return c.json({ 
            error: "Replicate API token not configured. Please set REPLICATE_API_TOKEN environment variable.",
            code: "API_TOKEN_MISSING"
          }, 500);
        }
        
        console.log('[Replicate rembg] Starting background removal with cjwbw/rembg...');
        
        // Convert image to Buffer for Replicate SDK
        // The SDK in Node.js works best with Buffer or File objects
        let imageBuffer: Buffer;
        let imageSize = 0;
        
        if (image.startsWith('data:')) {
          // Extract base64 from data URL
          const parts = image.split(',');
          if (parts.length < 2) {
            throw new Error('Invalid data URL format');
          }
          const base64Image = parts[1];
          imageBuffer = Buffer.from(base64Image, 'base64');
          imageSize = imageBuffer.length;
          console.log('[Replicate rembg] Converted data URL to Buffer, size:', imageSize, 'bytes (', (imageSize / 1024 / 1024).toFixed(2), 'MB)');
        } else if (image.startsWith('http')) {
          // Fetch image from URL and convert to Buffer
          console.log('[Replicate rembg] Fetching image from URL:', image);
          const imageResponse = await fetch(image);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          const imageBlob = await imageResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          imageSize = imageBuffer.length;
          console.log('[Replicate rembg] Fetched image, size:', imageSize, 'bytes (', (imageSize / 1024 / 1024).toFixed(2), 'MB)');
        } else {
          // Assume it's already base64 without data: prefix
          imageBuffer = Buffer.from(image, 'base64');
          imageSize = imageBuffer.length;
          console.log('[Replicate rembg] Using provided base64 as Buffer, size:', imageSize, 'bytes (', (imageSize / 1024 / 1024).toFixed(2), 'MB)');
        }

        // Check image size - Replicate has limits (typically 10MB for free tier)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (imageSize > MAX_SIZE) {
          console.error('[Replicate rembg] Image too large:', imageSize, 'bytes. Max allowed:', MAX_SIZE);
          return c.json({ 
            error: `Image is too large (${(imageSize / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB. Please use a smaller image.`,
            code: "IMAGE_TOO_LARGE"
          }, 400);
        }
        
        console.log('[Replicate rembg] Image size OK');
        console.log('[Replicate rembg] Calling Replicate API with model cjwbw/rembg...');
        const startTime = Date.now();
        
        // Use Replicate API to remove background
        // Model: cjwbw/rembg with specific version hash
        // Pass Buffer directly - Replicate SDK will handle it
        console.log('[Replicate rembg] Calling model with version hash and Buffer...');
        const output = await replicate.run(
          "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
          {
            input: {
              image: imageBuffer,
            }
          }
        );
        
        const elapsed = Date.now() - startTime;
        console.log('[Replicate rembg] API response received after', elapsed, 'ms');
        console.log('[Replicate rembg] Output type:', typeof output);
        console.log('[Replicate rembg] Output:', output);

        if (!output) {
          throw new Error('Empty response from Replicate API');
        }

        // Replicate returns a URL (string) or array of URLs to the processed image
        // Handle both cases
        const outputUrl = Array.isArray(output) ? output[0] : (typeof output === 'string' ? output : String(output));
        
        if (!outputUrl || typeof outputUrl !== 'string') {
          throw new Error('Invalid response format from Replicate API');
        }

        // Replicate returns a URL to the processed image
        // Fetch the image and convert to base64 data URL
        console.log('[Replicate rembg] Fetching processed image from URL:', outputUrl);
        const imageResponse = await fetch(outputUrl);
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch processed image: ${imageResponse.status}`);
        }
        
        const resultBlob = await imageResponse.blob();
        console.log('[Replicate rembg] Blob size:', resultBlob.size, 'type:', resultBlob.type);
        
        if (resultBlob.size === 0) {
          throw new Error('Empty image from Replicate');
        }
        
        // Convert blob to base64 data URL
        const resultArrayBuffer = await resultBlob.arrayBuffer();
        const resultBuffer = Buffer.from(resultArrayBuffer);
        const resultBase64 = resultBuffer.toString('base64');
        const resultDataUrl = `data:image/png;base64,${resultBase64}`;

        console.log('[Replicate rembg] Success! Result data URL length:', resultDataUrl.length);
        console.log('[Replicate rembg] ===== REQUEST COMPLETED SUCCESSFULLY =====');
        return c.json({ data: resultDataUrl });
      } catch (error: any) {
        console.error("[Replicate rembg] ===== ERROR OCCURRED =====");
        console.error("Replicate API error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error message:", error.message);
        
        // Handle specific Replicate errors
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          return c.json({ 
            error: "Invalid API token. Please check your REPLICATE_API_TOKEN.",
            code: "INVALID_API_KEY"
          }, 401);
        }
        
        if (error.message?.includes('402') || error.message?.includes('quota') || error.message?.includes('credits')) {
          return c.json({ 
            error: "API quota exceeded. Please check your Replicate account credits.",
            code: "QUOTA_EXCEEDED"
          }, 402);
        }
        
        return c.json({ 
          error: `Failed to remove background: ${error.message || 'Unknown error'}`,
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
