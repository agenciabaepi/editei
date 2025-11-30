import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { userQueries, sessionQueries } from './database';

// Generate secure random token
function generateToken(): string {
  return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await sessionQueries.createSession(userId, token, expiresAt);
  
  // Set HTTP-only cookie
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });
  
  return token;
}

// Get current session
export async function getCurrentSession() {
  const sessionToken = cookies().get('session')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  const session = await sessionQueries.findSessionByToken(sessionToken);
  
  if (!session) {
    // Clean up invalid cookie
    cookies().delete('session');
    return null;
  }
  
  return {
    user: {
      id: session.user_id,
      email: session.email,
      name: session.name,
      image: session.image
    },
    token: sessionToken
  };
}

// Logout
export async function logout() {
  const sessionToken = cookies().get('session')?.value;
  
  if (sessionToken) {
    await sessionQueries.deleteSession(sessionToken);
  }
  
  cookies().delete('session');
}

// Register user
export async function registerUser(email: string, password: string, name?: string) {
  try {
    // Check if user already exists
    const existingUser = await userQueries.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await userQueries.createUser(email, hashedPassword, name);
    
    // Create session
    const token = await createSession(user.id);
    
    return { user, token };
  } catch (error) {
    throw error;
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    // Find user
    const user = await userQueries.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Create session
    const token = await createSession(user.id);
    
    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }, 
      token 
    };
  } catch (error) {
    throw error;
  }
}

// Middleware helper to protect routes
export async function requireAuth() {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}
