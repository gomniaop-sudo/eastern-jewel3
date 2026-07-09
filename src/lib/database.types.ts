/**
 * Supabase Database Types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface GalleryItemRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string;
  image_alt: string | null;
  category_id: string | null;
  is_premium: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  view_count: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemInsert {
  id?: string;
  title: string;
  slug: string;
  description?: string | null;
  image_url: string;
  image_alt?: string | null;
  category_id?: string | null;
  is_premium?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  view_count?: number;
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryItemUpdate {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  image_url?: string;
  image_alt?: string | null;
  category_id?: string | null;
  is_premium?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  view_count?: number;
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  type: 'gallery' | 'journal' | 'both';
  label_en: string;
  label_ar: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  image_alt: string | null;
  category: string | null;
  author: string | null;
  published_at: string | null;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  reading_time_minutes: number | null;
  tags: string[] | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryInsert {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  category?: string | null;
  author?: string | null;
  published_at?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
  view_count?: number;
  reading_time_minutes?: number | null;
  tags?: string[] | null;
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntryUpdate {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  category?: string | null;
  author?: string | null;
  published_at?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
  view_count?: number;
  reading_time_minutes?: number | null;
  tags?: string[] | null;
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface NewsletterSubscriptionRow {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string | null;
  ip_address: string | null;
  user_agent: string | null;
  preferences: Json;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriptionInsert {
  id?: string;
  email: string;
  is_active?: boolean;
  subscribed_at?: string;
  unsubscribed_at?: string | null;
  source?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  preferences?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface NewsletterSubscriptionUpdate {
  id?: string;
  email?: string;
  is_active?: boolean;
  subscribed_at?: string;
  unsubscribed_at?: string | null;
  source?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  preferences?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived' | 'spam';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  ip_address: string | null;
  user_agent: string | null;
  source_page: string | null;
  notes: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageInsert {
  id?: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status?: 'pending' | 'read' | 'replied' | 'archived' | 'spam';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  ip_address?: string | null;
  user_agent?: string | null;
  source_page?: string | null;
  notes?: string | null;
  replied_at?: string | null;
  replied_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessageUpdate {
  id?: string;
  name?: string;
  email?: string;
  subject?: string | null;
  message?: string;
  status?: 'pending' | 'read' | 'replied' | 'archived' | 'spam';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  ip_address?: string | null;
  user_agent?: string | null;
  source_page?: string | null;
  notes?: string | null;
  replied_at?: string | null;
  replied_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettingRow {
  id: string;
  key: string;
  value: string | null;
  value_type: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  description: string | null;
  is_public: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingInsert {
  id?: string;
  key: string;
  value?: string | null;
  value_type?: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  description?: string | null;
  is_public?: boolean;
  category?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettingUpdate {
  id?: string;
  key?: string;
  value?: string | null;
  value_type?: 'string' | 'integer' | 'boolean' | 'json' | 'text';
  description?: string | null;
  is_public?: boolean;
  category?: string | null;
  created_at?: string;
  updated_at?: string;
}
