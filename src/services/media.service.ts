/**
 * Enterprise Media Service - Supabase Storage
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type MediaFolder = 'gallery' | 'journal' | 'avatars' | 'seo' | 'general';

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  folder: MediaFolder;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MediaFile {
  name: string;
  id: string;
  fullPath: string;
  publicUrl: string;
  size: number;
  mimeType: string;
  createdAt: string;
  lastModified: string;
  folder: MediaFolder;
  width?: number;
  height?: number;
}

export interface MediaServiceError {
  code: string;
  message: string;
  details?: string;
}

export interface UploadOptions {
  folder?: MediaFolder;
  filename?: string;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

export interface ListOptions {
  folder?: MediaFolder;
  limit?: number;
  offset?: number;
  sortBy?: { column: string; order: 'asc' | 'desc' };
}

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const STORAGE_BUCKET = 'media';

const EXTENSION_MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function isAllowedImageType(file: File): boolean {
  const mimeType = file.type.toLowerCase();
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function hasValidExtension(filename: string): boolean {
  const ext = getExtension(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function isValidFileSize(file: File): boolean {
  return file.size > 0 && file.size <= MAX_FILE_SIZE;
}

export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
}

export function getMimeType(filename: string): string | null {
  const ext = getExtension(filename);
  return EXTENSION_MIME_MAP[ext] || null;
}

export function detectMimeType(file: File): string {
  if (file.type) return file.type;
  const detected = getMimeType(file.name);
  return detected || 'application/octet-stream';
}

export function generateUniqueFilename(originalName: string): string {
  const ext = getExtension(originalName);
  const baseName = originalName.slice(0, originalName.length - ext.length);
  const sanitizedBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${sanitizedBase}-${timestamp}-${random}${ext}`;
}

export function createError(code: string, message: string, details?: string): MediaServiceError {
  return { code, message, details };
}

export function getPublicUrl(path: string): string {
  if (!isSupabaseConfigured()) return '';
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function validateFile(file: File): MediaServiceError | null {
  if (!isAllowedImageType(file)) {
    return createError(
      'INVALID_TYPE',
      'Invalid file type',
      `Only image files are allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  if (!hasValidExtension(file.name)) {
    return createError(
      'INVALID_EXTENSION',
      'Invalid file extension',
      `File must have one of these extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  if (!isValidFileSize(file)) {
    return createError(
      'FILE_TOO_LARGE',
      'File is too large',
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`
    );
  }

  return null;
}

export const mediaService = {
  async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<{ data: UploadResult | null; error: MediaServiceError | null }> {
    const { folder = 'general', filename, signal } = options;

    if (!isSupabaseConfigured()) {
      return { data: null, error: createError('NOT_CONFIGURED', 'Supabase is not configured') };
    }

    const validationError = validateFile(file);
    if (validationError) {
      return { data: null, error: validationError };
    }

    const mimeType = detectMimeType(file);
    const finalFilename = filename || generateUniqueFilename(file.name);
    const path = `${folder}/${finalFilename}`;

    if (signal?.aborted) {
      return { data: null, error: createError('ABORTED', 'Upload was cancelled') };
    }

    try {
      const result = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          contentType: mimeType,
          upsert: false,
        });

      const uploadData = result.data;
      const uploadError = result.error;

      if (uploadError) {
        return { data: null, error: createError('UPLOAD_FAILED', 'Failed to upload file', uploadError.message) };
      }

      if (!uploadData) {
        return { data: null, error: createError('NO_DATA', 'No data returned from upload') };
      }

      const publicUrl = getPublicUrl(uploadData.path);

      return {
        data: {
          path: uploadData.path,
          fullPath: uploadData.fullPath || uploadData.path,
          publicUrl,
          filename: finalFilename,
          originalName: file.name,
          size: file.size,
          mimeType,
          folder,
        },
        error: null,
      };
    } catch (err) {
      if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) {
        return { data: null, error: createError('ABORTED', 'Upload was cancelled') };
      }
      return {
        data: null,
        error: createError('UPLOAD_ERROR', 'An error occurred during upload', err instanceof Error ? err.message : String(err)),
      };
    }
  },

  async uploadImages(
    files: File[],
    options: UploadOptions = {}
  ): Promise<{ data: UploadResult[]; errors: { file: string; error: MediaServiceError }[] }> {
    const results: UploadResult[] = [];
    const errors: { file: string; error: MediaServiceError }[] = [];

    for (let i = 0; i < files.length; i++) {
      if (options.signal?.aborted) {
        break;
      }

      const file = files[i];
      const progressWrapper = options.onProgress
        ? (progress: UploadProgress) => {
            const totalSize = files.reduce((sum, f) => sum + f.size, 0);
            const completedSize = results.reduce((sum, r) => sum + r.size, 0);
            options.onProgress!({
              loaded: completedSize + progress.loaded,
              total: totalSize,
              percentage: Math.round(((completedSize + progress.loaded) / totalSize) * 100),
            });
          }
        : undefined;

      const result = await this.uploadImage(file, {
        ...options,
        onProgress: progressWrapper,
      });

      if (result.data) {
        results.push(result.data);
      } else if (result.error) {
        errors.push({ file: file.name, error: result.error });
      }
    }

    return { data: results, errors };
  },

  async deleteImage(
    path: string
  ): Promise<{ success: boolean; error: MediaServiceError | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: createError('NOT_CONFIGURED', 'Supabase is not configured') };
    }

    try {
      const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

      if (error) {
        return { success: false, error: createError('DELETE_FAILED', 'Failed to delete file', error.message) };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: createError('DELETE_ERROR', 'An error occurred during deletion', err instanceof Error ? err.message : String(err)),
      };
    }
  },

  async deleteImages(
    paths: string[]
  ): Promise<{ success: boolean; errors: { path: string; error: MediaServiceError }[] }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        errors: [{ path: '', error: createError('NOT_CONFIGURED', 'Supabase is not configured') }],
      };
    }

    try {
      const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);

      if (error) {
        return {
          success: false,
          errors: [{ path: '', error: createError('DELETE_FAILED', 'Failed to delete files', error.message) }],
        };
      }

      return { success: true, errors: [] };
    } catch (err) {
      return {
        success: false,
        errors: [{ path: '', error: createError('DELETE_ERROR', 'An error occurred', err instanceof Error ? err.message : String(err)) }],
      };
    }
  },

  async listImages(
    options: ListOptions = {}
  ): Promise<{ data: MediaFile[] | null; error: MediaServiceError | null }> {
    const { folder, limit = 100, offset = 0, sortBy } = options;

    if (!isSupabaseConfigured()) {
      return { data: null, error: createError('NOT_CONFIGURED', 'Supabase is not configured') };
    }

    try {
      const path = folder || '';
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(path, {
        limit,
        offset,
        sortBy: sortBy || { column: 'created_at', order: 'desc' },
      });

      if (error) {
        return { data: null, error: createError('LIST_FAILED', 'Failed to list files', error.message) };
      }

      const imageFiles: MediaFile[] = data
        .filter((item) => item.id && !item.id.includes('.emptyFolderPlaceholder'))
        .filter((item) => {
          const ext = getExtension(item.name);
          return ALLOWED_EXTENSIONS.includes(ext);
        })
        .map((item) => {
          const fullPath = folder ? `${folder}/${item.name}` : item.name;
          const folderFromPath: MediaFolder = (folder as MediaFolder) || 'general';

          return {
            name: item.name,
            id: item.id || '',
            fullPath,
            publicUrl: getPublicUrl(fullPath),
            size: item.metadata?.size || 0,
            mimeType: getMimeType(item.name) || 'image/jpeg',
            createdAt: item.created_at || new Date().toISOString(),
            lastModified: item.updated_at || item.created_at || new Date().toISOString(),
            folder: folderFromPath,
          };
        });

      return { data: imageFiles, error: null };
    } catch (err) {
      return {
        data: null,
        error: createError('LIST_ERROR', 'An error occurred while listing files', err instanceof Error ? err.message : String(err)),
      };
    }
  },

  async moveImage(
    fromPath: string,
    toPath: string
  ): Promise<{ success: boolean; error: MediaServiceError | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: createError('NOT_CONFIGURED', 'Supabase is not configured') };
    }

    try {
      const { error } = await supabase.storage.from(STORAGE_BUCKET).move(fromPath, toPath);

      if (error) {
        return { success: false, error: createError('MOVE_FAILED', 'Failed to move file', error.message) };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: createError('MOVE_ERROR', 'An error occurred while moving file', err instanceof Error ? err.message : String(err)),
      };
    }
  },

  async renameImage(
    path: string,
    newName: string
  ): Promise<{ data: { newPath: string; publicUrl: string } | null; error: MediaServiceError | null }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: createError('NOT_CONFIGURED', 'Supabase is not configured') };
    }

    if (!hasValidExtension(newName)) {
      return { data: null, error: createError('INVALID_EXTENSION', 'New filename must have a valid extension') };
    }

    const pathParts = path.split('/');
    const folder = pathParts.slice(0, -1).join('/');
    const newPath = folder ? `${folder}/${newName}` : newName;

    const result = await this.moveImage(path, newPath);

    if (!result.success) {
      return { data: null, error: result.error };
    }

    return {
      data: {
        newPath,
        publicUrl: getPublicUrl(newPath),
      },
      error: null,
    };
  },

  async ensureBucketExists(): Promise<{ success: boolean; error: MediaServiceError | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: createError('NOT_CONFIGURED', 'Supabase is not configured') };
    }

    try {
      const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);

      if (data) {
        return { success: true, error: null };
      }

      if (error) {
        const createResult = await supabase.storage.createBucket(STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });

        if (createResult.error) {
          return {
            success: false,
            error: createError('BUCKET_CREATE_FAILED', 'Failed to create storage bucket', createResult.error.message),
          };
        }
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: createError('BUCKET_ERROR', 'An error occurred', err instanceof Error ? err.message : String(err)),
      };
    }
  },

  getFilePreview(path: string, options?: { width?: number; height?: number }): string {
    if (!isSupabaseConfigured()) return '';
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path, {
      transform: options,
    });
    return data.publicUrl;
  },
};

export default mediaService;
