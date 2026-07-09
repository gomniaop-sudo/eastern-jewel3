# Eastern Jewel Database Schema

Production database schema for the Eastern Jewel application.

## Overview

This schema is designed for Supabase (PostgreSQL 15+) and manages all persistent data for the Eastern Jewel portfolio site.

## Tables

### 1. `categories`

Stores categories used for organizing gallery items and journal entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(100) | Category display name |
| `slug` | VARCHAR(100) | URL-friendly identifier, unique |
| `type` | VARCHAR(50) | Category type: 'gallery', 'journal', or 'both' |
| `label_en` | VARCHAR(100) | English label for i18n |
| `label_ar` | VARCHAR(100) | Arabic label for i18n |
| `sort_order` | INTEGER | Display order (lower = first) |
| `is_active` | BOOLEAN | Soft delete flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**: slug, type, is_active

**Default Categories**:
- Gallery: all, portraits, artistic, lifestyle, exclusive
- Journal: photography, art-direction, editorial

---

### 2. `gallery_items`

Stores gallery images and their metadata for the portfolio display.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `title` | VARCHAR(255) | Image title |
| `slug` | VARCHAR(255) | URL-friendly identifier, unique |
| `description` | TEXT | Image description/caption |
| `image_url` | TEXT | URL to the image (Pexels or custom) |
| `image_alt` | VARCHAR(255) | Alt text for accessibility |
| `category_id` | UUID | Foreign key to categories |
| `is_premium` | BOOLEAN | Premium content flag |
| `is_featured` | BOOLEAN | Featured on homepage |
| `is_active` | BOOLEAN | Soft delete flag |
| `sort_order` | INTEGER | Display order |
| `view_count` | INTEGER | Total views counter |
| `metadata` | JSONB | Flexible metadata storage |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**: slug, category_id, is_premium, is_featured, is_active, sort_order

**Relationships**:
- `category_id` → `categories.id` (ON DELETE SET NULL)

---

### 3. `journal_entries`

Stores blog posts, articles, and journal entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `title` | VARCHAR(255) | Article title |
| `slug` | VARCHAR(255) | URL-friendly identifier, unique |
| `excerpt` | TEXT | Short preview text |
| `content` | TEXT | Full article content (Markdown) |
| `image_url` | TEXT | Featured image URL |
| `image_alt` | VARCHAR(255) | Alt text for image |
| `category` | VARCHAR(100) | Category name |
| `author` | VARCHAR(100) | Author name |
| `published_at` | DATE | Publication date |
| `is_featured` | BOOLEAN | Featured on homepage |
| `is_published` | BOOLEAN | Publication status |
| `view_count` | INTEGER | Total views counter |
| `reading_time_minutes` | INTEGER | Estimated read time |
| `tags` | TEXT[] | Array of tags |
| `metadata` | JSONB | Flexible metadata storage |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**: slug, category, is_published, is_featured, published_at (DESC), tags (GIN)

---

### 4. `newsletter_subscriptions`

Stores email newsletter signups from the footer form.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `email` | VARCHAR(255) | Subscriber email, unique |
| `is_active` | BOOLEAN | Subscription status |
| `subscribed_at` | TIMESTAMPTZ | Subscription timestamp |
| `unsubscribed_at` | TIMESTAMPTZ | Unsubscription timestamp |
| `source` | VARCHAR(100) | Signup source (footer, popup, etc.) |
| `ip_address` | VARCHAR(45) | Subscriber IP (IPv4/IPv6) |
| `user_agent` | TEXT | Browser user agent |
| `preferences` | JSONB | Email preferences |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**: email (unique), is_active, subscribed_at (DESC)

---

### 5. `contact_messages`

Stores contact form submissions from the contact page.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Sender name |
| `email` | VARCHAR(255) | Sender email |
| `subject` | VARCHAR(255) | Message subject (optional) |
| `message` | TEXT | Message content |
| `status` | VARCHAR(50) | Status: pending, read, replied, archived, spam |
| `priority` | VARCHAR(20) | Priority: low, normal, high, urgent |
| `ip_address` | VARCHAR(45) | Sender IP (IPv4/IPv6) |
| `user_agent` | TEXT | Browser user agent |
| `source_page` | VARCHAR(255) | Page form was submitted from |
| `notes` | TEXT | Internal notes (admin use) |
| `replied_at` | TIMESTAMPTZ | When replied |
| `replied_by` | VARCHAR(255) | Who replied |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**: email, status, created_at (DESC), priority

---

### 6. `site_settings`

Key-value store for site configuration and dynamic settings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `key` | VARCHAR(100) | Setting key, unique |
| `value` | TEXT | Setting value |
| `value_type` | VARCHAR(50) | Type: string, integer, boolean, json, text |
| `description` | TEXT | Setting description |
| `is_public` | BOOLEAN | Visible to frontend |
| `category` | VARCHAR(50) | Setting category |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**: key (unique), is_public, category

**Default Settings**:
- `site_name` - Site name for branding
- `site_tagline` - Tagline shown in header
- `contact_email` - Primary contact email
- `response_time` - Expected response time
- `gallery_limit_section` - Items on homepage (6)
- `gallery_limit_page` - Items on gallery page (12)
- `journal_limit_section` - Entries on homepage (3)
- `journal_limit_page` - Entries on journal page (6)

---

## Row Level Security (RLS)

All tables have RLS enabled for production security.

### Public Access (No Auth Required)

| Table | Operation | Condition |
|-------|-----------|-----------|
| categories | SELECT | is_active = true |
| gallery_items | SELECT | is_active = true |
| journal_entries | SELECT | is_published = true |
| site_settings | SELECT | is_public = true |
| newsletter_subscriptions | INSERT | email is not null |
| contact_messages | INSERT | required fields validated |

### Admin Access (Service Role)

Full CRUD access is available using the service role key for admin operations.

---

## Triggers

### Auto-Update Timestamps

All tables include an `updated_at` column that is automatically updated on any row modification using the `update_updated_at_column()` trigger function.

---

## Usage

### Applying the Schema

Use the Supabase MCP `apply_migration` tool:

```
mcp__supabase__apply_migration({
  filename: 'initial_schema',
  content: <schema.sql contents>
})
```

### Querying from Frontend

```typescript
import { supabase } from '@/lib/supabase';

// Get all active gallery items
const { data, error } = await supabase
  .from('gallery_items')
  .select('*, categories(*)')
  .eq('is_active', true)
  .order('sort_order');

// Subscribe to newsletter
const { error } = await supabase
  .from('newsletter_subscriptions')
  .insert({ email: 'user@example.com' });

// Submit contact form
const { error } = await supabase
  .from('contact_messages')
  .insert({
    name: 'John',
    email: 'john@example.com',
    message: 'Hello!'
  });
```

---

## Migration Strategy

1. **Phase 1**: Create schema (this file)
2. **Phase 2**: Seed initial data from static content
3. **Phase 3**: Connect frontend to database
4. **Phase 4**: Add admin interface for content management

---

## Notes

- UUIDs are used for all primary keys (better for distributed systems)
- Soft deletes via `is_active` flags preserve data integrity
- JSONB columns allow flexible metadata without schema changes
- All timestamps use TIMESTAMPTZ for timezone awareness
- Indexes are optimized for common query patterns
