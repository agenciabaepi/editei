-- =====================================================
-- Add Custom Fonts Table
-- =====================================================
-- This migration adds support for custom uploaded fonts
-- Run this in your PostgreSQL database

CREATE TABLE IF NOT EXISTS custom_fonts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  family_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'sans-serif',
  weights INTEGER[] DEFAULT ARRAY[400],
  file_url TEXT NOT NULL,
  file_format VARCHAR(10) NOT NULL, -- 'woff', 'woff2', 'ttf', 'otf'
  file_size INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(family_name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_fonts_family_name ON custom_fonts(family_name);
CREATE INDEX IF NOT EXISTS idx_custom_fonts_category ON custom_fonts(category);
CREATE INDEX IF NOT EXISTS idx_custom_fonts_active ON custom_fonts(is_active);

-- Add comment
COMMENT ON TABLE custom_fonts IS 'Stores custom uploaded fonts by administrators';

