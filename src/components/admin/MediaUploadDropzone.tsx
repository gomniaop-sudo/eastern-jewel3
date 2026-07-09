/**
 * Media Upload Dropzone Component
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadQueueItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: { publicUrl: string; path: string };
}

interface MediaUploadDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  progress: number;
}

export function MediaUploadDropzone({
  isOpen,
  onClose,
  onUpload,
  uploading,
  progress,
}: MediaUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['JPG', 'JPEG', 'PNG', 'WebP'];
  const maxSize = '5 MB';

  const addFilesToQueue = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: UploadQueueItem[] = fileArray.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addFilesToQueue(files);
      }
    },
    [addFilesToQueue]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFilesToQueue(files);
      e.target.value = '';
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const handleUpload = async () => {
    const pendingFiles = queue.filter((item) => item.status !== 'success').map((item) => item.file);
    if (pendingFiles.length === 0) return;

    setQueue((prev) =>
      prev.map((item) =>
        item.status !== 'success' ? { ...item, status: 'uploading' as const, progress: 0 } : item
      )
    );

    await onUpload(pendingFiles);

    setQueue((prev) =>
      prev.map((item) =>
        item.status === 'uploading' ? { ...item, status: 'success' as const, progress: 100 } : item
      )
    );
  };

  const handleClose = () => {
    if (!uploading) {
      clearQueue();
      onClose();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-luxury-900 border border-luxury-light/20 rounded-sm overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-luxury-light/20 bg-luxury-black">
              <h2 id="upload-title" className="text-lg font-display text-white">
                Upload Media
              </h2>
              <button
                onClick={handleClose}
                disabled={uploading}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-luxury-light/10 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-sm p-12 text-center transition-colors ${
                  isDragging
                    ? 'border-gold-500 bg-gold-500/5'
                    : 'border-luxury-light/30 hover:border-gold-500/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-white mb-2">
                  {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <button
                  type="button"
                  disabled={uploading}
                  className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Browse files
                </button>
                <p className="text-gray-500 text-xs mt-4">
                  {supportedFormats.join(', ')} (Max {maxSize})
                </p>
              </div>

              {queue.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {queue.length} file{queue.length > 1 ? 's' : ''} in queue
                    </p>
                    <button
                      onClick={clearQueue}
                      disabled={uploading}
                      className="text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {queue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-luxury-light/5 border border-luxury-light/10 rounded-sm"
                      >
                        <FileImage className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{item.file.name}</p>
                          <p className="text-xs text-gray-500">{formatSize(item.file.size)}</p>
                        </div>
                        {item.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {item.status === 'error' && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-xs text-red-400">{item.error}</span>
                          </div>
                        )}
                        {item.status === 'uploading' && (
                          <div className="w-16">
                            <div className="h-1.5 bg-luxury-light/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gold-500"
                              />
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-1">{progress}%</p>
                          </div>
                        )}
                        {!uploading && item.status !== 'success' && (
                          <button
                            onClick={() => removeFromQueue(item.id)}
                            className="p-1 hover:bg-luxury-light/10 rounded transition-colors"
                            aria-label="Remove from queue"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Uploading...</span>
                    <span className="text-white">{progress}%</span>
                  </div>
                  <div className="h-2 bg-luxury-light/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gold-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={uploading}
                  className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || queue.filter((item) => item.status !== 'success').length === 0}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MediaUploadDropzone;
