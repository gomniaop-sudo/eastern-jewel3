/**
 * Journal Service
 */

import { supabase } from '../lib/supabase';
import type { JournalEntryRow, JournalEntryInsert, JournalEntryUpdate } from '../lib/database.types';

export interface JournalFilter {
  category?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
  tag?: string;
}

const TABLE = 'journal_entries';

export const journalService = {
  async getAll(filters?: JournalFilter): Promise<JournalEntryRow[]> {
    let query = supabase.from(TABLE).select('*').order('published_at', { ascending: false });

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.isFeatured !== undefined) query = query.eq('is_featured', filters.isFeatured);
    if (filters?.isPublished !== undefined) query = query.eq('is_published', filters.isPublished);
    else query = query.eq('is_published', true);
    if (filters?.tag) query = query.contains('tags', [filters.tag]);
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data as JournalEntryRow[];
  },

  async getById(id: string): Promise<JournalEntryRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as JournalEntryRow;
  },

  async getBySlug(slug: string): Promise<JournalEntryRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('slug', slug).eq('is_published', true).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as JournalEntryRow;
  },

  async create(entry: JournalEntryInsert): Promise<JournalEntryRow> {
    const { data, error } = await supabase.from(TABLE).insert(entry as unknown as Record<string, unknown>).select().single();
    if (error) throw error;
    return data as JournalEntryRow;
  },

  async update(id: string, updates: JournalEntryUpdate): Promise<JournalEntryRow> {
    const { data, error } = await supabase.from(TABLE).update(updates as unknown as Record<string, unknown>).eq('id', id).select().single();
    if (error) throw error;
    return data as JournalEntryRow;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async incrementViewCount(id: string): Promise<void> {
    const { data } = await supabase.from(TABLE).select('view_count').eq('id', id).single();
    if (data) {
      await supabase.from(TABLE).update({ view_count: ((data as { view_count: number }).view_count || 0) + 1 }).eq('id', id);
    }
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase.from(TABLE).select('category').eq('is_published', true).not('category', 'is', null);
    if (error) throw error;
    const categories = (data as { category: string | null }[]).map((item) => item.category).filter((cat): cat is string => cat !== null);
    return [...new Set(categories)];
  },

  async getTags(): Promise<string[]> {
    const { data, error } = await supabase.from(TABLE).select('tags').eq('is_published', true).not('tags', 'is', null);
    if (error) throw error;
    const allTags = (data as { tags: string[] | null }[]).flatMap((item) => item.tags || []).filter((tag): tag is string => tag !== null);
    return [...new Set(allTags)];
  },
};
