/**
 * Journal Form Component with Rich Text Editor
 */

import { useState, useEffect, useRef } from 'react';
import { X, Loader as Loader2, Bold, Italic, List, ListOrdered, Link2, Quote, Heading2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JournalEntryRow } from '../../lib/database.types';

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

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

function RichTextEditor({ value, onChange, placeholder, dir = 'ltr' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (before: string, after: string = before) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertFormat('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertFormat('*', '*'), title: 'Italic' },
    { icon: Heading2, action: () => insertFormat('## '), title: 'Heading' },
    { icon: List, action: () => insertFormat('- '), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertFormat('1. '), title: 'Numbered List' },
    { icon: Quote, action: () => insertFormat('> '), title: 'Quote' },
    { icon: Link2, action: () => insertFormat('[', '](url)'), title: 'Link' },
  ];

  return (
    <div className="border border-luxury-light/20 rounded-sm overflow-hidden">
      <div className="flex items-center gap-1 p-2 bg-luxury-light/10 border-b border-luxury-light/20">
        {toolbarButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="p-1.5 hover:bg-luxury-light/20 rounded text-gray-400 hover:text-white transition-colors"
          >
            <btn.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        placeholder={placeholder}
        rows={12}
        className="w-full px-3 py-2 bg-luxury-light/5 text-white placeholder-gray-500 focus:outline-none resize-none font-mono text-sm"
      />
    </div>
  );
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
}

function PreviewModal({ isOpen, onClose, content, title }: PreviewModalProps) {
  if (!isOpen) return null;

  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-display text-white mt-4 mb-2">$1</h2>')
      .replace(/^- (.*$)/gm, '<li class="text-gray-300 ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="text-gray-300 ml-4">$2</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-gold-500 pl-4 text-gray-400 italic my-2">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-gold-400 hover:underline">$1</a>')
      .replace(/\n/g, '<br />');
  };

  return (
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
        className="bg-luxury-black border border-luxury-light/20 rounded-sm w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-luxury-light/20">
          <h3 className="text-lg font-display text-white">Preview: {title || 'Untitled'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-luxury-light/10 rounded-sm text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 prose prose-invert max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: renderContent(content) }}
            className="text-gray-300 leading-relaxed"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function JournalForm({ isOpen, onClose, onSubmit, item, categories, loading, onCheckSlug }: JournalFormProps) {
  const [formData, setFormData] = useState<JournalFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugValid, setSlugValid] = useState<boolean | null>(null);

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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validate())) return;
    await onSubmit(formData);
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
            className="bg-luxury-black border border-luxury-light/20 rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-luxury-light/20 sticky top-0 bg-luxury-black z-10">
              <h3 className="text-lg font-display text-white">
                {item ? 'Edit Article' : 'Create Article'}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-luxury-light/10 rounded-sm text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-gray-400">
                    Content (English) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                </div>
                <RichTextEditor
                  value={formData.content_en}
                  onChange={(value) => handleChange('content_en', value)}
                  placeholder="Write your article content using Markdown..."
                />
                {errors.content_en && <p className="text-red-500 text-xs mt-1">{errors.content_en}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Content (Arabic)</label>
                <RichTextEditor
                  value={formData.content_ar}
                  onChange={(value) => handleChange('content_ar', value)}
                  dir="rtl"
                  placeholder="اكتب محتوى المقال..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Featured Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  placeholder="https://images.pexels.com/..."
                />
                {formData.image_url && (
                  <div className="mt-2 aspect-video rounded-sm overflow-hidden bg-luxury-light/10">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-light/20 sticky bottom-0 bg-luxury-black py-4 -mx-4 px-4">
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
                  disabled={loading || slugChecking}
                  className="px-6 py-2 text-sm font-medium bg-gold-500 hover:bg-gold-400 text-luxury-black rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {item ? 'Update' : 'Create'}
                </button>
              </div>
            </form>

            <PreviewModal
              isOpen={previewOpen}
              onClose={() => setPreviewOpen(false)}
              content={formData.content_en}
              title={formData.title_en}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default JournalForm;
