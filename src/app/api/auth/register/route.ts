import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/lib/auth';
import { pool } from '@/lib/database';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);
    
    const { user, token } = await registerUser(
      validatedData.email,
      validatedData.password,
      validatedData.name
    );
    
    // Create free plan subscription for new user
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO subscriptions (user_id, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4)`,
        [
          user.id,
          'free',
          new Date(),
          new Date()
        ]
      );
      client.release();
      console.log("✅ Free plan subscription created for new user:", user.id);
    } catch (dbError) {
      console.error("❌ Failed to create free subscription:", dbError);
      // Don't fail registration if subscription creation fails
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
