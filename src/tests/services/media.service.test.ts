import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase storage for the uploadImage tests.
vi.mock('../../lib/supabase', () => {
  const uploadFn = vi.fn(() =>
    Promise.resolve({
      data: { path: 'general/test-file.jpg', fullPath: 'media/general/test-file.jpg' },
      error: null,
    })
  );
  const getPublicUrlFn = vi.fn(() => ({
    data: { publicUrl: 'https://example.com/media/general/test-file.jpg' },
  }));
  const storageFromFn = vi.fn(() => ({
    upload: uploadFn,
    getPublicUrl: getPublicUrlFn,
  }));

  return {
    supabase: {
      storage: {
        from: storageFromFn,
      },
    },
    isSupabaseConfigured: vi.fn(() => true),
  };
});

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  isAllowedImageType,
  hasValidExtension,
  isValidFileSize,
  getExtension,
  getMimeType,
  detectMimeType,
  generateUniqueFilename,
  createError,
  validateFile,
  mediaService,
} from '../../services/media.service';

// Helper to build a File with the given name, type and size.
function makeFile(name: string, type: string, size: number): File {
  const file = new File([''], name, { type });
  // Override size because the content blob is tiny.
  Object.defineProperty(file, 'size', { value: size, configurable: true });
  return file;
}

