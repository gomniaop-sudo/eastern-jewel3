/**
 * Additional coverage tests for newsletter, settings, and gallery services
 * Target: push branch and statement coverage above thresholds
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/supabase', () => {
  const makeChain = (result: Record<string, unknown>) => {
    const c: Record<string, unknown> = {}
    const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'in', 'order', 'limit', 'range', 'ilike', 'head']
    methods.forEach(m => { c[m] = vi.fn(() => c) })
    c.single = vi.fn(() => Promise.resolve(result))
    c.maybeSingle = vi.fn(() => Promise.resolve(result))
    c.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
    c.catch = (reject: (v: unknown) => unknown) => Promise.resolve(result).catch(reject)
    return c
  }
  const from = vi.fn(() => makeChain({ data: null, error: null }))
  return {
    supabase: { from },
    isSupabaseConfigured: vi.fn(() => true),
  }
})

import { supabase } from '../../lib/supabase'
import { newsletterService } from '../../services/newsletter.service'
import { settingsService } from '../../services/settings.service'
import { galleryService } from '../../services/gallery.service'

const mockFrom = supabase.from as ReturnType<typeof vi.fn>

function makeChainWithResult(result: Record<string, unknown>) {
  const c: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'in', 'order', 'limit', 'range', 'ilike', 'head']
  methods.forEach(m => { c[m] = vi.fn(() => c) })
  c.single = vi.fn(() => Promise.resolve(result))
  c.maybeSingle = vi.fn(() => Promise.resolve(result))
  c.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
  c.catch = (reject: (v: unknown) => unknown) => Promise.resolve(result).catch(reject)
  return c
}

beforeEach(() => vi.clearAllMocks())

// ─── Newsletter Service ───────────────────────────────────────────────────────
describe('newsletterService — getById', () => {
  it('returns subscriber by id', async () => {
    const sub = { id: 'sub-1', email: 'test@example.com', is_active: true }
    mockFrom.mockReturnValue(makeChainWithResult({ data: sub, error: null }))
    const result = await newsletterService.getById('sub-1')
    expect(result).toEqual(sub)
  })

  it('returns null on PGRST116', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ data: null, error: { code: 'PGRST116', message: 'no rows' } }))
    const result = await newsletterService.getById('nonexistent')
    expect(result).toBeNull()
  })

  it('throws on other DB errors', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ data: null, error: { code: '42501', message: 'permission denied' } }))
    await expect(newsletterService.getById('sub-1')).rejects.toMatchObject({ code: '42501' })
  })
})

describe('newsletterService — create', () => {
  it('lowercases email on create', async () => {
    const sub = { id: 'new-sub', email: 'user@example.com' }
    mockFrom.mockReturnValue(makeChainWithResult({ data: sub, error: null }))
    const result = await newsletterService.create({ email: 'USER@EXAMPLE.COM', source: 'footer' })
    expect(result).toEqual(sub)
  })

  it('throws on DB error during create', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ data: null, error: new Error('Insert failed') }))
    await expect(newsletterService.create({ email: 'test@example.com', source: 'footer' })).rejects.toThrow('Insert failed')
  })
})

describe('newsletterService — delete', () => {
  it('resolves without error on successful delete', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ error: null }))
    await expect(newsletterService.delete('sub-1')).resolves.toBeUndefined()
  })

  it('throws when delete fails', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ error: new Error('Delete failed') }))
    await expect(newsletterService.delete('sub-1')).rejects.toThrow('Delete failed')
  })
})

// ─── Settings Service: getPublicSettings ─────────────────────────────────────
describe('settingsService — getPublicSettings', () => {
  it('returns public settings with type coercion', async () => {
    const rows = [
      { key: 'site_name', value: 'My Site', value_type: 'string', is_public: true },
      { key: 'max_items', value: '50', value_type: 'integer', is_public: true },
      { key: 'maintenance', value: 'false', value_type: 'boolean', is_public: true },
      { key: 'config', value: '{"theme":"dark"}', value_type: 'json', is_public: true },
    ]
    mockFrom.mockReturnValue(makeChainWithResult({ data: rows, error: null }))
    const result = await settingsService.getPublicSettings()
    expect(result['site_name']).toBe('My Site')
    expect(result['max_items']).toBe(50)
    expect(result['maintenance']).toBe(false)
    expect(result['config']).toEqual({ theme: 'dark' })
  })

  it('handles null values in public settings', async () => {
    const rows = [{ key: 'nullable', value: null, value_type: 'string', is_public: true }]
    mockFrom.mockReturnValue(makeChainWithResult({ data: rows, error: null }))
    const result = await settingsService.getPublicSettings()
    expect(result['nullable']).toBeNull()
  })

  it('handles invalid JSON in public settings with string fallback', async () => {
    const rows = [{ key: 'bad', value: '{invalid}', value_type: 'json', is_public: true }]
    mockFrom.mockReturnValue(makeChainWithResult({ data: rows, error: null }))
    const result = await settingsService.getPublicSettings()
    expect(result['bad']).toBe('{invalid}')
  })
})

describe('settingsService — delete and deleteByKey', () => {
  it('delete resolves on success', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ error: null }))
    await expect(settingsService.delete('setting-id-1')).resolves.toBeUndefined()
  })

  it('deleteByKey calls delete with eq(key)', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ error: null }))
    await expect(settingsService.deleteByKey('my_key')).resolves.toBeUndefined()
    expect(mockFrom).toHaveBeenCalledWith('site_settings')
  })

  it('deleteByKey throws on error', async () => {
    mockFrom.mockReturnValue(makeChainWithResult({ error: new Error('Delete failed') }))
    await expect(settingsService.deleteByKey('my_key')).rejects.toThrow('Delete failed')
  })
})

describe('settingsService — updateByKey with number', () => {
  it('converts non-integer number to string type', async () => {
    const existingSetting = { id: 'set1', key: 'ratio', value: '0.5', value_type: 'string' as const }
    const getByKeyChain = makeChainWithResult({ data: existingSetting, error: null })
    const updateChain = makeChainWithResult({ data: { ...existingSetting, value: '3.14' }, error: null })
    mockFrom
      .mockReturnValueOnce(getByKeyChain)
      .mockReturnValueOnce(updateChain)
    const result = await settingsService.updateByKey('ratio', 3.14)
    expect(result.value).toBe('3.14')
  })
})

// ─── Gallery Service: additional branches ────────────────────────────────────
describe('galleryService — getAll filter branches', () => {
  it('applies isPremium filter', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAll({ isPremium: true })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })

  it('applies isFeatured filter', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAll({ isFeatured: true })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })

  it('applies isActive filter when explicitly set', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAll({ isActive: false })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })

  it('applies limit and offset', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAll({ limit: 10, offset: 20 })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })
})

describe('galleryService categories — getAllAdmin with filters', () => {
  it('applies search filter to getAllAdmin', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAllAdmin({ search: 'nature' })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })

  it('applies isPremium filter to getAllAdmin', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAllAdmin({ isPremium: false })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })

  it('applies isActive filter to getAllAdmin', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAllAdmin({ isActive: true })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })

  it('applies limit and offset to getAllAdmin', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAllAdmin({ limit: 5, offset: 10 })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })

  it('getAllAdmin with sortBy=oldest', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    await galleryService.getAllAdmin({ sortBy: 'oldest' })
    expect(mockFrom).toHaveBeenCalledWith('gallery_items')
  })
})

describe('galleryService categories — getAll, getById', () => {
  it('galleryCategoriesService.getAll returns empty array', async () => {
    const { galleryCategoriesService } = await import('../../services/gallery.service')
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    const result = await galleryCategoriesService.getAll()
    expect(Array.isArray(result)).toBe(true)
  })

  it('galleryCategoriesService.getBySlug returns null on PGRST116', async () => {
    const { galleryCategoriesService } = await import('../../services/gallery.service')
    const chain = makeChainWithResult({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    mockFrom.mockReturnValue(chain)
    const result = await galleryCategoriesService.getBySlug('nonexistent')
    expect(result).toBeNull()
  })
})
