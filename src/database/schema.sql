-- ============================================
-- Eastern Jewel Production Database Schema
-- Version: 1.0.0
-- Created: 2026-07-09
-- ============================================
--
-- This schema is designed for Supabase (PostgreSQL 15+)
-- Run migrations using the Supabase MCP apply_migration tool
--
-- Tables:
--   1. categories        - Gallery and journal categories
--   2. gallery_items     - Gallery images and content
--   3. journal_entries   - Blog/journal posts
--   4. newsletter_subscriptions - Email newsletter signups
--   5. contact_messages  - Contact form submissions
--   6. site_settings     - Site configuration key-value store
--
-- ============================================

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CATEGORY TABLE
-- ============================================
-- Stores categories for gallery items and journal entries

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('gallery', 'journal', 'both')),
  label_en VARCHAR(100) NOT NULL,
  label_ar VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Auto-update trigger for categories
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GALLERY ITEMS TABLE
-- ============================================
-- Stores gallery images and their metadata

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  image_alt VARCHAR(255),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for gallery_items
CREATE INDEX idx_gallery_items_slug ON gallery_items(slug);
CREATE INDEX idx_gallery_items_category ON gallery_items(category_id);
CREATE INDEX idx_gallery_items_premium ON gallery_items(is_premium);
CREATE INDEX idx_gallery_items_featured ON gallery_items(is_featured);
CREATE INDEX idx_gallery_items_active ON gallery_items(is_active);
CREATE INDEX idx_gallery_items_sort ON gallery_items(sort_order);

-- Auto-update trigger for gallery_items
CREATE TRIGGER gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================
-- Stores blog/journal posts and articles

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  image_alt VARCHAR(255),
  category VARCHAR(100),
  author VARCHAR(100),
  published_at DATE,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for journal_entries
CREATE INDEX idx_journal_entries_slug ON journal_entries(slug);
CREATE INDEX idx_journal_entries_category ON journal_entries(category);
CREATE INDEX idx_journal_entries_published ON journal_entries(is_published);
CREATE INDEX idx_journal_entries_featured ON journal_entries(is_featured);
CREATE INDEX idx_journal_entries_date ON journal_entries(published_at DESC);
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- Auto-update trigger for journal_entries
CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================
-- Stores email newsletter signups

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source VARCHAR(100) DEFAULT 'footer',
  ip_address VARCHAR(45),
  user_agent TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for newsletter_subscriptions
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX idx_newsletter_subscribed ON newsletter_subscriptions(subscribed_at DESC);

-- Auto-update trigger for newsletter_subscriptions
CREATE TRIGGER newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
-- Stores contact form submissions

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived', 'spam')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  source_page VARCHAR(255),
  notes TEXT,
  replied_at TIMESTAMPTZ,
  replied_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for contact_messages
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_priority ON contact_messages(priority);

-- Auto-update trigger for contact_messages
CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
-- Key-value store for site configuration

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  value_type VARCHAR(50) DEFAULT 'string' CHECK (value_type IN ('string', 'integer', 'boolean', 'json', 'text')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for site_settings
CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_public ON site_settings(is_public);
CREATE INDEX idx_site_settings_category ON site_settings(category);

-- Auto-update trigger for site_settings
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables for production security

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC READ POLICIES
-- ============================================
-- Allow public read access for active content (no auth required for frontend)

CREATE POLICY "public_read_categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "public_read_gallery" ON gallery_items
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "public_read_journal" ON journal_entries
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "public_read_settings" ON site_settings
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

-- ============================================
-- PUBLIC INSERT POLICIES
-- ============================================
-- Allow public inserts for user-submitted data

CREATE POLICY "public_insert_newsletter" ON newsletter_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL);

CREATE POLICY "public_insert_contact" ON contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (name IS NOT NULL AND email IS NOT NULL AND message IS NOT NULL);

-- ============================================
-- DEFAULT DATA - CATEGORIES
-- ============================================
-- Insert default gallery categories

INSERT INTO categories (name, slug, type, label_en, label_ar, sort_order) VALUES
('All', 'all', 'gallery', 'All', 'الكل', 0),
('Portraits', 'portraits', 'gallery', 'Portraits', 'بورتريهات', 1),
('Artistic', 'artistic', 'gallery', 'Artistic', 'فني', 2),
('Lifestyle', 'lifestyle', 'gallery', 'Lifestyle', 'أسلوب الحياة', 3),
('Exclusive', 'exclusive', 'gallery', 'Exclusive', 'حصري', 4),
('Photography', 'photography', 'journal', 'Photography', 'التصوير', 10),
('Art Direction', 'art-direction', 'journal', 'Art Direction', 'التوجيه الفني', 11),
('Editorial', 'editorial', 'journal', 'Editorial', 'تحريري', 12);

-- ============================================
-- DEFAULT DATA - SITE SETTINGS
-- ============================================
-- Insert default site configuration

INSERT INTO site_settings (key, value, value_type, description, is_public, category) VALUES
('site_name', 'Eastern Jewel', 'string', 'Site name displayed in header', true, 'branding'),
('site_tagline', 'Timeless Elegance', 'string', 'Site tagline', true, 'branding'),
('contact_email', 'contact@easternjewel.com', 'string', 'Primary contact email', true, 'contact'),
('response_time', '24-48 hours', 'string', 'Expected response time', true, 'contact'),
('gallery_limit_section', '6', 'integer', 'Number of gallery items on homepage', true, 'display'),
('gallery_limit_page', '12', 'integer', 'Number of gallery items on gallery page', true, 'display'),
('journal_limit_section', '3', 'integer', 'Number of journal entries on homepage', true, 'display'),
('journal_limit_page', '6', 'integer', 'Number of journal entries on journal page', true, 'display');

-- ============================================
-- END OF SCHEMA
-- ============================================
