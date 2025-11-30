import { NextRequest, NextResponse } from 'next/server';
import { userQueries } from '@/lib/database';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    // Verify GitHub token and get user info
    const githubResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!githubResponse.ok) {
      return NextResponse.json({ success: false, error: 'Invalid GitHub token' }, { status: 401 });
    }

    const githubUser = await githubResponse.json();

    if (!githubUser.email) {
      return NextResponse.json({ success: false, error: 'No email found in GitHub account' }, { status: 400 });
    }

    // Check if user already exists
    let user = await userQueries.findUserByEmail(githubUser.email);

    if (!user) {
      // Create new user
      user = await userQueries.createUser(
        githubUser.email,
        null, // No password for OAuth users
        githubUser.name || githubUser.login
      );
      
      // Update user with avatar if available
      if (githubUser.avatar_url) {
        user = await userQueries.updateUser(user.id, { image: githubUser.avatar_url });
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
    console.error('GitHub OAuth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
