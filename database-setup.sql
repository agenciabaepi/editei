-- =====================================================
-- Canva Clone - Complete Database Setup Script
-- =====================================================
-- This script creates all necessary tables and indexes
-- Run this script in your PostgreSQL database after creating it
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  image TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
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
  deleted_at TIMESTAMP DEFAULT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  stripe_current_period_end TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_user_deleted ON projects(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_template ON projects(is_template);
CREATE INDEX IF NOT EXISTS idx_projects_is_pro ON projects(is_pro);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Images table indexes
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Create a default admin user (password: admin123)
-- Note: In production, use a secure password and hash it properly
INSERT INTO users (email, password, name, role, email_verified) 
VALUES (
  'admin@admin.com',
  '$2a$12$6slsBz49dx2SgV97r7tM5uje9vXzbgMT1I2ZJz9f7ZmmhJI2gjHN2', -- bcrypt hash for 'admin123'
  'Admin User', 
  'admin', 
  true
) ON CONFLICT (email) DO UPDATE SET role = 'admin';


-- =====================================================
-- CLEANUP
-- =====================================================

-- Clean up expired sessions
DELETE FROM sessions WHERE expires_at <= NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment these to verify the setup
-- SELECT 'Users table created' as status, COUNT(*) as count FROM users;
-- SELECT 'Sessions table created' as status, COUNT(*) as count FROM sessions;
-- SELECT 'Projects table created' as status, COUNT(*) as count FROM projects;
-- SELECT 'Subscriptions table created' as status, COUNT(*) as count FROM subscriptions;
-- SELECT 'Images table created' as status, COUNT(*) as count FROM images;

DO
$$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
END;
$$;

