/**
 * Newsletter Service
 */

import { supabase } from '../lib/supabase';
import type { NewsletterSubscriptionRow, NewsletterSubscriptionInsert, NewsletterSubscriptionUpdate } from '../lib/database.types';

export interface NewsletterFilter {
  isActive?: boolean;
  source?: string;
  limit?: number;
  offset?: number;
}

export interface SubscribeOptions {
  email: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

const TABLE = 'newsletter_subscriptions';

export const newsletterService = {
  async getAll(filters?: NewsletterFilter): Promise<NewsletterSubscriptionRow[]> {
    let query = supabase.from(TABLE).select('*').order('subscribed_at', { ascending: false });
    if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive);
    if (filters?.source) query = query.eq('source', filters.source);
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return data as NewsletterSubscriptionRow[];
  },

  async getById(id: string): Promise<NewsletterSubscriptionRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as NewsletterSubscriptionRow;
  },

  async getByEmail(email: string): Promise<NewsletterSubscriptionRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('email', email.toLowerCase()).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as NewsletterSubscriptionRow;
  },

  async subscribe(options: SubscribeOptions): Promise<NewsletterSubscriptionRow> {
    const existing = await this.getByEmail(options.email);
    if (existing) {
      if (existing.is_active) return existing;
      return this.update(existing.id, { is_active: true, unsubscribed_at: null, subscribed_at: new Date().toISOString(), source: options.source || existing.source });
    }
    const insert: NewsletterSubscriptionInsert = { email: options.email.toLowerCase(), source: options.source || 'footer', ip_address: options.ipAddress, user_agent: options.userAgent };
    const { data, error } = await supabase.from(TABLE).insert(insert as unknown as Record<string, unknown>).select().single();
    if (error) throw error;
    return data as NewsletterSubscriptionRow;
  },

  async unsubscribe(email: string): Promise<void> {
    const { error } = await supabase.from(TABLE).update({ is_active: false, unsubscribed_at: new Date().toISOString() } as unknown as Record<string, unknown>).eq('email', email.toLowerCase());
    if (error) throw error;
  },

  async create(subscription: NewsletterSubscriptionInsert): Promise<NewsletterSubscriptionRow> {
    const { data, error } = await supabase.from(TABLE).insert({ ...subscription, email: subscription.email.toLowerCase() } as unknown as Record<string, unknown>).select().single();
    if (error) throw error;
    return data as NewsletterSubscriptionRow;
  },

  async update(id: string, updates: NewsletterSubscriptionUpdate): Promise<NewsletterSubscriptionRow> {
    const { data, error } = await supabase.from(TABLE).update(updates as unknown as Record<string, unknown>).eq('id', id).select().single();
    if (error) throw error;
    return data as NewsletterSubscriptionRow;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async isSubscribed(email: string): Promise<boolean> {
    const sub = await this.getByEmail(email);
    return sub?.is_active ?? false;
  },

  async getSubscriberCount(): Promise<number> {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('is_active', true);
    if (error) throw error;
    return count || 0;
  },
};
