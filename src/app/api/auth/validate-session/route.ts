import { NextRequest, NextResponse } from 'next/server';
import { sessionQueries } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ valid: false });
    }
    
    const session = await sessionQueries.findSessionByToken(token);
    
    return NextResponse.json({ 
      valid: !!session,
      user: session ? {
        id: session.user_id,
        email: session.email,
        name: session.name,
        image: session.image
      } : null
    });
    
  } catch (error) {
    return NextResponse.json({ valid: false });
  }
}
