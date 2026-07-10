import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase with a factory that lets each test configure the chain result.
vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: { from: mockFrom },
    isSupabaseConfigured: vi.fn(() => true),
  };
});

import { supabase } from '../../lib/supabase';
import { galleryService, galleryCategoriesService } from '../../services/gallery.service';

// ---------------------------------------------------------------------------
// Helper: build a Supabase v2-compatible query chain.
// The chain is both a thenable (awaitable via `await query`) and exposes
// `.single()` / `.maybeSingle()` which return real Promises. This mirrors the
// real supabase-js query builder where the builder object itself is awaitable.
// ---------------------------------------------------------------------------
type ChainResult = { data: unknown; error: unknown; count?: number | null };

function createChain(result: ChainResult) {
  const chain: Record<string, unknown> = {};

  const methods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'ilike', 'in', 'order', 'limit', 'range',
    'head', 'count',
  ];

  for (const method of methods) {
    chain[method] = vi.fn(() => chain);
  }

  // `.single()` / `.maybeSingle()` resolve to a Promise (not the chain).
  chain.single = vi.fn(() => Promise.resolve(result));
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));

  // Make the chain itself awaitable (Supabase v2 builders are thenable).
  chain.then = (resolve: (value: ChainResult) => unknown, reject?: (reason?: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  chain.catch = (reject: (reason?: unknown) => unknown) =>
    Promise.resolve(result).catch(reject);

  return chain;
}

// Convenience builders ---------------------------------------------------------
function dataChain(data: unknown) {
  return createChain({ data, error: null });
}
function errorChain(error: unknown) {
  return createChain({ data: null, error });
}
function countChain(count: number) {
  return createChain({ data: null, error: null, count });
}

function dbError(code: string, message: string) {
  return { code, message, details: '', hint: '' };
}

describe('galleryService', () => {
  const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: each from() call returns a fresh empty-data chain.
    mockFrom.mockImplementation(() => dataChain([]));
  });

  describe('getAll', () => {
    it('calls supabase.from with the gallery_items table', async () => {
      await galleryService.getAll();
      expect(mockFrom).toHaveBeenCalledWith('gallery_items');
    });

    it('resolves with the data array on success', async () => {
      const items = [
        { id: '1', title: 'Item A', categories: null },
        { id: '2', title: 'Item B', categories: null },
      ];
      mockFrom.mockReturnValue(dataChain(items));

      const result = await galleryService.getAll();
      expect(result).toEqual(items);
      expect(result).toHaveLength(2);
    });

    it('returns the raw data (null) when data is null (no coercion)', async () => {
      mockFrom.mockReturnValue(dataChain(null));

      const result = await galleryService.getAll();
      // The service casts data without coercing null -> [].
      expect(result).toBeNull();
    });

    it('throws when the query returns an error', async () => {
      const error = dbError('PGRST102', 'Invalid query');
      mockFrom.mockReturnValue(errorChain(error));

      await expect(galleryService.getAll()).rejects.toEqual(error);
    });

    it('applies the isPremium filter via .eq', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await galleryService.getAll({ isPremium: true });

      expect(chain.eq).toHaveBeenCalledWith('is_premium', true);
    });

    it('applies the isFeatured filter via .eq', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await galleryService.getAll({ isFeatured: true });

      expect(chain.eq).toHaveBeenCalledWith('is_featured', true);
    });

    it('defaults isActive to true when not specified', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await galleryService.getAll();

      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('applies the category filter via .eq on categories.slug', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await galleryService.getAll({ category: 'nature' });

      expect(chain.eq).toHaveBeenCalledWith('categories.slug', 'nature');
    });

    it('skips the category filter when category is "all"', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await galleryService.getAll({ category: 'all' });

      expect(chain.eq).not.toHaveBeenCalledWith('categories.slug', 'all');
    });

    it('applies a limit filter via .limit', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await galleryService.getAll({ limit: 5 });

      expect(chain.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('getById', () => {
    it('returns null when the error code is PGRST116 (not found)', async () => {
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await galleryService.getById('abc');
      expect(result).toBeNull();
      expect(chain.single).toHaveBeenCalled();
    });

    it('throws on non-PGRST116 errors', async () => {
      const error = dbError('PGRST103', 'Something else');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(galleryService.getById('abc')).rejects.toEqual(error);
    });

    it('returns the data object on success', async () => {
      const item = { id: '1', title: 'My Item', categories: { id: 'c1' } };
      const chain = createChain({ data: item, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await galleryService.getById('1');
      expect(result).toEqual(item);
    });

    it('chains .eq("id", id) before .single()', async () => {
      const chain = createChain({ data: { id: '1' }, error: null });
      mockFrom.mockReturnValue(chain);

      await galleryService.getById('42');
      expect(chain.eq).toHaveBeenCalledWith('id', '42');
      expect(chain.single).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('calls insert and returns the created data', async () => {
      const newItem = { id: '1', title: 'New', slug: 'new', image_url: 'x.jpg' };
      const chain = createChain({ data: newItem, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await galleryService.create({
        title: 'New',
        slug: 'new',
        image_url: 'x.jpg',
      });

      expect(chain.insert).toHaveBeenCalled();
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(newItem);
    });

    it('throws on error', async () => {
      const error = dbError('23505', 'duplicate key');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(
        galleryService.create({ title: 'Dup', slug: 'dup', image_url: 'x.jpg' })
      ).rejects.toEqual(error);
    });
  });

  describe('update', () => {
    it('returns the updated data on success', async () => {
      const updated = { id: '1', title: 'Updated', slug: 'x', image_url: 'y.jpg' };
      const chain = createChain({ data: updated, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await galleryService.update('1', { title: 'Updated' });

      expect(chain.update).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(updated);
    });

    it('throws on error', async () => {
      const error = dbError('PGRST116', 'not found');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(galleryService.update('1', { title: 'x' })).rejects.toEqual(error);
    });
  });

  describe('delete', () => {
    it('succeeds (resolves void) when no error', async () => {
      const chain = createChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await expect(galleryService.delete('1')).resolves.toBeUndefined();
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('throws on error', async () => {
      const error = dbError('PGRST116', 'not found');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(galleryService.delete('1')).rejects.toEqual(error);
    });
  });

  describe('getCount', () => {
    it('returns the count from the query', async () => {
      const chain = countChain(7);
      mockFrom.mockReturnValue(chain);

      const result = await galleryService.getCount();
      expect(result).toBe(7);
    });

    it('returns 0 when count is null', async () => {
      const chain = createChain({ data: null, error: null, count: null });
      mockFrom.mockReturnValue(chain);

      const result = await galleryService.getCount();
      expect(result).toBe(0);
    });

    it('throws on error', async () => {
      const error = dbError('PGRST102', 'bad');
      const chain = createChain({ data: null, error, count: null });
      mockFrom.mockReturnValue(chain);

      await expect(galleryService.getCount()).rejects.toEqual(error);
    });
  });
});

describe('galleryCategoriesService', () => {
  const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => dataChain([]));
  });

  describe('getAll', () => {
    it('queries the categories table and returns data', async () => {
      const categories = [
        { id: 'c1', name: 'Nature', slug: 'nature', type: 'gallery' },
        { id: 'c2', name: 'Urban', slug: 'urban', type: 'both' },
      ];
      const chain = dataChain(categories);
      mockFrom.mockReturnValue(chain);

      const result = await galleryCategoriesService.getAll();
      expect(mockFrom).toHaveBeenCalledWith('categories');
      expect(result).toEqual(categories);
    });

    it('filters by type in ["gallery","both"] and is_active=true', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await galleryCategoriesService.getAll();

      expect(chain.in).toHaveBeenCalledWith('type', ['gallery', 'both']);
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
      expect(chain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    });

    it('throws on error', async () => {
      const error = dbError('PGRST102', 'bad');
      mockFrom.mockReturnValue(errorChain(error));

      await expect(galleryCategoriesService.getAll()).rejects.toEqual(error);
    });
  });

  describe('getById', () => {
    it('returns null when the error code is PGRST116', async () => {
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await galleryCategoriesService.getById('missing');
      expect(result).toBeNull();
    });

    it('returns the category on success', async () => {
      const category = { id: 'c1', name: 'Nature', slug: 'nature', type: 'gallery' };
      const chain = createChain({ data: category, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await galleryCategoriesService.getById('c1');
      expect(result).toEqual(category);
    });

    it('throws on non-PGRST116 errors', async () => {
      const error = dbError('PGRST103', 'bad');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(galleryCategoriesService.getById('c1')).rejects.toEqual(error);
    });
  });
});
