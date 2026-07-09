/**
 * Media Card Component
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  FolderOpen,
  Check,
  Eye,
} from 'lucide-react';
import type { MediaFile } from '../../services/media.service';

interface MediaCardProps {
  file: MediaFile;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (file: MediaFile) => void;
  onCopyUrl: (url: string) => void;
  onRename: (file: MediaFile) => void;
  onMove: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
}

export const MediaCard = memo(function MediaCard({
  file,
  isSelected,
  onSelect,
  onPreview,
  onCopyUrl,
  onRename,
  onMove,
  onDelete,
}: MediaCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.publicUrl);
    setCopied(true);
    onCopyUrl(file.publicUrl);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group bg-luxury-black border rounded-sm overflow-hidden transition-all ${
        isSelected ? 'border-gold-500 ring-2 ring-gold-500/30' : 'border-luxury-light/20 hover:border-gold-500/50'
      }`}
    >
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(file.id);
        }}
      >
        <button
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-gold-500 border-gold-500 text-luxury-black'
              : 'border-luxury-light/40 hover:border-gold-500'
          }`}
          aria-label={isSelected ? 'Deselect' : 'Select'}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </button>
      </div>

      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="w-8 h-8 bg-luxury-black/80 hover:bg-luxury-light/20 rounded-sm flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Actions menu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
            <div className="absolute top-full right-0 mt-1 w-48 bg-luxury-black border border-luxury-light/20 rounded-sm shadow-lg z-30 overflow-hidden py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(file);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-luxury-light/10 hover:text-white flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyUrl();
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-luxury-light/10 hover:text-white flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(file.publicUrl, '_blank');
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-luxury-light/10 hover:text-white flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </button>
              <div className="h-px bg-luxury-light/10 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(file);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-luxury-light/10 hover:text-white flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(file);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-luxury-light/10 hover:text-white flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Move to folder
              </button>
              <div className="h-px bg-luxury-light/10 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <button
        className="w-full aspect-square overflow-hidden cursor-pointer"
        onClick={() => onPreview(file)}
      >
        <img
          src={file.publicUrl}
          alt={file.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.png';
          }}
        />
      </button>

      <div className="p-3 border-t border-luxury-light/10">
        <p className="text-white text-sm truncate" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="px-1.5 py-0.5 bg-luxury-light/10 rounded text-gray-400">
            {file.folder}
          </span>
          <span>{formatSize(file.size)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{formatDate(file.createdAt)}</p>
      </div>
    </motion.div>
  );
});

export default MediaCard;
