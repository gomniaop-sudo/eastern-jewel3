import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase with a factory; each test configures the chain result.
vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: { from: mockFrom },
    isSupabaseConfigured: vi.fn(() => true),
  };
});

import { supabase } from '../../lib/supabase';
import { settingsService } from '../../services/settings.service';

// ---------------------------------------------------------------------------
// Helper: Supabase v2-compatible query chain (thenable + .single() Promise).
// ---------------------------------------------------------------------------
type ChainResult = { data: unknown; error: unknown; count?: number | null };

function createChain(result: ChainResult) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'ilike', 'in', 'order', 'limit', 'range', 'head', 'count'];
  for (const m of methods) chain[m] = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve(result));
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  chain.then = (resolve: (v: ChainResult) => unknown, reject?: (r?: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  chain.catch = (reject: (r?: unknown) => unknown) => Promise.resolve(result).catch(reject);
  return chain;
}

function dataChain(data: unknown) {
  return createChain({ data, error: null });
}
function errorChain(error: unknown) {
  return createChain({ data: null, error });
}
function dbError(code: string, message: string) {
  return { code, message, details: '', hint: '' };
}

// Build a setting row shape (partial SiteSettingRow).
function makeSetting(overrides: Partial<{
  id: string;
  key: string;
  value: string | null;
  value_type: string;
  description: string | null;
  is_public: boolean;
  category: string | null;
}> = {}) {
  return {
    id: '1',
    key: 'test_key',
    value: 'value',
    value_type: 'string',
    description: null,
    is_public: false,
    category: 'general',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('settingsService', () => {
  const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => dataChain([]));
  });

  describe('getValue', () => {
    it('returns undefined when the key is not found (PGRST116)', async () => {
      // getByKey calls .single(); getValue calls getByKey internally.
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue('missing_key');
      expect(result).toBeUndefined();
    });

    it('returns undefined when the setting value is null', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'k', value: null, value_type: 'string' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue('k');
      expect(result).toBeUndefined();
    });

    it('returns the defaultValue when the key is not found', async () => {
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue('missing', 'fallback');
      expect(result).toBe('fallback');
    });

    it('coerces value_type "integer" with value "42" to the number 42', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'int_key', value: '42', value_type: 'integer' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<number>('int_key', 0);
      expect(result).toBe(42);
      expect(typeof result).toBe('number');
    });

    it('returns defaultValue (0) for integer when key not found', async () => {
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<number>('nope', 0);
      expect(result).toBe(0);
    });

    it('coerces value_type "boolean" with value "true" to true', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'bool_key', value: 'true', value_type: 'boolean' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<boolean>('bool_key');
      expect(result).toBe(true);
    });

    it('coerces value_type "boolean" with value "1" to true', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'bool_key', value: '1', value_type: 'boolean' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<boolean>('bool_key');
      expect(result).toBe(true);
    });

    it('coerces value_type "boolean" with value "false" to false', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'bool_key', value: 'false', value_type: 'boolean' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<boolean>('bool_key');
      expect(result).toBe(false);
    });

    it('coerces value_type "boolean" with any other value to false', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'bool_key', value: 'maybe', value_type: 'boolean' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<boolean>('bool_key');
      expect(result).toBe(false);
    });

    it('parses value_type "json" with valid JSON into an object', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'json_key', value: '{"a":1}', value_type: 'json' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<Record<string, unknown>>('json_key');
      expect(result).toEqual({ a: 1 });
    });

    it('falls back to the defaultValue when JSON is invalid', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'json_key', value: '{not valid json', value_type: 'json' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue('json_key', 'fallback-string');
      expect(result).toBe('fallback-string');
    });

    it('returns the raw string for value_type "string"', async () => {
      const chain = createChain({
        data: makeSetting({ key: 'str_key', value: 'hello', value_type: 'string' }),
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getValue<string>('str_key');
      expect(result).toBe('hello');
    });
  });

  describe('getByKey', () => {
    it('returns the setting on success', async () => {
      const setting = makeSetting({ key: 'my_key', value: 'v', value_type: 'string' });
      const chain = createChain({ data: setting, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getByKey('my_key');
      expect(result).toEqual(setting);
      expect(chain.eq).toHaveBeenCalledWith('key', 'my_key');
      expect(chain.single).toHaveBeenCalled();
    });

    it('returns null on PGRST116', async () => {
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getByKey('missing');
      expect(result).toBeNull();
    });

    it('throws on non-PGRST116 errors', async () => {
      const error = dbError('PGRST102', 'bad');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(settingsService.getByKey('k')).rejects.toEqual(error);
    });
  });

  describe('upsert', () => {
    it('calls supabase.from with upsert and returns the resulting row', async () => {
      const created = makeSetting({ key: 'site_title', value: 'My Site', value_type: 'string' });
      const chain = createChain({ data: created, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.upsert('site_title', 'My Site');

      expect(chain.upsert).toHaveBeenCalled();
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('serializes a boolean value to "true" with value_type "boolean"', async () => {
      const created = makeSetting({ key: 'flag', value: 'true', value_type: 'boolean' });
      const chain = createChain({ data: created, error: null });
      mockFrom.mockReturnValue(chain);

      await settingsService.upsert('flag', true);

      const upsertArg = (chain.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
      expect(upsertArg.value).toBe('true');
      expect(upsertArg.value_type).toBe('boolean');
    });

    it('serializes a boolean false to "false"', async () => {
      const created = makeSetting({ key: 'flag', value: 'false', value_type: 'boolean' });
      const chain = createChain({ data: created, error: null });
      mockFrom.mockReturnValue(chain);

      await settingsService.upsert('flag', false);

      const upsertArg = (chain.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
      expect(upsertArg.value).toBe('false');
      expect(upsertArg.value_type).toBe('boolean');
    });

    it('serializes a number to a string with value_type "integer"', async () => {
      const created = makeSetting({ key: 'n', value: '100', value_type: 'integer' });
      const chain = createChain({ data: created, error: null });
      mockFrom.mockReturnValue(chain);

      await settingsService.upsert('n', 100);

      const upsertArg = (chain.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
      expect(upsertArg.value).toBe('100');
      expect(upsertArg.value_type).toBe('integer');
    });

    it('serializes an object to JSON with value_type "json"', async () => {
      const created = makeSetting({ key: 'cfg', value: '{"x":1}', value_type: 'json' });
      const chain = createChain({ data: created, error: null });
      mockFrom.mockReturnValue(chain);

      await settingsService.upsert('cfg', { x: 1 });

      const upsertArg = (chain.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
      expect(upsertArg.value).toBe(JSON.stringify({ x: 1 }));
      expect(upsertArg.value_type).toBe('json');
    });

    it('passes the onConflict option', async () => {
      const created = makeSetting({ key: 'k', value: 'v' });
      const chain = createChain({ data: created, error: null });
      mockFrom.mockReturnValue(chain);

      await settingsService.upsert('k', 'v');

      expect(chain.upsert).toHaveBeenCalledWith(
        expect.any(Object),
        { onConflict: 'key' }
      );
    });

    it('throws on error', async () => {
      const error = dbError('23505', 'duplicate');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(settingsService.upsert('k', 'v')).rejects.toEqual(error);
    });
  });

  describe('getAll', () => {
    it('returns settings ordered by key ascending', async () => {
      const settings = [makeSetting({ key: 'a' }), makeSetting({ key: 'b' })];
      const chain = dataChain(settings);
      mockFrom.mockReturnValue(chain);

      const result = await settingsService.getAll();
      expect(result).toEqual(settings);
      expect(chain.order).toHaveBeenCalledWith('key', { ascending: true });
    });

    it('applies the isPublic filter', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await settingsService.getAll({ isPublic: true });
      expect(chain.eq).toHaveBeenCalledWith('is_public', true);
    });

    it('applies the category filter', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await settingsService.getAll({ category: 'general' });
      expect(chain.eq).toHaveBeenCalledWith('category', 'general');
    });

    it('throws on error', async () => {
      const error = dbError('PGRST102', 'bad');
      mockFrom.mockReturnValue(errorChain(error));

      await expect(settingsService.getAll()).rejects.toEqual(error);
    });
  });

  describe('delete', () => {
    it('succeeds (resolves void) when no error', async () => {
      const chain = createChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await expect(settingsService.delete('1')).resolves.toBeUndefined();
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('throws on error', async () => {
      const error = dbError('PGRST116', 'not found');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(settingsService.delete('1')).rejects.toEqual(error);
    });
  });
});
