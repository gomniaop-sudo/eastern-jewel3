/**
 * Gallery Form Component
 */

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CategoryRow, GalleryItemRow } from '../../lib/database.types';

interface GalleryFormData {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category_id: string;
  image_url: string;
  is_premium: boolean;
  is_featured: boolean;
  is_active: boolean;
}

interface GalleryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GalleryFormData) => Promise<void>;
  item?: GalleryItemRow | null;
  categories: CategoryRow[];
  loading?: boolean;
}

const initialFormData: GalleryFormData = {
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  category_id: '',
  image_url: '',
  is_premium: false,
  is_featured: false,
  is_active: true,
};

interface FormErrors {
  title_en?: string;
  image_url?: string;
}

export function GalleryForm({ isOpen, onClose, onSubmit, item, categories, loading }: GalleryFormProps) {
  const [formData, setFormData] = useState<GalleryFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (item) {
      const metadata = item.metadata as Record<string, string> | null;
      setFormData({
        title_en: item.title || '',
        title_ar: metadata?.title_ar || '',
        description_en: item.description || '',
        description_ar: metadata?.description_ar || '',
        category_id: item.category_id || '',
        image_url: item.image_url || '',
        is_premium: item.is_premium,
        is_featured: item.is_featured,
        is_active: item.is_active,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [item, isOpen]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title_en.trim()) {
      newErrors.title_en = 'English title is required';
    }
    if (!formData.image_url.trim()) {
      newErrors.image_url = 'Image URL is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleChange = (field: keyof GalleryFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
            className="bg-luxury-black border border-luxury-light/20 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-luxury-light/20">
              <h3 className="text-lg font-display text-white">
                {item ? 'Edit Gallery Item' : 'Add Gallery Item'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-luxury-light/10 rounded-sm transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                  {errors.title_en && (
                    <p className="text-red-500 text-xs mt-1">{errors.title_en}</p>
                  )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description (English)</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => handleChange('description_en', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                    placeholder="Enter description in English"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description (Arabic)</label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => handleChange('description_ar', e.target.value)}
                    rows={3}
                    dir="rtl"
                    className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                    placeholder="أدخل الوصف بالعربية"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  className={`w-full px-3 py-2 bg-luxury-light/10 border rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${
                    errors.image_url ? 'border-red-500' : 'border-luxury-light/20'
                  }`}
                  placeholder="https://images.pexels.com/..."
                />
                {errors.image_url && (
                  <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>
                )}
                {formData.image_url && (
                  <div className="mt-2 aspect-video rounded-sm overflow-hidden bg-luxury-light/10">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => handleChange('is_premium', e.target.checked)}
                    className="w-4 h-4 rounded border-luxury-light/20 bg-luxury-light/10 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-gray-300">Premium</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded border-luxury-light/20 bg-luxury-light/10 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="w-4 h-4 rounded border-luxury-light/20 bg-luxury-light/10 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-gray-300">Published</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-light/20">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-luxury-light/10 rounded-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium bg-gold-500 hover:bg-gold-400 text-luxury-black rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {item ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GalleryForm;
