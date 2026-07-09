/**
 * Media Selector Modal Component
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FolderOpen, RefreshCw, CircleAlert as AlertCircle, Image as ImageIcon, Check } from 'lucide-react';
import { mediaService, type MediaFile, type MediaFolder } from '../../services/media.service';

interface MediaSelectorResult {
  publicUrl: string;
  fullPath: string;
  name: string;
  folder: MediaFolder;
  size: number;
  mimeType: string;
}

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: MediaSelectorResult) => void;
  defaultFolder?: MediaFolder | '';
  title?: string;
}

const FOLDERS: { value: MediaFolder | ''; label: string }[] = [
  { value: '', label: 'All Folders' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'journal', label: 'Journal' },
  { value: 'avatars', label: 'Avatars' },
  { value: 'seo', label: 'SEO' },
  { value: 'general', label: 'General' },
];

export function MediaSelectorModal({
  isOpen,
  onClose,
  onSelect,
  defaultFolder = '',
  title = 'Select Image',
}: MediaSelectorModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<MediaFolder | ''>(defaultFolder as MediaFolder | '');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [confirming, setConfirming] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: loadError } = await mediaService.listImages({});
      if (loadError) {
        setError(loadError.message);
      } else if (data) {
        setFiles(data);
      }
    } catch {
      setError('Failed to load media files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setSelectedFile(null);
      setSearchQuery('');
      setFolderFilter(defaultFolder as MediaFolder | '');
      closeButtonRef.current?.focus();
    }
  }, [isOpen, loadFiles, defaultFolder]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((file) => file.name.toLowerCase().includes(query));
    }

    if (folderFilter) {
      result = result.filter((file) => file.folder === folderFilter);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [files, searchQuery, folderFilter]);

  const handleSelect = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    setConfirming(true);
    try {
      onSelect({
        publicUrl: selectedFile.publicUrl,
        fullPath: selectedFile.fullPath,
        name: selectedFile.name,
        folder: selectedFile.folder,
        size: selectedFile.size,
        mimeType: selectedFile.mimeType,
      });
      onClose();
    } finally {
      setConfirming(false);
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
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-luxury-900 border border-luxury-light/20 rounded-sm overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="selector-title"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-luxury-light/20 bg-luxury-black">
              <h2 id="selector-title" className="text-lg font-display text-white">
                {title}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-luxury-light/10 rounded-sm transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-luxury-black border-b border-luxury-light/20">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search images..."
                  className="w-full pl-10 pr-4 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-gray-500" />
                <select
                  value={folderFilter}
                  onChange={(e) => setFolderFilter(e.target.value as MediaFolder | '')}
                  className="px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  {FOLDERS.map((folder) => (
                    <option key={folder.value} value={folder.value}>
                      {folder.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={loadFiles}
                disabled={loading}
                className="p-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 rounded-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                  <p className="text-red-400 mb-2">{error}</p>
                  <button
                    onClick={loadFiles}
                    className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm rounded-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 mb-2">No images found</p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery || folderFilter
                      ? 'Try adjusting your filters'
                      : 'Upload some images to the Media Library'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleSelect(file)}
                      className={`relative group aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                        selectedFile?.id === file.id
                          ? 'border-gold-500 ring-2 ring-gold-500/30'
                          : 'border-luxury-light/20 hover:border-gold-500/50'
                      }`}
                    >
                      <img
                        src={file.publicUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {selectedFile?.id === file.id ? (
                          <Check className="w-8 h-8 text-gold-500" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-white" />
                        )}
                      </div>
                      {selectedFile?.id === file.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-luxury-black" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 truncate">
                        <p className="text-xs text-white truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="px-4 py-3 bg-luxury-black border-t border-luxury-light/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-sm overflow-hidden border border-luxury-light/20">
                    <img
                      src={selectedFile.publicUrl}
                      alt={selectedFile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {selectedFile.folder} · {formatSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-luxury-light/20 bg-luxury-black">
              <button
                onClick={onClose}
                disabled={confirming}
                className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedFile || confirming}
                className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {confirming && <RefreshCw className="w-4 h-4 animate-spin" />}
                Select Image
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MediaSelectorModal;
