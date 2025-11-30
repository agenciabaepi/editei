import { NextRequest, NextResponse } from 'next/server';
import { createTables } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    await createTables();
    
    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database initialization failed' 
      },
      { status: 500 }
    );
  }
}
