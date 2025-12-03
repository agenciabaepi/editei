-- =====================================================
-- ELEMENTS TABLE
-- =====================================================
-- Table to store design elements (PNG, 3D, etc.) for users to use in the editor
-- =====================================================

CREATE TABLE IF NOT EXISTS elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'png', '3d', 'icon', 'illustration', etc.
  file_url TEXT NOT NULL, -- URL to the element file (PNG, GLB, etc.)
  thumbnail_url TEXT, -- URL to thumbnail/preview image
  width INTEGER,
  height INTEGER,
  file_type VARCHAR(50) NOT NULL, -- 'image/png', 'model/glb', 'image/svg', etc.
  tags TEXT[], -- Array of tags for search/filtering
  is_pro BOOLEAN DEFAULT FALSE, -- Whether this element requires pro subscription
  is_active BOOLEAN DEFAULT TRUE, -- Whether this element is visible to users
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who created it
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_elements_category ON elements(category);
CREATE INDEX IF NOT EXISTS idx_elements_is_active ON elements(is_active);
CREATE INDEX IF NOT EXISTS idx_elements_is_pro ON elements(is_pro);
CREATE INDEX IF NOT EXISTS idx_elements_created_at ON elements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_elements_tags ON elements USING GIN(tags);

-- Full text search index for name and description
CREATE INDEX IF NOT EXISTS idx_elements_search ON elements USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

