import { Pool } from 'pg';

// Create PostgreSQL connection pool
// Supabase requires SSL, so we enable it when DATABASE_URL contains supabase
const isSupabase = process.env.DATABASE_URL?.includes('supabase') || false;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

export { pool };

// Database schema creation SQL
export const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        image TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table (keeping existing structure)
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        json TEXT,
        width INTEGER,
        height INTEGER,
        is_template BOOLEAN DEFAULT FALSE,
        is_pro BOOLEAN DEFAULT FALSE,
        thumbnail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table for custom session management
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// User operations
export const userQueries = {
  async createUser(email: string, password: string | null, name?: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, image, created_at',
        [email, password, name]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async findUserByEmail(email: string) {
    const client = await pool.connect();
    try {
      // Normalize email for case-insensitive search
      const normalizedEmail = email.trim().toLowerCase();
      console.log('[DB] Searching for user by email', { 
        inputEmail: email,
        normalizedEmail 
      });
      
      const result = await client.query(
        'SELECT * FROM users WHERE LOWER(TRIM(email)) = $1',
        [normalizedEmail]
      );
      
      console.log('[DB] Query result', { 
        found: result.rows.length > 0,
        rowCount: result.rows.length,
        email: result.rows[0]?.email 
      });
      
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async findUserById(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, image, email_verified, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateUser(id: string, updates: Partial<{ name: string; image: string; email_verified: boolean }>) {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = [id, ...Object.values(updates)];
      
      const result = await client.query(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, name, image, email_verified`,
        values
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};

// Session operations
export const sessionQueries = {
  async createSession(userId: string, token: string, expiresAt: Date) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
        [userId, token, expiresAt]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async findSessionByToken(token: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT s.*, u.id as user_id, u.email, u.name, u.image FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()',
        [token]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async deleteSession(token: string) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sessions WHERE token = $1', [token]);
    } finally {
      client.release();
    }
  },

  async deleteExpiredSessions() {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sessions WHERE expires_at <= NOW()');
    } finally {
      client.release();
    }
  }
};
