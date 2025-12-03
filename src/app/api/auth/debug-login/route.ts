import { NextRequest, NextResponse } from 'next/server';
import { userQueries } from '@/lib/database';
import { verifyPassword } from '@/lib/auth';

// Debug endpoint to test login issues
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Find user
    const user = await userQueries.findUserByEmail(normalizedEmail);
    
    if (!user) {
      return NextResponse.json({
        found: false,
        email: normalizedEmail,
        message: 'User not found in database'
      });
    }

    // Check if user has password
    if (!user.password) {
      return NextResponse.json({
        found: true,
        hasPassword: false,
        email: user.email,
        message: 'User exists but has no password (OAuth user)'
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    
    return NextResponse.json({
      found: true,
      hasPassword: true,
      email: user.email,
      passwordValid: isValid,
      passwordHashLength: user.password.length,
      passwordHashPrefix: user.password.substring(0, 10) + '...',
      message: isValid 
        ? 'Password is valid!' 
        : 'Password does not match'
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Debug failed',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

