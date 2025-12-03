import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createHonoAuthMiddleware } from "@/lib/auth-hono";
import FormDataLib from "form-data";

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

      console.log('[remove.bg] ===== REQUEST RECEIVED =====');
      console.log('[remove.bg] Image data length:', image?.length || 0);
      
      try {
        // Use remove.bg API
        const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY || "9aQrnqkrnjxE2LBTTFggWbrV";
        
        console.log('[remove.bg] Starting background removal...');
        console.log('[remove.bg] Using API key:', REMOVE_BG_API_KEY.substring(0, 10) + '...');
        
        // Convert image to buffer
        let imageBuffer: Buffer;
        let filename = 'image.png';
        
        if (image.startsWith('data:')) {
          // Extract base64 from data URL
          const parts = image.split(',');
          if (parts.length < 2) {
            throw new Error('Invalid data URL format');
          }
          const base64Image = parts[1];
          // Try to detect image type from data URL
          const mimeMatch = image.match(/data:([^;]+);/);
          if (mimeMatch) {
            const mime = mimeMatch[1];
            filename = mime.includes('jpeg') ? 'image.jpg' : mime.includes('png') ? 'image.png' : 'image.png';
          }
          imageBuffer = Buffer.from(base64Image, 'base64');
          console.log('[remove.bg] Extracted base64 from data URL, size:', imageBuffer.length, 'bytes (', (imageBuffer.length / 1024 / 1024).toFixed(2), 'MB)');
        } else if (image.startsWith('http')) {
          // Fetch image from URL
          console.log('[remove.bg] Fetching image from URL:', image);
          const imageResponse = await fetch(image);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          const imageBlob = await imageResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          filename = image.split('/').pop() || 'image.png';
          console.log('[remove.bg] Fetched image, size:', imageBuffer.length, 'bytes (', (imageBuffer.length / 1024 / 1024).toFixed(2), 'MB)');
        } else {
          // Assume it's already base64
          imageBuffer = Buffer.from(image, 'base64');
          console.log('[remove.bg] Using provided base64, size:', imageBuffer.length, 'bytes (', (imageBuffer.length / 1024 / 1024).toFixed(2), 'MB)');
        }

        if (!imageBuffer || imageBuffer.length === 0) {
          throw new Error('Empty image data');
        }

        // Check image size - remove.bg has a 10MB limit
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (imageBuffer.length > MAX_SIZE) {
          console.error('[remove.bg] Image too large:', imageBuffer.length, 'bytes. Max allowed:', MAX_SIZE);
          return c.json({ 
            error: `Image is too large (${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB. Please use a smaller image.`,
            code: "IMAGE_TOO_LARGE"
          }, 400);
        }
        
        console.log('[remove.bg] Image size OK:', (imageBuffer.length / 1024 / 1024).toFixed(2), 'MB');

        // Use remove.bg API - create FormData
        // According to documentation: https://www.remove.bg/api#remove-background
        console.log('[remove.bg] Creating FormData...');
        const formData = new FormDataLib();
        formData.append('image_file', imageBuffer, {
          filename: filename,
          contentType: filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 'image/png',
        });
        // Add size parameter (auto = automatic sizing, up to 25MP)
        formData.append('size', 'auto');
        
        // Get headers from form-data
        const formHeaders = formData.getHeaders();
        console.log('[remove.bg] FormData headers:', Object.keys(formHeaders));
        
        // Convert FormData stream to Buffer
        console.log('[remove.bg] Converting FormData stream to buffer...');
        const formDataBuffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          
          formData.on('data', (chunk: any) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });
          
          formData.on('end', () => {
            const buffer = Buffer.concat(chunks);
            console.log('[remove.bg] FormData buffer ready, size:', buffer.length, 'bytes');
            resolve(buffer);
          });
          
          formData.on('error', (err: Error) => {
            console.error('[remove.bg] FormData stream error:', err);
            reject(err);
          });
        });
        
        console.log('[remove.bg] Calling remove.bg API with', (imageBuffer.length / 1024 / 1024).toFixed(2), 'MB image...');
        const startTime = Date.now();
        
        // remove.bg API endpoint
        // Documentation: https://www.remove.bg/api#remove-background
        // Header must be X-Api-Key (not X-API-Key)
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVE_BG_API_KEY,
            ...formHeaders,
          },
          body: formDataBuffer,
        });
        
        const elapsed = Date.now() - startTime;
        console.log('[remove.bg] API response received after', elapsed, 'ms, status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("remove.bg API error:", response.status, errorText);
          
          if (response.status === 401) {
            return c.json({ 
              error: "Invalid API key. Please check your remove.bg API key.",
              code: "INVALID_API_KEY"
            }, 401);
          }
          
          if (response.status === 402 || response.status === 429) {
            return c.json({ 
              error: "API quota exceeded. Please check your remove.bg account.",
              code: "QUOTA_EXCEEDED"
            }, response.status);
          }
          
          return c.json({ 
            error: `Failed to remove background: ${errorText}`,
            code: "PROCESSING_FAILED"
          }, 500);
        }

        // Get the result image as base64
        console.log('[remove.bg] Processing response blob...');
        const resultBlob = await response.blob();
        console.log('[remove.bg] Blob size:', resultBlob.size, 'type:', resultBlob.type);
        
        if (resultBlob.size === 0) {
          throw new Error('Empty response from API');
        }
        
        const resultArrayBuffer = await resultBlob.arrayBuffer();
        const resultBuffer = Buffer.from(resultArrayBuffer);
        const resultBase64 = resultBuffer.toString('base64');
        const resultDataUrl = `data:image/png;base64,${resultBase64}`;

        console.log('[remove.bg] Success! Result data URL length:', resultDataUrl.length);
        console.log('[remove.bg] ===== REQUEST COMPLETED SUCCESSFULLY =====');
        return c.json({ data: resultDataUrl });
      } catch (error: any) {
        console.error("[remove.bg] ===== ERROR OCCURRED =====");
        console.error("remove.bg API error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error message:", error.message);
        
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