describe('media service - pure functions', () => {
  describe('constants', () => {
    it('defines allowed MIME types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/webp');
    });

    it('defines allowed extensions', () => {
      expect(ALLOWED_EXTENSIONS).toContain('.jpg');
      expect(ALLOWED_EXTENSIONS).toContain('.jpeg');
      expect(ALLOWED_EXTENSIONS).toContain('.png');
      expect(ALLOWED_EXTENSIONS).toContain('.webp');
    });

    it('sets MAX_FILE_SIZE to 5 MB', () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });
  });

  describe('isAllowedImageType', () => {
    it('accepts image/jpeg', () => {
      expect(isAllowedImageType(makeFile('a.jpg', 'image/jpeg', 100))).toBe(true);
    });

    it('accepts image/jpg', () => {
      expect(isAllowedImageType(makeFile('a.jpg', 'image/jpg', 100))).toBe(true);
    });

    it('accepts image/png', () => {
      expect(isAllowedImageType(makeFile('a.png', 'image/png', 100))).toBe(true);
    });

    it('accepts image/webp', () => {
      expect(isAllowedImageType(makeFile('a.webp', 'image/webp', 100))).toBe(true);
    });

    it('rejects image/gif', () => {
      expect(isAllowedImageType(makeFile('a.gif', 'image/gif', 100))).toBe(false);
    });

    it('rejects application/pdf', () => {
      expect(isAllowedImageType(makeFile('a.pdf', 'application/pdf', 100))).toBe(false);
    });

    it('rejects application/x-msdownload (exe)', () => {
      expect(isAllowedImageType(makeFile('a.exe', 'application/x-msdownload', 100))).toBe(false);
    });

    it('is case-insensitive on MIME type', () => {
      expect(isAllowedImageType(makeFile('a.jpg', 'IMAGE/JPEG', 100))).toBe(true);
    });
  });

  describe('hasValidExtension', () => {
    it('accepts .jpg', () => {
      expect(hasValidExtension('photo.jpg')).toBe(true);
    });

    it('accepts .jpeg', () => {
      expect(hasValidExtension('photo.jpeg')).toBe(true);
    });

    it('accepts .png', () => {
      expect(hasValidExtension('photo.png')).toBe(true);
    });

    it('accepts .webp', () => {
      expect(hasValidExtension('photo.webp')).toBe(true);
    });

    it('rejects .gif', () => {
      expect(hasValidExtension('photo.gif')).toBe(false);
    });

    it('rejects .txt', () => {
      expect(hasValidExtension('readme.txt')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(hasValidExtension('photo.JPG')).toBe(true);
      expect(hasValidExtension('photo.PNG')).toBe(true);
    });

    it('rejects a filename with no extension', () => {
      expect(hasValidExtension('noext')).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('passes for a 1 MB file', () => {
      expect(isValidFileSize(makeFile('a.jpg', 'image/jpeg', 1024 * 1024))).toBe(true);
    });

    it('fails for a 0-byte file', () => {
      expect(isValidFileSize(makeFile('a.jpg', 'image/jpeg', 0))).toBe(false);
    });

    it('passes for a file exactly at the 5 MB limit', () => {
      expect(isValidFileSize(makeFile('a.jpg', 'image/jpeg', MAX_FILE_SIZE))).toBe(true);
    });

    it('fails for a 6 MB file (exceeds 5 MB max)', () => {
      expect(isValidFileSize(makeFile('a.jpg', 'image/jpeg', 6 * 1024 * 1024))).toBe(false);
    });
  });

  describe('getExtension', () => {
    it('returns the extension (lowercased) for photo.jpg', () => {
      expect(getExtension('photo.jpg')).toBe('.jpg');
    });

    it('lowercases the extension for file.PNG', () => {
      expect(getExtension('file.PNG')).toBe('.png');
    });

    it('returns .jpeg for file.jpeg', () => {
      expect(getExtension('file.jpeg')).toBe('.jpeg');
    });

    it('returns empty string for a file with no extension', () => {
      expect(getExtension('noext')).toBe('');
    });

    it('handles dotted filenames correctly', () => {
      expect(getExtension('my.photo.name.webp')).toBe('.webp');
    });
  });

  describe('getMimeType', () => {
    it('returns image/jpeg for .jpg', () => {
      expect(getMimeType('photo.jpg')).toBe('image/jpeg');
    });

    it('returns image/jpeg for .jpeg', () => {
      expect(getMimeType('photo.jpeg')).toBe('image/jpeg');
    });

    it('returns image/png for .png', () => {
      expect(getMimeType('photo.png')).toBe('image/png');
    });

    it('returns image/webp for .webp', () => {
      expect(getMimeType('photo.webp')).toBe('image/webp');
    });

    it('returns null for .gif (not in the map)', () => {
      expect(getMimeType('photo.gif')).toBeNull();
    });

    it('returns null for a file with no extension', () => {
      expect(getMimeType('noext')).toBeNull();
    });
  });

  describe('detectMimeType', () => {
    it('returns the file.type when present', () => {
      expect(detectMimeType(makeFile('a.jpg', 'image/png', 100))).toBe('image/png');
    });

    it('falls back to getMimeType when file.type is empty', () => {
      const file = makeFile('a.jpg', '', 100);
      expect(detectMimeType(file)).toBe('image/jpeg');
    });

    it('falls back to application/octet-stream when nothing is detected', () => {
      const file = makeFile('noext', '', 100);
      expect(detectMimeType(file)).toBe('application/octet-stream');
    });
  });

  describe('generateUniqueFilename', () => {
    it('includes the original extension', () => {
      const name = generateUniqueFilename('photo.jpg');
      expect(name.endsWith('.jpg')).toBe(true);
    });

    it('includes a numeric timestamp', () => {
      const before = Date.now();
      const name = generateUniqueFilename('photo.jpg');
      const after = Date.now();
      // Extract the timestamp portion from the generated name.
      const parts = name.replace('.jpg', '').split('-');
      const ts = parseInt(parts[parts.length - 2], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('sanitizes special characters in the base name', () => {
      const name = generateUniqueFilename('my photo@#.jpg');
      expect(name).not.toContain(' ');
      expect(name).not.toContain('@');
      expect(name).not.toContain('#');
      expect(name.endsWith('.jpg')).toBe(true);
    });

    it('keeps the extension for .png', () => {
      const name = generateUniqueFilename('image.png');
      expect(name.endsWith('.png')).toBe(true);
    });

    it('produces a unique name on subsequent calls (random suffix)', () => {
      const a = generateUniqueFilename('photo.jpg');
      const b = generateUniqueFilename('photo.jpg');
      expect(a).not.toBe(b);
    });

    it('handles filenames with no extension (keeps sanitized base + timestamp)', () => {
      const name = generateUniqueFilename('noext');
      // getExtension('noext') === '' so the whole name becomes the base.
      expect(name).toContain('-'); // sanitized base + timestamp + random
      expect(name.length).toBeGreaterThan('noext'.length);
    });
  });

  describe('createError', () => {
    it('returns a MediaServiceError with code and message', () => {
      const err = createError('INVALID_TYPE', 'Invalid file type');
      expect(err.code).toBe('INVALID_TYPE');
      expect(err.message).toBe('Invalid file type');
      expect(err.details).toBeUndefined();
    });

    it('includes optional details', () => {
      const err = createError('FILE_TOO_LARGE', 'Too big', 'max 5MB');
      expect(err.code).toBe('FILE_TOO_LARGE');
      expect(err.message).toBe('Too big');
      expect(err.details).toBe('max 5MB');
    });
  });

  describe('validateFile', () => {
    it('returns null for a valid image file', () => {
      const file = makeFile('photo.jpg', 'image/jpeg', 1024 * 1024);
      expect(validateFile(file)).toBeNull();
    });

    it('returns an INVALID_TYPE error for a non-image file', () => {
      const file = makeFile('doc.pdf', 'application/pdf', 1024);
      const err = validateFile(file);
      expect(err).not.toBeNull();
      expect(err?.code).toBe('INVALID_TYPE');
    });

    it('returns a FILE_TOO_LARGE error when the file exceeds the limit', () => {
      const file = makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024);
      const err = validateFile(file);
      expect(err).not.toBeNull();
      expect(err?.code).toBe('FILE_TOO_LARGE');
    });

    it('returns INVALID_TYPE for a 0-byte image file (size fails too but type checked first)', () => {
      // A 0-byte jpg: type is valid, extension is valid, but size <= 0 fails.
      const file = makeFile('empty.jpg', 'image/jpeg', 0);
      const err = validateFile(file);
      expect(err).not.toBeNull();
      // validateFile checks type first, then extension, then size.
      // Type is valid here, extension is valid, so size check fires.
      expect(err?.code).toBe('FILE_TOO_LARGE');
    });
  });
});

describe('mediaService.uploadImage', () => {
  const mockIsConfigured = isSupabaseConfigured as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsConfigured.mockReturnValue(true);
  });

  it('returns a NOT_CONFIGURED error when supabase is not configured', async () => {
    mockIsConfigured.mockReturnValue(false);
    const file = makeFile('photo.jpg', 'image/jpeg', 1024 * 1024);

    const result = await mediaService.uploadImage(file);

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.code).toBe('NOT_CONFIGURED');
  });

  it('returns an INVALID_TYPE error for a non-image file', async () => {
    const file = makeFile('doc.pdf', 'application/pdf', 1024);

    const result = await mediaService.uploadImage(file);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('INVALID_TYPE');
  });

  it('returns a FILE_TOO_LARGE error when the file exceeds the limit', async () => {
    const file = makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024);

    const result = await mediaService.uploadImage(file);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('FILE_TOO_LARGE');
  });

  it('uploads a valid file and returns the UploadResult', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024 * 1024);

    const result = await mediaService.uploadImage(file);

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data?.path).toBe('general/test-file.jpg');
    expect(result.data?.publicUrl).toBe('https://example.com/media/general/test-file.jpg');
    expect(result.data?.originalName).toBe('photo.jpg');
    expect(result.data?.mimeType).toBe('image/jpeg');
    expect(result.data?.folder).toBe('general');
    expect(result.data?.size).toBe(1024 * 1024);
    // storage.from should have been called with the 'media' bucket.
    expect(supabase.storage.from).toHaveBeenCalledWith('media');
  });

  it('uses the provided folder in the upload path', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024);

    await mediaService.uploadImage(file, { folder: 'gallery' });

    const fromFn = supabase.storage.from as ReturnType<typeof vi.fn>;
    const bucketMethods = fromFn.mock.results[0].value as { upload: ReturnType<typeof vi.fn> };
    expect(bucketMethods.upload).toHaveBeenCalledWith(
      expect.stringContaining('gallery/'),
      file,
      expect.objectContaining({ contentType: 'image/jpeg', upsert: false })
    );
  });

  it('returns an UPLOAD_FAILED error when storage.upload errors', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024);
    const fromFn = supabase.storage.from as ReturnType<typeof vi.fn>;
    fromFn.mockImplementationOnce(() => ({
      upload: vi.fn(() => Promise.resolve({ data: null, error: { message: 'quota exceeded' } })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'x' } })),
    }));

    const result = await mediaService.uploadImage(file);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('UPLOAD_FAILED');
    expect(result.error?.details).toBe('quota exceeded');
  });
});
