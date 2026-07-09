/**
 * Contact Service
 */

import { supabase } from '../lib/supabase';
import type { ContactMessageRow, ContactMessageInsert, ContactMessageUpdate } from '../lib/database.types';

export interface ContactFilter {
  status?: 'pending' | 'read' | 'replied' | 'archived' | 'spam';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  limit?: number;
  offset?: number;
}

export interface SubmitContactOptions {
  name: string;
  email: string;
  subject?: string;
  message: string;
  sourcePage?: string;
  ipAddress?: string;
  userAgent?: string;
}

const TABLE = 'contact_messages';

export const contactService = {
  async getAll(filters?: ContactFilter): Promise<ContactMessageRow[]> {
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return data as ContactMessageRow[];
  },

  async getById(id: string): Promise<ContactMessageRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as ContactMessageRow;
  },

  async submit(options: SubmitContactOptions): Promise<ContactMessageRow> {
    const insert: ContactMessageInsert = {
      name: options.name,
      email: options.email.toLowerCase(),
      subject: options.subject || null,
      message: options.message,
      source_page: options.sourcePage,
      ip_address: options.ipAddress,
      user_agent: options.userAgent,
      status: 'pending',
      priority: 'normal',
    };
    const { data, error } = await supabase.from(TABLE).insert(insert as unknown as Record<string, unknown>).select().single();
    if (error) throw error;
    return data as ContactMessageRow;
  },

  async create(message: ContactMessageInsert): Promise<ContactMessageRow> {
    const { data, error } = await supabase.from(TABLE).insert({ ...message, email: message.email.toLowerCase() } as unknown as Record<string, unknown>).select().single();
    if (error) throw error;
    return data as ContactMessageRow;
  },

  async update(id: string, updates: ContactMessageUpdate): Promise<ContactMessageRow> {
    const { data, error } = await supabase.from(TABLE).update(updates as unknown as Record<string, unknown>).eq('id', id).select().single();
    if (error) throw error;
    return data as ContactMessageRow;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async markAsRead(id: string): Promise<ContactMessageRow> { return this.update(id, { status: 'read' }); },
  async markAsReplied(id: string, repliedBy?: string): Promise<ContactMessageRow> { return this.update(id, { status: 'replied', replied_at: new Date().toISOString(), replied_by: repliedBy || null }); },
  async archive(id: string): Promise<ContactMessageRow> { return this.update(id, { status: 'archived' }); },
  async markAsSpam(id: string): Promise<ContactMessageRow> { return this.update(id, { status: 'spam' }); },
  async setPriority(id: string, priority: 'low' | 'normal' | 'high' | 'urgent'): Promise<ContactMessageRow> { return this.update(id, { priority }); },
  async addNotes(id: string, notes: string): Promise<ContactMessageRow> { return this.update(id, { notes }); },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('status', 'pending');
    if (error) throw error;
    return count || 0;
  },

  async getByEmail(email: string): Promise<ContactMessageRow[]> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('email', email.toLowerCase()).order('created_at', { ascending: false });
    if (error) throw error;
    return data as ContactMessageRow[];
  },
};
