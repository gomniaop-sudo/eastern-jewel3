/**
 * Journal Form Component with Professional Rich Text Editor
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Loader as Loader2, CircleAlert as AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JournalEntryRow } from '../../lib/database.types';
import {
  RichTextEditor,
  createDraftKey,
  saveDraft,
  restoreDraft,
  clearDraft,
} from './RichTextEditor';
import { MediaSelectorModal } from './MediaSelectorModal';

interface JournalFormData {
  title_en: string;
  title_ar: string;
  slug: string;
  excerpt_en: string;
  excerpt_ar: string;
  content_en: string;
  content_ar: string;
  image_url: string;
  category: string;
  tags: string;
  is_featured: boolean;
  is_published: boolean;
}

interface JournalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JournalFormData) => Promise<void>;
  item?: JournalEntryRow | null;
  categories: string[];
  loading?: boolean;
  onCheckSlug: (slug: string) => Promise<boolean>;
}

const initialFormData: JournalFormData = {
  title_en: '',
  title_ar: '',
  slug: '',
  excerpt_en: '',
  excerpt_ar: '',
  content_en: '',
  content_ar: '',
  image_url: '',
  category: '',
  tags: '',
  is_featured: false,
  is_published: false,
};

interface FormErrors {
  title_en?: string;
  slug?: string;
  content_en?: string;
}

export function JournalForm({ isOpen, onClose, onSubmit, item, categories, loading, onCheckSlug }: JournalFormProps) {
  const [formData, setFormData] = useState<JournalFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugValid, setSlugValid] = useState<boolean | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const draftKey = item?.id || 'new';

  const handleSaveDraftEN = useCallback(
    (value: string) => {
      saveDraft(createDraftKey('content_en', draftKey), value);
    },
    [draftKey]
  );

  const handleRestoreDraftEN = useCallback(() => {
    return restoreDraft(createDraftKey('content_en', draftKey));
  }, [draftKey]);

  const handleSaveDraftAR = useCallback(
    (value: string) => {
      saveDraft(createDraftKey('content_ar', draftKey), value);
    },
    [draftKey]
  );

  const handleRestoreDraftAR = useCallback(() => {
    return restoreDraft(createDraftKey('content_ar', draftKey));
  }, [draftKey]);

  useEffect(() => {
    if (item) {
      const metadata = item.metadata as Record<string, string> | null;
      setFormData({
        title_en: item.title || '',
        title_ar: metadata?.title_ar || '',
        slug: item.slug || '',
        excerpt_en: item.excerpt || '',
        excerpt_ar: metadata?.excerpt_ar || '',
        content_en: item.content || '',
        content_ar: metadata?.content_ar || '',
        image_url: item.image_url || '',
        category: item.category || '',
        tags: (item.tags || []).join(', '),
        is_featured: item.is_featured,
        is_published: item.is_published,
      });
      setSlugManuallyEdited(true);
    } else {
      setFormData(initialFormData);
      setSlugManuallyEdited(false);
    }
    setErrors({});
    setSlugValid(null);
    setImageError(false);
    setNotification(null);
  }, [item, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  };

  useEffect(() => {
    if (!slugManuallyEdited && formData.title_en) {
      const newSlug = generateSlug(formData.title_en);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title_en, slugManuallyEdited]);

  const validate = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (!formData.title_en.trim()) {
      newErrors.title_en = 'English title is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.content_en.trim()) {
      newErrors.content_en = 'English content is required';
    }

    if (formData.slug && !item?.slug) {
      setSlugChecking(true);
      const isUnique = await onCheckSlug(formData.slug);
      setSlugValid(isUnique);
      setSlugChecking(false);
      if (!isUnique) {
        newErrors.slug = 'This slug is already in use';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setNotification({
        type: 'error',
        message: Object.values(newErrors).join('. '),
      });
      setTimeout(() => setNotification(null), 4000);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validate())) return;

    setSubmitting(true);
    try {
      clearDraft(createDraftKey('content_en', draftKey));
      clearDraft(createDraftKey('content_ar', draftKey));
      await onSubmit(formData);
      setNotification({ type: 'success', message: 'Article saved successfully!' });
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1500);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save article',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof JournalFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'slug') {
      setSlugManuallyEdited(true);
      setSlugValid(null);
    }
  };

  const handleMediaSelect = (result: {
    publicUrl: string;
    fullPath: string;
    name: string;
    folder: string;
    size: number;
    mimeType: string;
  }) => {
    setFormData((prev) => ({ ...prev, image_url: result.publicUrl }));
    setImageError(false);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image_url: '' }));
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-luxury-black border border-luxury-light/20 rounded-sm w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-luxury-light/20 bg-luxury-black z-10 shrink-0">
              <h3 className="text-lg font-display text-white">
                {item ? 'Edit Article' : 'Create Article'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-luxury-light/10 rounded-sm text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 px-4 py-3 ${
                  notification.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border-b border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border-b border-red-500/20'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{notification.message}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => handleChange('title_en', e.target.value)}
                    className={`w-full px-3 py-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${
                      errors.title_en ? 'border-red-500' : 'border-luxury-light/20'
                    }`}
                    placeholder="Enter title in English"
                  />
                  {errors.title_en && <p className="text-red-500 text-xs mt-1">{errors.title_en}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => handleChange('title_ar', e.target.value)}
                    dir="rtl"
                    className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    placeholder="أدخل العنوان بالعربية"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className={`flex-1 px-3 py-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 font-mono text-sm ${
                      errors.slug ? 'border-red-500' : slugValid === true ? 'border-green-500' : 'border-luxury-light/20'
                    }`}
                    placeholder="article-slug"
                  />
                  {slugChecking && <Loader2 className="w-5 h-5 text-gold-500 animate-spin self-center" />}
                </div>
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                {slugValid === true && !errors.slug && <p className="text-green-500 text-xs mt-1">Slug is available</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Excerpt (English)</label>
                  <textarea
                    value={formData.excerpt_en}
                    onChange={(e) => handleChange('excerpt_en', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                    placeholder="Brief summary..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Excerpt (Arabic)</label>
                  <textarea
                    value={formData.excerpt_ar}
                    onChange={(e) => handleChange('excerpt_ar', e.target.value)}
                    rows={2}
                    dir="rtl"
                    className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                    placeholder="ملخص قصير..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Content (English) <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.content_en}
                  onChange={(value) => handleChange('content_en', value)}
                  placeholder="Write your article content using Markdown..."
                  dir="ltr"
                  language="en"
                  onSaveDraft={handleSaveDraftEN}
                  onRestoreDraft={handleRestoreDraftEN}
                />
                {errors.content_en && <p className="text-red-500 text-xs mt-1">{errors.content_en}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Content (Arabic)</label>
                <RichTextEditor
                  value={formData.content_ar}
                  onChange={(value) => handleChange('content_ar', value)}
                  dir="rtl"
                  language="ar"
                  placeholder="اكتب محتوى المقال..."
                  onSaveDraft={handleSaveDraftAR}
                  onRestoreDraft={handleRestoreDraftAR}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Featured Image</label>
                {formData.image_url && !imageError ? (
                  <div className="relative">
                    <div className="aspect-video rounded-sm overflow-hidden bg-luxury-light/10 border border-luxury-light/20">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaSelector(true)}
                        className="p-2 bg-luxury-black/80 hover:bg-luxury-light/20 rounded-sm text-gray-300 hover:text-white transition-colors"
                        title="Replace image"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 bg-luxury-black/80 hover:bg-red-500/20 rounded-sm text-gray-300 hover:text-red-400 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMediaSelector(true)}
                    className={`w-full aspect-video border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 transition-colors ${
                      imageError && formData.image_url
                        ? 'border-red-500 bg-red-500/5'
                        : 'border-luxury-light/30 hover:border-gold-500/50 hover:bg-gold-500/5'
                    }`}
                  >
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                    <span className="text-gray-400 text-sm">Choose Featured Image</span>
                  </button>
                )}
                {imageError && formData.image_url && (
                  <p className="text-yellow-500 text-xs mt-1">
                    Image could not be loaded. Click to select a different image.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    placeholder="lifestyle, beauty, tips"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded border-luxury-light/20 bg-luxury-light/10 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-gray-300">Featured Article</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => handleChange('is_published', e.target.checked)}
                    className="w-4 h-4 rounded border-luxury-light/20 bg-luxury-light/10 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-gray-300">Published</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-light/20 bg-luxury-black py-4 -mx-4 px-4 sticky bottom-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-luxury-light/10 rounded-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || submitting || slugChecking}
                  className="px-6 py-2 text-sm font-medium bg-gold-500 hover:bg-gold-400 text-luxury-black rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {(loading || submitting) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {item ? 'Update' : 'Create'}
                </button>
              </div>
            </form>

            <MediaSelectorModal
              isOpen={showMediaSelector}
              onClose={() => setShowMediaSelector(false)}
              onSelect={handleMediaSelect}
              defaultFolder="journal"
              title="Select Featured Image"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default JournalForm;
