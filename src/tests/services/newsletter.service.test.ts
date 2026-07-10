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
import { newsletterService } from '../../services/newsletter.service';

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
function countChain(count: number) {
  return createChain({ data: null, error: null, count });
}
function dbError(code: string, message: string) {
  return { code, message, details: '', hint: '' };
}

describe('newsletterService', () => {
  const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => dataChain([]));
  });

  describe('getByEmail', () => {
    it('lowercases the email before querying', async () => {
      const subscriber = { id: '1', email: 'user@example.com', is_active: true };
      const chain = createChain({ data: subscriber, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.getByEmail('USER@EXAMPLE.COM');

      expect(chain.eq).toHaveBeenCalledWith('email', 'user@example.com');
      expect(result).toEqual(subscriber);
    });

    it('returns null when PGRST116 (no row)', async () => {
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.getByEmail('nobody@example.com');
      expect(result).toBeNull();
    });

    it('throws on non-PGRST116 errors', async () => {
      const error = dbError('PGRST102', 'bad');
      const chain = createChain({ data: null, error });
      mockFrom.mockReturnValue(chain);

      await expect(newsletterService.getByEmail('x@example.com')).rejects.toEqual(error);
    });
  });

  describe('subscribe', () => {
    it('inserts a new subscriber when none exists and returns it', async () => {
      // First from() call: getByEmail -> not found (PGRST116)
      // Second from() call: insert -> returns the new row
      const notFoundChain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      const created = { id: '2', email: 'new@example.com', is_active: true };
      const insertChain = createChain({ data: created, error: null });
      mockFrom.mockReturnValueOnce(notFoundChain).mockReturnValueOnce(insertChain);

      const result = await newsletterService.subscribe({ email: 'New@Example.com', source: 'footer' });

      // getByEmail lowercases before eq; subscribe also lowercases the insert email.
      expect(notFoundChain.eq).toHaveBeenCalledWith('email', 'new@example.com');
      expect(insertChain.insert).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('returns the existing subscriber unchanged when already active', async () => {
      const existing = { id: '1', email: 'active@example.com', is_active: true, source: 'footer' };
      const existingChain = createChain({ data: existing, error: null });
      mockFrom.mockReturnValue(existingChain);

      const result = await newsletterService.subscribe({ email: 'Active@Example.com' });

      // Should NOT have called insert (only getByEmail -> from once).
      expect(existingChain.insert).not.toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledTimes(1);
      expect(result).toEqual(existing);
    });

    it('reactivates an inactive subscriber via update instead of insert', async () => {
      // getByEmail returns an inactive subscriber
      const existing = {
        id: '3',
        email: 'old@example.com',
        is_active: false,
        source: 'header',
      };
      const getByEmailChain = createChain({ data: existing, error: null });
      // The update call returns the reactivated row.
      const reactivated = { ...existing, is_active: true };
      const updateChain = createChain({ data: reactivated, error: null });
      mockFrom.mockReturnValueOnce(getByEmailChain).mockReturnValueOnce(updateChain);

      const result = await newsletterService.subscribe({ email: 'old@example.com', source: 'footer' });

      expect(getByEmailChain.eq).toHaveBeenCalledWith('email', 'old@example.com');
      expect(updateChain.update).toHaveBeenCalled();
      expect(updateChain.eq).toHaveBeenCalledWith('id', '3');
      expect(updateChain.insert).not.toHaveBeenCalled();
      expect(result).toEqual(reactivated);
      expect(result.is_active).toBe(true);
    });

    it('throws when the insert fails', async () => {
      const notFoundChain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      const error = dbError('23505', 'duplicate');
      const insertChain = createChain({ data: null, error });
      mockFrom.mockReturnValueOnce(notFoundChain).mockReturnValueOnce(insertChain);

      await expect(
        newsletterService.subscribe({ email: 'dup@example.com' })
      ).rejects.toEqual(error);
    });
  });

  describe('unsubscribe', () => {
    it('updates is_active=false and unsubscribed_at with the lowercased email', async () => {
      const chain = createChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await newsletterService.unsubscribe('USER@EXAMPLE.COM');

      expect(chain.update).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('email', 'user@example.com');
      // The update payload should set is_active to false.
      const updateArg = (chain.update as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
      expect(updateArg.is_active).toBe(false);
      expect(updateArg.unsubscribed_at).toBeDefined();
    });

    it('throws on error', async () => {
      const error = dbError('PGRST102', 'bad');
      mockFrom.mockReturnValue(errorChain(error));

      await expect(newsletterService.unsubscribe('x@example.com')).rejects.toEqual(error);
    });
  });

  describe('isSubscribed', () => {
    it('returns true when an active subscriber is found', async () => {
      const chain = createChain({
        data: { id: '1', email: 'a@example.com', is_active: true },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.isSubscribed('a@example.com');
      expect(result).toBe(true);
    });

    it('returns false when no subscriber is found (PGRST116)', async () => {
      const chain = createChain({ data: null, error: dbError('PGRST116', 'No rows') });
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.isSubscribed('nobody@example.com');
      expect(result).toBe(false);
    });

    it('returns false when the subscriber is inactive', async () => {
      const chain = createChain({
        data: { id: '2', email: 'inactive@example.com', is_active: false },
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.isSubscribed('inactive@example.com');
      expect(result).toBe(false);
    });
  });

  describe('getSubscriberCount', () => {
    it('returns the count of active subscribers', async () => {
      const chain = countChain(42);
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.getSubscriberCount();
      expect(result).toBe(42);
      // It should filter by is_active = true.
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('returns 0 when count is null', async () => {
      const chain = createChain({ data: null, error: null, count: null });
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.getSubscriberCount();
      expect(result).toBe(0);
    });

    it('throws on error', async () => {
      const error = dbError('PGRST102', 'bad');
      const chain = createChain({ data: null, error, count: null });
      mockFrom.mockReturnValue(chain);

      await expect(newsletterService.getSubscriberCount()).rejects.toEqual(error);
    });
  });

  describe('getAll', () => {
    it('returns an array of subscriptions ordered by subscribed_at desc', async () => {
      const subs = [
        { id: '1', email: 'a@example.com', is_active: true },
        { id: '2', email: 'b@example.com', is_active: true },
      ];
      const chain = dataChain(subs);
      mockFrom.mockReturnValue(chain);

      const result = await newsletterService.getAll();
      expect(result).toEqual(subs);
      expect(chain.order).toHaveBeenCalledWith('subscribed_at', { ascending: false });
    });

    it('applies the isActive filter', async () => {
      const chain = dataChain([]);
      mockFrom.mockReturnValue(chain);

      await newsletterService.getAll({ isActive: false });
      expect(chain.eq).toHaveBeenCalledWith('is_active', false);
    });
  });
});
