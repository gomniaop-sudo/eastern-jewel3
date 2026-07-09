/**
 * Gallery Service
 */

import { supabase } from '../lib/supabase';
import type { GalleryItemRow, GalleryItemInsert, GalleryItemUpdate, CategoryRow } from '../lib/database.types';

export interface GalleryItemWithCategory extends GalleryItemRow {
  categories: CategoryRow | null;
}

export interface GalleryFilter {
  category?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest';
}

export interface AdminGalleryFilter extends GalleryFilter {
  includeInactive?: boolean;
}

const TABLE = 'gallery_items';

export const galleryService = {
  async getAll(filters?: GalleryFilter): Promise<GalleryItemWithCategory[]> {
    let query = supabase
      .from(TABLE)
      .select('*, categories(*)')
      .order('sort_order', { ascending: true });

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('categories.slug', filters.category);
    }
    if (filters?.isPremium !== undefined) {
      query = query.eq('is_premium', filters.isPremium);
    }
    if (filters?.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    } else {
      query = query.eq('is_active', true);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as GalleryItemWithCategory[];
  },

  async getAllAdmin(filters?: AdminGalleryFilter): Promise<GalleryItemWithCategory[]> {
    let query = supabase
      .from(TABLE)
      .select('*, categories(*)', { count: 'exact' });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.isPremium !== undefined) {
      query = query.eq('is_premium', filters.isPremium);
    }
    if (filters?.isActive !== undefined && !filters?.includeInactive) {
      query = query.eq('is_active', filters.isActive);
    } else if (!filters?.includeInactive) {
      query = query.eq('is_active', true);
    }

    const sortAscending = filters?.sortBy === 'oldest';
    query = query.order('created_at', { ascending: sortAscending });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset && filters?.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as GalleryItemWithCategory[];
  },

  async getCount(filters?: AdminGalleryFilter): Promise<number> {
    let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.isPremium !== undefined) {
      query = query.eq('is_premium', filters.isPremium);
    }
    if (filters?.isActive !== undefined && !filters?.includeInactive) {
      query = query.eq('is_active', filters.isActive);
    } else if (!filters?.includeInactive) {
      query = query.eq('is_active', true);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  async getById(id: string): Promise<GalleryItemWithCategory | null> {
    const { data, error } = await supabase.from(TABLE).select('*, categories(*)').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as GalleryItemWithCategory;
  },

  async getBySlug(slug: string): Promise<GalleryItemWithCategory | null> {
    const { data, error } = await supabase.from(TABLE).select('*, categories(*)').eq('slug', slug).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as GalleryItemWithCategory;
  },

  async create(item: GalleryItemInsert): Promise<GalleryItemRow> {
    const { data, error } = await supabase.from(TABLE).insert(item as unknown as Record<string, unknown>).select().single();
    if (error) throw error;
    return data as GalleryItemRow;
  },

  async update(id: string, updates: GalleryItemUpdate): Promise<GalleryItemRow> {
    const { data, error } = await supabase.from(TABLE).update(updates as unknown as Record<string, unknown>).eq('id', id).select().single();
    if (error) throw error;
    return data as GalleryItemRow;
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
};

export const galleryCategoriesService = {
  async getAll(): Promise<CategoryRow[]> {
    const { data, error } = await supabase.from('categories').select('*').in('type', ['gallery', 'both']).eq('is_active', true).order('sort_order', { ascending: true });
    if (error) throw error;
    return data as CategoryRow[];
  },

  async getById(id: string): Promise<CategoryRow | null> {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as CategoryRow;
  },

  async getBySlug(slug: string): Promise<CategoryRow | null> {
    const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as CategoryRow;
  },
};
