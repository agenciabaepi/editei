// Edge-compatible authentication utilities
// This file contains functions that can be used in Edge Runtime (middleware)

import { cookies } from 'next/headers';

// Simple session validation for Edge Runtime
export async function validateSessionToken(token: string): Promise<boolean> {
  try {
    // Make API call to validate session since we can't use pg in Edge Runtime
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/validate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    return data.valid;
  } catch (error) {
    return false;
  }
}

// Get session token from cookies (Edge compatible)
export function getSessionToken(): string | null {
  try {
    return cookies().get('session')?.value || null;
  } catch (error) {
    return null;
  }
}
