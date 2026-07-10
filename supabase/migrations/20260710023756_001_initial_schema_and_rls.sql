/*
# Eastern Jewel — Initial Production Schema with Full RLS Security

## Summary
Creates the complete database schema for the Eastern Jewel platform with enterprise-grade Row Level Security.

## Tables Created
1. `categories` — Gallery and journal categories (public read, admin write)
2. `gallery_items` — Gallery images and metadata (public read active, admin full CRUD)
3. `journal_entries` — Blog posts (public read published, admin full CRUD)
4. `newsletter_subscriptions` — Email signups (public insert, admin full CRUD)
5. `contact_messages` — Contact form submissions (public insert, admin full CRUD)
6. `site_settings` — Site configuration (public read public settings, admin full CRUD)

## Security Architecture
- RLS enabled on ALL tables — no table is unprotected
- Public users (anon): read-only for published/active content; insert-only for contact/newsletter
- Anonymous cannot modify, delete, or access private content
- Authenticated admin users: full CRUD on all tables via service role
- Sensitive tables (contact_messages, all newsletter details) hidden from public SELECT

## Design Decisions
- This is a single-admin CMS (no multi-user ownership scoping needed)
- Admin operations use the Supabase service role key (bypasses RLS) from server-side
- Public operations use anon key (restricted by RLS policies)
- No `user_id` columns needed because there is one admin managing all content
*/

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CATEGORIES TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GALLERY ITEMS TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_gallery_items_slug ON gallery_items(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_premium ON gallery_items(is_premium);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON gallery_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON gallery_items(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_items_sort ON gallery_items(sort_order);

DROP TRIGGER IF EXISTS gallery_items_updated_at ON gallery_items;
CREATE TRIGGER gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_journal_entries_slug ON journal_entries(slug);
CREATE INDEX IF NOT EXISTS idx_journal_entries_category ON journal_entries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_published ON journal_entries(is_published);
CREATE INDEX IF NOT EXISTS idx_journal_entries_featured ON journal_entries(is_featured);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);

DROP TRIGGER IF EXISTS journal_entries_updated_at ON journal_entries;
CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscriptions(subscribed_at DESC);

DROP TRIGGER IF EXISTS newsletter_subscriptions_updated_at ON newsletter_subscriptions;
CREATE TRIGGER newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_priority ON contact_messages(priority);

DROP TRIGGER IF EXISTS contact_messages_updated_at ON contact_messages;
CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_public ON site_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY — Enable on all tables
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATEGORIES: Public READ (active only), Auth WRITE
-- ============================================

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- GALLERY ITEMS: Public READ (active only), Auth FULL CRUD
-- ============================================

DROP POLICY IF EXISTS "public_read_gallery" ON gallery_items;
CREATE POLICY "public_read_gallery" ON gallery_items
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "auth_insert_gallery" ON gallery_items;
CREATE POLICY "auth_insert_gallery" ON gallery_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_gallery" ON gallery_items;
CREATE POLICY "auth_update_gallery" ON gallery_items
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_gallery" ON gallery_items;
CREATE POLICY "auth_delete_gallery" ON gallery_items
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- JOURNAL ENTRIES: Public READ (published only), Auth FULL CRUD
-- ============================================

DROP POLICY IF EXISTS "public_read_journal" ON journal_entries;
CREATE POLICY "public_read_journal" ON journal_entries
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "auth_insert_journal" ON journal_entries;
CREATE POLICY "auth_insert_journal" ON journal_entries
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_journal" ON journal_entries;
CREATE POLICY "auth_update_journal" ON journal_entries
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_journal" ON journal_entries;
CREATE POLICY "auth_delete_journal" ON journal_entries
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- NEWSLETTER: Public INSERT, No public READ/UPDATE/DELETE, Auth FULL CRUD
-- ============================================

DROP POLICY IF EXISTS "public_insert_newsletter" ON newsletter_subscriptions;
CREATE POLICY "public_insert_newsletter" ON newsletter_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 255
  );

DROP POLICY IF EXISTS "auth_select_newsletter" ON newsletter_subscriptions;
CREATE POLICY "auth_select_newsletter" ON newsletter_subscriptions
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_update_newsletter" ON newsletter_subscriptions;
CREATE POLICY "auth_update_newsletter" ON newsletter_subscriptions
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_newsletter" ON newsletter_subscriptions;
CREATE POLICY "auth_delete_newsletter" ON newsletter_subscriptions
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- CONTACT MESSAGES: Public INSERT (validated), No public READ, Auth FULL CRUD
-- ============================================

DROP POLICY IF EXISTS "public_insert_contact" ON contact_messages;
CREATE POLICY "public_insert_contact" ON contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL
    AND length(trim(name)) >= 2
    AND email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND message IS NOT NULL
    AND length(trim(message)) >= 10
  );

DROP POLICY IF EXISTS "auth_select_contact" ON contact_messages;
CREATE POLICY "auth_select_contact" ON contact_messages
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_update_contact" ON contact_messages;
CREATE POLICY "auth_update_contact" ON contact_messages
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact" ON contact_messages;
CREATE POLICY "auth_delete_contact" ON contact_messages
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- SITE SETTINGS: Public READ (public only), Auth FULL CRUD
-- ============================================

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "auth_insert_settings" ON site_settings;
CREATE POLICY "auth_insert_settings" ON site_settings
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_settings" ON site_settings;
CREATE POLICY "auth_update_settings" ON site_settings
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_settings" ON site_settings;
CREATE POLICY "auth_delete_settings" ON site_settings
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- DEFAULT DATA — CATEGORIES
-- ============================================

INSERT INTO categories (name, slug, type, label_en, label_ar, sort_order) VALUES
('All', 'all', 'gallery', 'All', 'الكل', 0),
('Portraits', 'portraits', 'gallery', 'Portraits', 'بورتريهات', 1),
('Artistic', 'artistic', 'gallery', 'Artistic', 'فني', 2),
('Lifestyle', 'lifestyle', 'gallery', 'Lifestyle', 'أسلوب الحياة', 3),
('Exclusive', 'exclusive', 'gallery', 'Exclusive', 'حصري', 4),
('Photography', 'photography', 'journal', 'Photography', 'التصوير', 10),
('Art Direction', 'art-direction', 'journal', 'Art Direction', 'التوجيه الفني', 11),
('Editorial', 'editorial', 'journal', 'Editorial', 'تحريري', 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- DEFAULT DATA — SITE SETTINGS
-- ============================================

INSERT INTO site_settings (key, value, value_type, description, is_public, category) VALUES
('site_name', 'Eastern Jewel', 'string', 'Site name displayed in header', true, 'branding'),
('site_tagline', 'Timeless Elegance', 'string', 'Site tagline', true, 'branding'),
('contact_email', 'contact@easternjewel.com', 'string', 'Primary contact email', true, 'contact'),
('response_time', '24-48 hours', 'string', 'Expected response time', true, 'contact'),
('gallery_limit_section', '6', 'integer', 'Number of gallery items on homepage', true, 'display'),
('gallery_limit_page', '12', 'integer', 'Number of gallery items on gallery page', true, 'display'),
('journal_limit_section', '3', 'integer', 'Number of journal entries on homepage', true, 'display'),
('journal_limit_page', '6', 'integer', 'Number of journal entries on journal page', true, 'display')
ON CONFLICT (key) DO NOTHING;
