/**
 * Media Upload Hook - Loading States and Notifications
 */

import { useState, useCallback, useRef } from 'react';
import {
  mediaService,
  getPublicUrl as getPublicUrlFromService,
  type UploadResult,
  type UploadProgress,
  type MediaFile,
  type MediaServiceError,
  type MediaFolder,
  type ListOptions,
} from '../services/media.service';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface UseMediaResult {
  uploading: boolean;
  progress: UploadProgress | null;
  error: MediaServiceError | null;
  notification: NotificationState | null;
  abortController: AbortController | null;
  uploadFile: (file: File, folder?: MediaFolder) => Promise<UploadResult | null>;
  uploadFiles: (files: File[], folder?: MediaFolder) => Promise<UploadResult[]>;
  cancelUpload: () => void;
  clearError: () => void;
  clearNotification: () => void;
  getPublicUrl: (path: string) => string;
  listFiles: (options?: ListOptions) => Promise<MediaFile[] | null>;
  deleteFile: (path: string) => Promise<boolean>;
  deleteFiles: (paths: string[]) => Promise<boolean>;
}

export function useMedia(): UseMediaResult {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<MediaServiceError | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearNotification = useCallback(() => setNotification(null), []);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploading(false);
    setProgress(null);
    setNotification({ message: 'Upload cancelled', type: 'warning' });
  }, []);

  const uploadFile = useCallback(
    async (file: File, folder?: MediaFolder): Promise<UploadResult | null> => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setUploading(true);
      setProgress(null);
      setError(null);

      try {
        const { data, error: uploadError } = await mediaService.uploadImage(file, {
          folder,
          signal: controller.signal,
          onProgress: setProgress,
        });

        if (uploadError) {
          setError(uploadError);
          setNotification({ message: uploadError.message, type: 'error' });
          return null;
        }

        if (data) {
          setNotification({ message: `File "${file.name}" uploaded successfully`, type: 'success' });
          return data;
        }
        return null;
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Upload failed';
        setError({ code: 'UPLOAD_ERROR', message: errMessage });
        setNotification({ message: errMessage, type: 'error' });
        return null;
      } finally {
        setUploading(false);
        setProgress(null);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const uploadFiles = useCallback(
    async (files: File[], folder?: MediaFolder): Promise<UploadResult[]> => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setUploading(true);
      setProgress(null);
      setError(null);

      try {
        const { data, errors } = await mediaService.uploadImages(files, {
          folder,
          signal: controller.signal,
          onProgress: setProgress,
        });

        if (errors.length > 0) {
          const errorMessages = errors.map((e) => e.error.message).join(', ');
          if (data.length === 0) {
            setError(errors[0].error);
            setNotification({ message: errorMessages, type: 'error' });
          } else {
            setNotification({
              message: `Uploaded ${data.length}/${files.length} files. Some failed: ${errorMessages}`,
              type: 'warning',
            });
          }
        } else if (data.length > 0) {
          setNotification({
            message: `${data.length} file${data.length > 1 ? 's' : ''} uploaded successfully`,
            type: 'success',
          });
        }
        return data;
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Upload failed';
        setError({ code: 'UPLOAD_ERROR', message: errMessage });
        setNotification({ message: errMessage, type: 'error' });
        return [];
      } finally {
        setUploading(false);
        setProgress(null);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const getPublicUrl = useCallback((path: string) => getPublicUrlFromService(path), []);

  const listFiles = useCallback(
    async (options?: ListOptions): Promise<MediaFile[] | null> => {
      try {
        const { data, error: listError } = await mediaService.listImages(options);
        if (listError) {
          setError(listError);
          setNotification({ message: listError.message, type: 'error' });
          return null;
        }
        return data;
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Failed to list files';
        setError({ code: 'LIST_ERROR', message: errMessage });
        return null;
      }
    },
    []
  );

  const deleteFile = useCallback(
    async (path: string): Promise<boolean> => {
      setError(null);
      try {
        const { error: deleteError } = await mediaService.deleteImage(path);
        if (deleteError) {
          setError(deleteError);
          setNotification({ message: deleteError.message, type: 'error' });
          return false;
        }
        setNotification({ message: 'File deleted successfully', type: 'success' });
        return true;
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Delete failed';
        setError({ code: 'DELETE_ERROR', message: errMessage });
        setNotification({ message: errMessage, type: 'error' });
        return false;
      }
    },
    []
  );

  const deleteFiles = useCallback(
    async (paths: string[]): Promise<boolean> => {
      setError(null);
      try {
        const { errors } = await mediaService.deleteImages(paths);
        if (errors.length > 0) {
          setError(errors[0].error);
          setNotification({ message: errors[0].error.message, type: 'error' });
          return false;
        }
        setNotification({
          message: `${paths.length} file${paths.length > 1 ? 's' : ''} deleted successfully`,
          type: 'success',
        });
        return true;
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Delete failed';
        setError({ code: 'DELETE_ERROR', message: errMessage });
        setNotification({ message: errMessage, type: 'error' });
        return false;
      }
    },
    []
  );

  return {
    uploading,
    progress,
    error,
    notification,
    abortController: abortControllerRef.current,
    uploadFile,
    uploadFiles,
    cancelUpload,
    clearError,
    clearNotification,
    getPublicUrl,
    listFiles,
    deleteFile,
    deleteFiles,
  };
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (file: File | File[], folder?: MediaFolder): Promise<UploadResult[]> => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setUploading(true);
      setProgress(null);

      try {
        const files = Array.isArray(file) ? file : [file];
        const { data } = await mediaService.uploadImages(files, {
          folder,
          signal: controller.signal,
          onProgress: setProgress,
        });
        return data;
      } finally {
        setUploading(false);
        setProgress(null);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setUploading(false);
    setProgress(null);
  }, []);

  return { uploading, progress, upload, cancel };
}

export function useMediaList(folder?: MediaFolder) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<MediaServiceError | null>(null);

  const load = useCallback(
    async (options?: Omit<ListOptions, 'folder'>) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: listError } = await mediaService.listImages({ ...options, folder });
        if (listError) {
          setError(listError);
          setFiles([]);
        } else {
          setFiles(data || []);
        }
      } finally {
        setLoading(false);
      }
    },
    [folder]
  );

  return { files, loading, error, load, setFiles };
}

export default useMedia;
