// Authentication utilities for Hono context
// This file provides auth functions that work with Hono's request context

import { pool } from './database';

// Helper function to parse cookies from header
export function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Get session from Hono context
export async function getSessionFromHonoContext(cookieHeader: string | undefined) {
  const sessionToken = parseCookie(cookieHeader, 'session');
  
  if (!sessionToken) {
    return null;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT s.*, u.id as user_id, u.email, u.name, u.image FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()',
      [sessionToken]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const session = result.rows[0];
    return {
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        image: session.image
      },
      token: sessionToken
    };
  } catch (error) {
    console.error('Error getting session from Hono context:', error);
    return null;
  } finally {
    client.release();
  }
}

// Custom auth middleware factory for Hono
export function createHonoAuthMiddleware() {
  return async (c: any, next: any) => {
    try {
      const cookieHeader = c.req.header('cookie');
      console.log('[Auth] Cookie header:', cookieHeader ? 'present' : 'missing');
      
      const session = await getSessionFromHonoContext(cookieHeader);
      
      if (!session) {
        console.log('[Auth] No valid session found');
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      console.log('[Auth] Session found for user:', session.user.email);
      c.set("user", session.user);
      await next();
    } catch (error) {
      console.error("[Auth] Middleware error:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
}

