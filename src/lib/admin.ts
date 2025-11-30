import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { pool } from "@/lib/database";

export async function requireAdmin() {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Check if user has admin role
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [session.user.id]
    );
    
    if (!result.rows[0] || result.rows[0].role !== "admin") {
      redirect("/");
    }
  } finally {
    client.release();
  }

  return session;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    return result.rows[0]?.role === "admin";
  } finally {
    client.release();
  }
}
