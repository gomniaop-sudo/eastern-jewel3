/**
 * Media Library Page
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RefreshCw, Search, FolderOpen, ArrowUpDown, Grid2x2 as Grid, List, Trash2, Copy, Move, Check, X, Folder, Image as ImageIcon } from 'lucide-react';
import { MediaCard, MediaPreview, MediaUploadDropzone, Notification, ConfirmDialog, EmptyState } from '../../components/admin';
import { useMedia } from '../../hooks';
import type { MediaFile, MediaFolder } from '../../services/media.service';

const FOLDERS: { value: MediaFolder | ''; label: string }[] = [
  { value: '', label: 'All Folders' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'journal', label: 'Journal' },
  { value: 'avatars', label: 'Avatars' },
  { value: 'seo', label: 'SEO' },
  { value: 'general', label: 'General' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'size_desc', label: 'Largest First' },
  { value: 'size_asc', label: 'Smallest First' },
];

const ITEMS_PER_PAGE = 24;

export function MediaLibrary() {
  const { uploading, progress, uploadFiles, listFiles, deleteFile, deleteFiles } = useMedia();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
  const [fileToMove, setFileToMove] = useState<MediaFile | null>(null);
  const [fileToRename, setFileToRename] = useState<MediaFile | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<MediaFolder | ''>('');
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFiles({});
      if (data) {
        setFiles(data);
      }
    } catch (err) {
      setError('Failed to load media files');
    } finally {
      setLoading(false);
    }
  }, [listFiles]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((file) => file.name.toLowerCase().includes(query));
    }

    if (folderFilter) {
      result = result.filter((file) => file.folder === folderFilter);
    }

    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'size_desc':
        result.sort((a, b) => b.size - a.size);
        break;
      case 'size_asc':
        result.sort((a, b) => a.size - b.size);
        break;
    }

    return result;
  }, [files, searchQuery, folderFilter, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedFiles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedFiles, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, folderFilter, sortOption]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedFiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedFiles.map((f) => f.id)));
    }
  }, [selectedIds.size, paginatedFiles]);

  const handlePreview = useCallback((file: MediaFile) => {
    setPreviewFile(file);
  }, []);

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    setNotification({ message: 'URL copied to clipboard', type: 'success' });
  }, []);

  const handleRename = useCallback((file: MediaFile) => {
    setFileToRename(file);
    setShowRenameDialog(true);
  }, []);

  const handleMove = useCallback((file: MediaFile) => {
    setFileToMove(file);
    setShowMoveDialog(true);
  }, []);

  const handleDelete = useCallback((file: MediaFile) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!fileToDelete) return;
    const success = await deleteFile(fileToDelete.fullPath);
    if (success) {
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setNotification({ message: 'File deleted successfully', type: 'success' });
    }
    setShowDeleteDialog(false);
    setFileToDelete(null);
  }, [fileToDelete, deleteFile]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const paths = files.filter((f) => selectedIds.has(f.id)).map((f) => f.fullPath);
    const success = await deleteFiles(paths);
    if (success) {
      setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
      setSelectedIds(new Set());
      setNotification({ message: `${paths.length} files deleted successfully`, type: 'success' });
    }
  }, [selectedIds, files, deleteFiles]);

  const handleUpload = useCallback(
    async (filesToUpload: File[]) => {
      const results = await uploadFiles(filesToUpload, folderFilter || 'general');
      if (results.length > 0) {
        await loadFiles();
        setShowUploadModal(false);
        setNotification({ message: `${results.length} files uploaded successfully`, type: 'success' });
      }
    },
    [uploadFiles, folderFilter, loadFiles]
  );

  const handleMoveFile = useCallback(
    async (targetFolder: MediaFolder) => {
      if (!fileToMove) return;
      const pathParts = fileToMove.fullPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const newPath = `${targetFolder}/${fileName}`;

      const { mediaService } = await import('../../services/media.service');
      const result = await mediaService.moveImage(fileToMove.fullPath, newPath);

      if (!result.error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileToMove.id ? { ...f, folder: targetFolder, fullPath: newPath } : f
          )
        );
        setNotification({ message: 'File moved successfully', type: 'success' });
      }
      setShowMoveDialog(false);
      setFileToMove(null);
    },
    [fileToMove]
  );

  const handleRenameFile = useCallback(
    async (newName: string) => {
      if (!fileToRename) return;
      const { mediaService } = await import('../../services/media.service');
      const result = await mediaService.renameImage(fileToRename.fullPath, newName);

      if (result.data) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileToRename.id ? { ...f, name: newName, fullPath: result.data!.newPath } : f
          )
        );
        setNotification({ message: 'File renamed successfully', type: 'success' });
      }
      setShowRenameDialog(false);
      setFileToRename(null);
    },
    [fileToRename]
  );

  const totalSize = useMemo(() => {
    return files.reduce((sum, file) => sum + file.size, 0);
  }, [files]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display text-white">Media Library</h2>
          <p className="text-gray-500 text-sm mt-1">
            {files.length} files · {formatSize(totalSize)} total
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-luxury-black border border-luxury-light/20 rounded-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename..."
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

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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

        <div className="flex items-center border border-luxury-light/20 rounded-sm overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-gold-500/10 text-gold-500' : 'bg-luxury-light/10 text-gray-400 hover:text-white'}`}
            aria-label="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-gold-500/10 text-gold-500' : 'bg-luxury-light/10 text-gray-400 hover:text-white'}`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-3 bg-gold-500/10 border border-gold-500/30 rounded-sm"
        >
          <span className="text-gold-400 text-sm">
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => {
              const urls = files.filter((f) => selectedIds.has(f.id)).map((f) => f.publicUrl);
              navigator.clipboard.writeText(urls.join('\n'));
              setNotification({ message: 'URLs copied to clipboard', type: 'success' });
            }}
            className="px-3 py-1.5 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm rounded-sm flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy URLs
          </button>
          <button
            onClick={() => setShowMoveDialog(true)}
            className="px-3 py-1.5 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm rounded-sm flex items-center gap-2"
          >
            <Move className="w-3.5 h-3.5" />
            Move
          </button>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm rounded-sm flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 hover:bg-luxury-light/10 rounded-sm text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
            <p className="text-gray-400">Loading media files...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={loadFiles}
            className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm rounded-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : filteredAndSortedFiles.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media files found"
          description={searchQuery || folderFilter ? 'Try adjusting your filters' : 'Upload some files to get started'}
          action={
            !searchQuery && !folderFilter ? (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm"
              >
                Upload Files
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === paginatedFiles.length && paginatedFiles.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-luxury-light/40 bg-luxury-light/10 text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-400">Select all</span>
            </label>
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedFiles.length)} of {filteredAndSortedFiles.length}
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                  : 'space-y-2'
              }
            >
              {paginatedFiles.map((file) => (
                <MediaCard
                  key={file.id}
                  file={file}
                  isSelected={selectedIds.has(file.id)}
                  onSelect={handleSelect}
                  onPreview={handlePreview}
                  onCopyUrl={handleCopyUrl}
                  onRename={handleRename}
                  onMove={handleMove}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 rounded-sm text-gray-300 hover:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 text-sm rounded-sm ${
                        currentPage === page
                          ? 'bg-gold-500 text-luxury-black font-medium'
                          : 'bg-luxury-light/10 hover:bg-luxury-light/20 text-gray-400 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 rounded-sm text-gray-300 hover:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <MediaUploadDropzone
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
        progress={progress?.percentage || 0}
      />

      <MediaPreview
        file={previewFile}
        onClose={() => {
          setPreviewFile(null);
        }}
        onCopyUrl={handleCopyUrl}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setFileToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {showMoveDialog && fileToMove && (
        <MoveFileDialog
          currentFolder={fileToMove.folder}
          onMove={handleMoveFile}
          onClose={() => {
            setShowMoveDialog(false);
            setFileToMove(null);
          }}
        />
      )}

      {showRenameDialog && fileToRename && (
        <RenameFileDialog
          currentName={fileToRename.name}
          onRename={handleRenameFile}
          onClose={() => {
            setShowRenameDialog(false);
            setFileToRename(null);
          }}
        />
      )}
    </div>
  );
}

function MoveFileDialog({
  currentFolder,
  onMove,
  onClose,
}: {
  currentFolder: MediaFolder;
  onMove: (folder: MediaFolder) => void;
  onClose: () => void;
}) {
  const [targetFolder, setTargetFolder] = useState<MediaFolder>(currentFolder);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-luxury-900 border border-luxury-light/20 rounded-sm">
        <div className="p-4 border-b border-luxury-light/20">
          <h3 className="text-lg font-display text-white">Move to Folder</h3>
        </div>
        <div className="p-6 space-y-4">
          {FOLDERS.filter((f) => f.value).map((folder) => (
            <button
              key={folder.value}
              onClick={() => setTargetFolder(folder.value as MediaFolder)}
              className={`w-full flex items-center gap-3 p-3 rounded-sm transition-colors ${
                targetFolder === folder.value
                  ? 'bg-gold-500/10 border border-gold-500/30'
                  : 'bg-luxury-light/5 hover:bg-luxury-light/10 border border-transparent'
              }`}
            >
              <Folder className="w-5 h-5 text-gray-500" />
              <span className="text-white">{folder.label}</span>
              {targetFolder === folder.value && <Check className="w-4 h-4 text-gold-500 ml-auto" />}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-luxury-light/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onMove(targetFolder)}
            disabled={targetFolder === currentFolder}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}

function RenameFileDialog({
  currentName,
  onRename,
  onClose,
}: {
  currentName: string;
  onRename: (newName: string) => void;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState(currentName);
  const ext = currentName.slice(currentName.lastIndexOf('.'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-luxury-900 border border-luxury-light/20 rounded-sm">
        <div className="p-4 border-b border-luxury-light/20">
          <h3 className="text-lg font-display text-white">Rename File</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">New filename</label>
            <div className="flex">
              <input
                type="text"
                value={newName.replace(ext, '')}
                onChange={(e) => setNewName(e.target.value + ext)}
                className="flex-1 px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-l-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <span className="px-3 py-2 bg-luxury-light/20 border border-luxury-light/20 border-l-0 text-gray-400 rounded-r-sm">
                {ext}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-luxury-light/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm font-medium rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onRename(newName)}
            disabled={!newName || newName === currentName}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaLibrary;
