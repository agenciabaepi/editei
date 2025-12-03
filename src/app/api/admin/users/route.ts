import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const client = await pool.connect();
    const userResult = await client.query(
      `SELECT role FROM users WHERE id = $1`,
      [session.user.id]
    );
    
    if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
      client.release();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with basic info
    const usersResult = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        s.status as subscription_status
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ORDER BY u.created_at DESC
    `);
    
    client.release();

    return NextResponse.json({ users: usersResult.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const client = await pool.connect();
    const userResult = await client.query(
      `SELECT role FROM users WHERE id = $1`,
      [session.user.id]
    );
    
    if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
      client.release();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await client.query(
      `SELECT id FROM users WHERE LOWER(TRIM(email)) = $1`,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password before saving
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword(password);

    // Create new user with normalized email and hashed password
    const newUserResult = await client.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
      [name, normalizedEmail, hashedPassword, role || 'user']
    );
    
    client.release();

    return NextResponse.json({ 
      message: "User created successfully",
      user: newUserResult.rows[0]
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
