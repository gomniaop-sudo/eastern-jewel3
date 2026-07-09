/**
 * Settings Service
 */

import { supabase } from '../lib/supabase';
import type { SiteSettingRow, SiteSettingInsert, SiteSettingUpdate } from '../lib/database.types';

export interface SettingsFilter {
  isPublic?: boolean;
  category?: string;
}

interface SettingsMap {
  [key: string]: string | number | boolean | object | null;
}

const TABLE = 'site_settings';

export const settingsService = {
  async getAll(filters?: SettingsFilter): Promise<SiteSettingRow[]> {
    let query = supabase.from(TABLE).select('*').order('key', { ascending: true });
    if (filters?.isPublic !== undefined) query = query.eq('is_public', filters.isPublic);
    if (filters?.category) query = query.eq('category', filters.category);
    const { data, error } = await query;
    if (error) throw error;
    return data as SiteSettingRow[];
  },

  async getById(id: string): Promise<SiteSettingRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as SiteSettingRow;
  },

  async getByKey(key: string): Promise<SiteSettingRow | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('key', key).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as SiteSettingRow;
  },

  async getValue<T = string>(key: string, defaultValue?: T): Promise<T | undefined> {
    const setting = await this.getByKey(key);
    if (!setting || setting.value === null) return defaultValue;
    const { value, value_type } = setting;
    switch (value_type) {
      case 'integer': return parseInt(value, 10) as T;
      case 'boolean': return (value === 'true' || value === '1') as T;
      case 'json': try { return JSON.parse(value) as T; } catch { return defaultValue; }
      default: return value as T;
    }
  },

  async getValues(keys: string[]): Promise<SettingsMap> {
    const { data, error } = await supabase.from(TABLE).select('key, value, value_type').in('key', keys);
    if (error) throw error;
    const result: SettingsMap = {};
    for (const s of data as { key: string; value: string | null; value_type: string }[]) {
      if (s.value === null) { result[s.key] = null; continue; }
      switch (s.value_type) {
        case 'integer': result[s.key] = parseInt(s.value, 10); break;
        case 'boolean': result[s.key] = s.value === 'true' || s.value === '1'; break;
        case 'json': try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; } break;
        default: result[s.key] = s.value;
      }
    }
    return result;
  },

  async getPublicSettings(): Promise<SettingsMap> {
    const settings = await this.getAll({ isPublic: true });
    const result: SettingsMap = {};
    for (const s of settings) {
      if (s.value === null) { result[s.key] = null; continue; }
      switch (s.value_type) {
        case 'integer': result[s.key] = parseInt(s.value, 10); break;
        case 'boolean': result[s.key] = s.value === 'true' || s.value === '1'; break;
        case 'json': try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; } break;
        default: result[s.key] = s.value;
      }
    }
    return result;
  },

  async create(setting: SiteSettingInsert): Promise<SiteSettingRow> {
    const { data, error } = await supabase.from(TABLE).insert(setting as unknown as Record<string, unknown>).select().single();
    if (error) throw error;
    return data as SiteSettingRow;
  },

  async update(id: string, updates: SiteSettingUpdate): Promise<SiteSettingRow> {
    const { data, error } = await supabase.from(TABLE).update(updates as unknown as Record<string, unknown>).eq('id', id).select().single();
    if (error) throw error;
    return data as SiteSettingRow;
  },

  async updateByKey(key: string, value: string | number | boolean | object): Promise<SiteSettingRow> {
    const existing = await this.getByKey(key);
    if (!existing) throw new Error(`Setting not found: ${key}`);
    let stringValue: string;
    let valueType: SiteSettingRow['value_type'] = existing.value_type;
    switch (typeof value) {
      case 'number': stringValue = String(value); valueType = Number.isInteger(value) ? 'integer' : 'string'; break;
      case 'boolean': stringValue = value ? 'true' : 'false'; valueType = 'boolean'; break;
      case 'object': stringValue = JSON.stringify(value); valueType = 'json'; break;
      default: stringValue = String(value);
    }
    return this.update(existing.id, { value: stringValue, value_type: valueType });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async deleteByKey(key: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('key', key);
    if (error) throw error;
  },

  async upsert(key: string, value: string | number | boolean | object, options?: { description?: string; isPublic?: boolean; category?: string }): Promise<SiteSettingRow> {
    let stringValue: string;
    let valueType: SiteSettingRow['value_type'] = 'string';
    switch (typeof value) {
      case 'number': stringValue = String(value); valueType = Number.isInteger(value) ? 'integer' : 'string'; break;
      case 'boolean': stringValue = value ? 'true' : 'false'; valueType = 'boolean'; break;
      case 'object': stringValue = JSON.stringify(value); valueType = 'json'; break;
      default: stringValue = String(value);
    }
    const insert: SiteSettingInsert = { key, value: stringValue, value_type: valueType, description: options?.description, is_public: options?.isPublic ?? false, category: options?.category ?? 'general' };
    const { data, error } = await supabase.from(TABLE).upsert(insert as unknown as Record<string, unknown>, { onConflict: 'key' }).select().single();
    if (error) throw error;
    return data as SiteSettingRow;
  },
};

export type { SettingsMap };
