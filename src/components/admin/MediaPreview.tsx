/**
 * Media Preview Modal Component
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, Check, Download, FolderOpen, Calendar, HardDrive, FileImage } from 'lucide-react';
import type { MediaFile } from '../../services/media.service';

interface MediaPreviewProps {
  file: MediaFile | null;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
}

export function MediaPreview({ file, onClose, onCopyUrl }: MediaPreviewProps) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (file) {
      closeButtonRef.current?.focus();
    }
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (file) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [file, onClose]);

  const handleCopyUrl = () => {
    if (!file) return;
    navigator.clipboard.writeText(file.publicUrl);
    setCopied(true);
    onCopyUrl(file.publicUrl);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    if (!file) return;
    const link = document.createElement('a');
    link.href = file.publicUrl;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-luxury-900 border border-luxury-light/20 rounded-sm overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-luxury-light/20 bg-luxury-black">
              <h2 id="preview-title" className="text-lg font-display text-white truncate pr-8">
                {file.name}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-luxury-light/10 rounded-sm transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-8 bg-luxury-black/50">
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
              </div>

              <div className="w-72 border-l border-luxury-light/20 bg-luxury-black p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Filename</p>
                    <p className="text-white text-sm break-all">{file.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Public URL</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={file.publicUrl}
                        readOnly
                        className="flex-1 px-2 py-1 text-xs bg-luxury-light/10 border border-luxury-light/20 rounded text-gray-300 truncate"
                      />
                      <button
                        onClick={handleCopyUrl}
                        className="p-1.5 hover:bg-luxury-light/10 rounded transition-colors"
                        aria-label="Copy URL"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span className="text-xs">Folder</span>
                      </div>
                      <p className="text-white text-sm capitalize">{file.folder}</p>
                    </div>

                    <div className="p-3 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span className="text-xs">Size</span>
                      </div>
                      <p className="text-white text-sm">{formatSize(file.size)}</p>
                    </div>

                    <div className="p-3 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <FileImage className="w-3.5 h-3.5" />
                        <span className="text-xs">Type</span>
                      </div>
                      <p className="text-white text-sm">{file.mimeType}</p>
                    </div>

                    {file.width && file.height && (
                      <div className="p-3 bg-luxury-light/5 rounded-sm border border-luxury-light/10">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <FileImage className="w-3.5 h-3.5" />
                          <span className="text-xs">Dimensions</span>
                        </div>
                        <p className="text-white text-sm">{file.width} x {file.height}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                    <p className="text-white text-sm">{formatDate(file.createdAt)}</p>
                  </div>

                  <div className="pt-4 border-t border-luxury-light/10 space-y-2">
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => window.open(file.publicUrl, '_blank')}
                      className="w-full px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in new tab
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MediaPreview;
