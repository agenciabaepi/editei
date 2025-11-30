import { NextRequest, NextResponse } from 'next/server';
import { userQueries } from '@/lib/database';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    // Verify Google token
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
    
    if (!googleResponse.ok) {
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 401 });
    }

    const googleUser = await googleResponse.json();

    if (!googleUser.email) {
      return NextResponse.json({ success: false, error: 'No email found in Google account' }, { status: 400 });
    }

    // Check if user already exists
    let user = await userQueries.findUserByEmail(googleUser.email);

    if (!user) {
      // Create new user
      user = await userQueries.createUser(
        googleUser.email,
        null, // No password for OAuth users
        googleUser.name || googleUser.email.split('@')[0]
      );
      
      // Update user with avatar if available
      if (googleUser.picture) {
        user = await userQueries.updateUser(user.id, { image: googleUser.picture });
      }
    }

    // Create session
    const sessionToken = await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      },
      token: sessionToken
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
