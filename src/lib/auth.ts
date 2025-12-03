import './server-only';
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
  if (!password || !hashedPassword) {
    console.error('[AUTH] verifyPassword: Missing password or hash', {
      hasPassword: !!password,
      hasHash: !!hashedPassword
    });
    return false;
  }
  
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('[AUTH] verifyPassword result', {
      passwordLength: password.length,
      hashLength: hashedPassword.length,
      hashPrefix: hashedPassword.substring(0, 10),
      result
    });
    return result;
  } catch (error) {
    console.error('[AUTH] verifyPassword error:', error);
    return false;
  }
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
    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await userQueries.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user with normalized email
    const user = await userQueries.createUser(normalizedEmail, hashedPassword, name);
    
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
    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('[LOGIN] Attempting login', { 
      originalEmail: email, 
      normalizedEmail,
      passwordLength: password.length 
    });
    
    // Find user
    const user = await userQueries.findUserByEmail(normalizedEmail);
    if (!user) {
      console.error('[LOGIN] User not found', { 
        email: normalizedEmail,
        searchedEmail: normalizedEmail 
      });
      throw new Error('Invalid credentials');
    }
    
    console.log('[LOGIN] User found', { 
      userId: user.id,
      userEmail: user.email,
      hasPassword: !!user.password,
      passwordHashLength: user.password?.length || 0
    });
    
    // Check if user has a password (OAuth users don't have passwords)
    if (!user.password) {
      console.error('[LOGIN] User has no password (OAuth user)', { 
        email: normalizedEmail,
        userId: user.id 
      });
      throw new Error('This account was created with social login. Please use the same method to sign in.');
    }
    
    // Verify password
    console.log('[LOGIN] Verifying password...');
    const isValid = await verifyPassword(password, user.password);
    console.log('[LOGIN] Password verification result', { isValid });
    
    if (!isValid) {
      console.error('[LOGIN] Invalid password', { 
        email: normalizedEmail,
        userId: user.id,
        passwordHashPrefix: user.password.substring(0, 20) + '...'
      });
      throw new Error('Invalid credentials');
    }
    
    console.log('[LOGIN] Password valid, creating session...');
    
    // Create session
    const token = await createSession(user.id);
    
    console.log('[LOGIN] Login successful', { userId: user.id, email: user.email });
    
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
    console.error('[LOGIN] Login error:', error);
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
