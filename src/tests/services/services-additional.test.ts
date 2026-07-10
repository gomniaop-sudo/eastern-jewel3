/**
 * Additional service tests to increase coverage
 * Covers: auth.service (updatePassword, updateProfile, changeEmail, verifyPassword)
 * gallery.service (getAllAdmin, getCount, getBySlug, create, update, delete, incrementViewCount)
 * settings.service (getValues, getPublicSettings, updateByKey, upsert)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Auth Service: additional coverage ───────────────────────────────────────
vi.mock('../../lib/supabase', () => {
  const auth = {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    upsert: vi.fn(),
  }
  const makeChain = (result: Record<string, unknown>) => {
    const c: Record<string, unknown> = {}
    const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'order', 'limit', 'range', 'single', 'head']
    methods.forEach(m => { c[m] = vi.fn(() => c) })
    c.single = vi.fn(() => Promise.resolve(result))
    c.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
    return c
  }
  const from = vi.fn((table: string) => {
    return makeChain({ data: [], error: null })
  })
  const storage = {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'test.jpg', fullPath: 'media/test.jpg' }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://cdn.example.com/media/test.jpg' } })),
      list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
      move: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      createBucket: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      getBucket: vi.fn(() => Promise.resolve({ data: { id: 'media' }, error: null })),
    })),
  }
  return {
    supabase: { auth, from, storage },
    isSupabaseConfigured: vi.fn(() => true),
  }
})

import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { authService } from '../../services/auth.service'
import { galleryService } from '../../services/gallery.service'
import { settingsService } from '../../services/settings.service'
import { mediaService } from '../../services/media.service'

const mockAuth = supabase.auth as {
  signInWithPassword: ReturnType<typeof vi.fn>
  signOut: ReturnType<typeof vi.fn>
  getUser: ReturnType<typeof vi.fn>
  getSession: ReturnType<typeof vi.fn>
  updateUser: ReturnType<typeof vi.fn>
}
const mockFrom = supabase.from as ReturnType<typeof vi.fn>
const mockIsConfigured = isSupabaseConfigured as ReturnType<typeof vi.fn>

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

beforeEach(() => {
  vi.clearAllMocks()
  mockIsConfigured.mockReturnValue(true)
})

// ─── Auth Service: uncovered methods ─────────────────────────────────────────
describe('authService — updatePassword', () => {
  it('calls supabase.auth.updateUser with password', async () => {
    mockAuth.updateUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const result = await authService.updatePassword('newpassword123')
    expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' })
    expect(result.error).toBeNull()
  })

  it('returns error object when not configured (never throws)', async () => {
    mockIsConfigured.mockReturnValue(false)
    const result = await authService.updatePassword('newpassword123')
    expect(mockAuth.updateUser).not.toHaveBeenCalled()
    expect(result.error).not.toBeNull()
    expect(result.error?.message).toContain('not configured')
  })
})

describe('authService — updateProfile', () => {
  it('calls supabase.auth.updateUser with profile data', async () => {
    mockAuth.updateUser.mockResolvedValue({ data: { user: { id: 'u1', user_metadata: { full_name: 'Jane' } } }, error: null })
    const result = await authService.updateProfile({ full_name: 'Jane' })
    expect(mockAuth.updateUser).toHaveBeenCalledWith({ data: { full_name: 'Jane' } })
    expect(result.error).toBeNull()
  })

  it('returns error when not configured', async () => {
    mockIsConfigured.mockReturnValue(false)
    const result = await authService.updateProfile({ full_name: 'Jane' })
    expect(result.error?.message).toContain('not configured')
  })
})

describe('authService — changeEmail', () => {
  it('calls supabase.auth.updateUser with new email', async () => {
    mockAuth.updateUser.mockResolvedValue({ data: { user: null }, error: null })
    const result = await authService.changeEmail('new@example.com')
    expect(mockAuth.updateUser).toHaveBeenCalledWith({ email: 'new@example.com' })
    expect(result.error).toBeNull()
  })

  it('returns error when not configured', async () => {
    mockIsConfigured.mockReturnValue(false)
    const result = await authService.changeEmail('new@example.com')
    expect(result.error?.message).toContain('not configured')
  })
})

describe('authService — verifyPassword', () => {
  it('re-signs in with current session email when session exists', async () => {
    const session = { user: { email: 'user@example.com' }, access_token: 'tok' }
    supabase.auth.getSession = vi.fn(() => Promise.resolve({ data: { session } }))
    supabase.auth.signInWithPassword = vi.fn(() => Promise.resolve({ error: null }))
    const result = await authService.verifyPassword('mypassword')
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'mypassword',
    })
    expect(result.error).toBeNull()
  })

  it('returns error when no active session', async () => {
    supabase.auth.getSession = vi.fn(() => Promise.resolve({ data: { session: null } }))
    const result = await authService.verifyPassword('mypassword')
    expect(result.error?.message).toBe('No active session')
  })

  it('returns error when not configured', async () => {
    mockIsConfigured.mockReturnValue(false)
    const result = await authService.verifyPassword('mypassword')
    expect(result.error?.message).toContain('not configured')
  })
})

// ─── Gallery Service: uncovered methods ──────────────────────────────────────
describe('galleryService — getAllAdmin', () => {
  it('calls supabase with admin query (no active filter by default)', async () => {
    const chain = makeChainWithResult({ data: [], error: null })
    mockFrom.mockReturnValue(chain)
    const result = await galleryService.getAllAdmin()
    expect(Array.isArray(result)).toBe(true)
  })

  it('includes inactive items when includeInactive=true', async () => {
    const chain = makeChainWithResult({ data: [{ id: '1', is_active: false }], error: null })
    mockFrom.mockReturnValue(chain)
    const result = await galleryService.getAllAdmin({ includeInactive: true })
    expect(result).toBeDefined()
  })

  it('throws on DB error', async () => {
    const chain = makeChainWithResult({ data: null, error: new Error('DB error') })
    mockFrom.mockReturnValue(chain)
    await expect(galleryService.getAllAdmin()).rejects.toThrow('DB error')
  })
})

describe('galleryService — getCount', () => {
  it('returns 0 when count is null', async () => {
    const chain = makeChainWithResult({ count: null, error: null })
    mockFrom.mockReturnValue(chain)
    const count = await galleryService.getCount()
    expect(count).toBe(0)
  })

  it('returns numeric count', async () => {
    const chain = makeChainWithResult({ count: 42, error: null })
    mockFrom.mockReturnValue(chain)
    const count = await galleryService.getCount()
    expect(count).toBe(42)
  })
})

describe('galleryService — getBySlug', () => {
  it('returns null on PGRST116', async () => {
    const chain = makeChainWithResult({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
    mockFrom.mockReturnValue(chain)
    const result = await galleryService.getBySlug('not-a-real-slug')
    expect(result).toBeNull()
  })

  it('throws on other DB errors', async () => {
    const chain = makeChainWithResult({ data: null, error: { code: '42501', message: 'Permission denied' } })
    mockFrom.mockReturnValue(chain)
    await expect(galleryService.getBySlug('slug')).rejects.toMatchObject({ code: '42501' })
  })
})

describe('galleryService — create / update / delete / incrementViewCount', () => {
  it('create returns the new item', async () => {
    const newItem = { id: 'new1', title: 'New Item', slug: 'new-item' }
    const chain = makeChainWithResult({ data: newItem, error: null })
    mockFrom.mockReturnValue(chain)
    const result = await galleryService.create({ title: 'New Item', slug: 'new-item', is_active: true } as never)
    expect(result).toEqual(newItem)
  })

  it('update returns the updated item', async () => {
    const updated = { id: 'u1', title: 'Updated' }
    const chain = makeChainWithResult({ data: updated, error: null })
    mockFrom.mockReturnValue(chain)
    const result = await galleryService.update('u1', { title: 'Updated' } as never)
    expect(result).toEqual(updated)
  })

  it('delete does not throw on success', async () => {
    const chain = makeChainWithResult({ error: null })
    mockFrom.mockReturnValue(chain)
    await expect(galleryService.delete('del1')).resolves.toBeUndefined()
  })

  it('incrementViewCount reads then updates view_count', async () => {
    const chain1 = makeChainWithResult({ data: { view_count: 5 }, error: null })
    const chain2 = makeChainWithResult({ error: null })
    mockFrom
      .mockReturnValueOnce(chain1) // first call: select view_count
      .mockReturnValueOnce(chain2) // second call: update
    await galleryService.incrementViewCount('item-id')
    expect(mockFrom).toHaveBeenCalledTimes(2)
  })
})

// ─── Settings Service: uncovered methods ─────────────────────────────────────
describe('settingsService — getValues', () => {
  it('returns a map with type-coerced values', async () => {
    const rows = [
      { key: 'count', value: '42', value_type: 'integer' },
      { key: 'flag', value: 'true', value_type: 'boolean' },
      { key: 'data', value: '{"a":1}', value_type: 'json' },
      { key: 'name', value: 'site', value_type: 'string' },
    ]
    const chain = makeChainWithResult({ data: rows, error: null })
    mockFrom.mockReturnValue(chain)
    const result = await settingsService.getValues(['count', 'flag', 'data', 'name'])
    expect(result['count']).toBe(42)
    expect(result['flag']).toBe(true)
    expect(result['data']).toEqual({ a: 1 })
    expect(result['name']).toBe('site')
  })

  it('handles null value by storing null', async () => {
    const chain = makeChainWithResult({ data: [{ key: 'nullable', value: null, value_type: 'string' }], error: null })
    mockFrom.mockReturnValue(chain)
    const result = await settingsService.getValues(['nullable'])
    expect(result['nullable']).toBeNull()
  })

  it('handles invalid JSON with fallback to string', async () => {
    const chain = makeChainWithResult({ data: [{ key: 'bad_json', value: '{invalid}', value_type: 'json' }], error: null })
    mockFrom.mockReturnValue(chain)
    const result = await settingsService.getValues(['bad_json'])
    expect(result['bad_json']).toBe('{invalid}')
  })
})

describe('settingsService — updateByKey', () => {
  it('throws when key not found', async () => {
    // getByKey returns null → should throw
    const chain = makeChainWithResult({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    mockFrom.mockReturnValue(chain)
    await expect(settingsService.updateByKey('missing_key', 'value')).rejects.toThrow('Setting not found: missing_key')
  })

  it('converts boolean values to "true"/"false" strings', async () => {
    const existingSetting = { id: 'set1', key: 'flag', value: 'false', value_type: 'boolean' }
    const updatedSetting = { ...existingSetting, value: 'true' }
    const getByKeyChain = makeChainWithResult({ data: existingSetting, error: null })
    const updateChain = makeChainWithResult({ data: updatedSetting, error: null })
    mockFrom
      .mockReturnValueOnce(getByKeyChain)
      .mockReturnValueOnce(updateChain)
    const result = await settingsService.updateByKey('flag', true)
    expect(result.value).toBe('true')
  })

  it('serializes objects to JSON', async () => {
    const existingSetting = { id: 'set1', key: 'config', value: '{}', value_type: 'json' }
    const getByKeyChain = makeChainWithResult({ data: existingSetting, error: null })
    const updateChain = makeChainWithResult({ data: { ...existingSetting, value: '{"key":"val"}' }, error: null })
    mockFrom
      .mockReturnValueOnce(getByKeyChain)
      .mockReturnValueOnce(updateChain)
    const result = await settingsService.updateByKey('config', { key: 'val' })
    expect(result.value).toBe('{"key":"val"}')
  })
})

describe('settingsService — upsert', () => {
  it('upserts string value', async () => {
    const chain = makeChainWithResult({ data: { key: 'site_name', value: 'My Site', value_type: 'string' }, error: null })
    mockFrom.mockReturnValue(chain)
    const result = await settingsService.upsert('site_name', 'My Site')
    expect(result.value).toBe('My Site')
  })

  it('upserts boolean value as "true"/"false"', async () => {
    const chain = makeChainWithResult({ data: { key: 'enabled', value: 'true', value_type: 'boolean' }, error: null })
    mockFrom.mockReturnValue(chain)
    const result = await settingsService.upsert('enabled', true)
    expect(result.value).toBe('true')
  })

  it('upserts integer value with correct type', async () => {
    const chain = makeChainWithResult({ data: { key: 'max_items', value: '100', value_type: 'integer' }, error: null })
    mockFrom.mockReturnValue(chain)
    const result = await settingsService.upsert('max_items', 100)
    expect(result.value).toBe('100')
  })

  it('upserts JSON object', async () => {
    const chain = makeChainWithResult({ data: { key: 'config', value: '{"theme":"dark"}', value_type: 'json' }, error: null })
    mockFrom.mockReturnValue(chain)
    const result = await settingsService.upsert('config', { theme: 'dark' })
    expect(result.value).toBe('{"theme":"dark"}')
  })
})

// ─── Media Service: uncovered upload/delete/list methods ─────────────────────
describe('mediaService.uploadImage', () => {
  const validFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' })

  it('returns not-configured error when supabase is not set up', async () => {
    mockIsConfigured.mockReturnValue(false)
    const result = await mediaService.uploadImage(validFile)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('NOT_CONFIGURED')
  })

  it('returns type validation error for invalid MIME type', async () => {
    mockIsConfigured.mockReturnValue(true)
    const badFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
    const result = await mediaService.uploadImage(badFile)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('INVALID_TYPE')
  })

  it('returns extension validation error for bad extension', async () => {
    mockIsConfigured.mockReturnValue(true)
    const badFile = new File(['data'], 'image.gif', { type: 'image/gif' })
    const result = await mediaService.uploadImage(badFile)
    expect(result.data).toBeNull()
    // gif is not in ALLOWED_MIME_TYPES → INVALID_TYPE
    expect(result.error?.code).toBe('INVALID_TYPE')
  })

  it('returns file-too-large error', async () => {
    mockIsConfigured.mockReturnValue(true)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.png', { type: 'image/png' })
    const result = await mediaService.uploadImage(largeFile)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('FILE_TOO_LARGE')
  })

  it('returns upload result on success', async () => {
    mockIsConfigured.mockReturnValue(true)
    const result = await mediaService.uploadImage(validFile, { folder: 'gallery' })
    // The mock storage.upload succeeds
    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data?.folder).toBe('gallery')
  })

  it('returns aborted error when signal is aborted', async () => {
    mockIsConfigured.mockReturnValue(true)
    const controller = new AbortController()
    controller.abort()
    const result = await mediaService.uploadImage(validFile, { signal: controller.signal })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('ABORTED')
  })
})

describe('mediaService.deleteImage', () => {
  it('returns null error on successful delete', async () => {
    const result = await mediaService.deleteImage('gallery/photo.jpg')
    expect(result.error).toBeNull()
  })

  it('returns not-configured error when supabase not set up', async () => {
    mockIsConfigured.mockReturnValue(false)
    const result = await mediaService.deleteImage('gallery/photo.jpg')
    expect(result.error?.code).toBe('NOT_CONFIGURED')
  })
})
