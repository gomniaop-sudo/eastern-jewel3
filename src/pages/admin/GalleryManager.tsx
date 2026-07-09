/**
 * Admin Gallery Manager Page - Full CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Image, Search, ArrowUpDown, Edit2, Trash2,
  Eye, EyeOff, Star, Lock, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import {
  EmptyState, LoadingCard, ConfirmDialog, Notification, GalleryForm
} from '../../components/admin';
import { galleryService, galleryCategoriesService, type GalleryItemWithCategory } from '../../services';
import type { CategoryRow } from '../../lib/database.types';
import { isSupabaseConfigured } from '../../lib';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ITEMS_PER_PAGE = 20;

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItemWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'premium' | 'free'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemWithCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: GalleryItemWithCategory | null }>({
    open: false,
    item: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [itemsData, categoriesData, count] = await Promise.all([
        galleryService.getAllAdmin({
          search: search || undefined,
          category: categoryFilter,
          isPremium: premiumFilter === 'all' ? undefined : premiumFilter === 'premium',
          sortBy,
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          includeInactive: true,
        }),
        galleryCategoriesService.getAll(),
        galleryService.getCount({
          search: search || undefined,
          category: categoryFilter,
          isPremium: premiumFilter === 'all' ? undefined : premiumFilter === 'premium',
          includeInactive: true,
        }),
      ]);

      setItems(itemsData);
      setCategories(categoriesData);
      setTotalCount(count);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, premiumFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, premiumFilter, sortBy]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: GalleryItemWithCategory) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: {
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    category_id: string;
    image_url: string;
    is_premium: boolean;
    is_featured: boolean;
    is_active: boolean;
  }) => {
    try {
      setFormLoading(true);

      const slug = formData.title_en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);

      const payload = {
        title: formData.title_en,
        slug,
        description: formData.description_en || null,
        image_url: formData.image_url,
        category_id: formData.category_id || null,
        is_premium: formData.is_premium,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        metadata: {
          title_ar: formData.title_ar,
          description_ar: formData.description_ar,
        },
      };

      if (editingItem) {
        await galleryService.update(editingItem.id, payload);
        setNotification({ message: 'Gallery item updated successfully', type: 'success' });
      } else {
        await galleryService.create(payload);
        setNotification({ message: 'Gallery item created successfully', type: 'success' });
      }

      setFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving gallery item:', err);
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to save gallery item',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;

    try {
      setDeleteLoading(true);
      await galleryService.delete(deleteDialog.item.id);
      setNotification({ message: 'Gallery item deleted successfully', type: 'success' });
      setDeleteDialog({ open: false, item: null });
      fetchData();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to delete gallery item',
        type: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (item: GalleryItemWithCategory) => {
    try {
      await galleryService.update(item.id, { is_active: !item.is_active });
      setNotification({
        message: item.is_active ? 'Item unpublished' : 'Item published',
        type: 'success',
      });
      fetchData();
    } catch (err) {
      setNotification({
        message: 'Failed to update item status',
        type: 'error',
      });
    }
  };

  if (loading && items.length === 0) {
    return <LoadingCard message="Loading gallery items..." />;
  }

  if (error && items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display text-white">Gallery Manager</h2>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} item{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium text-sm rounded-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-luxury-black border border-luxury-light/20 rounded-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label_en}
              </option>
            ))}
          </select>

          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value as 'all' | 'premium' | 'free')}
            className="px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="all">All Types</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>

          <button
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Image}
          title="No Gallery Items"
          description={
            search || categoryFilter !== 'all' || premiumFilter !== 'all'
              ? 'No items match your filters. Try adjusting your search criteria.'
              : 'Start building your gallery by adding your first item.'
          }
          action={
            !search && categoryFilter === 'all' && premiumFilter === 'all' ? (
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium font-display rounded-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Gallery Item
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-luxury-black border rounded-sm overflow-hidden group ${
                  item.is_active ? 'border-luxury-light/20' : 'border-red-500/30'
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.is_premium && (
                      <span className="px-2 py-0.5 bg-gold-500/90 text-luxury-black text-xs rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                    {item.is_featured && (
                      <span className="px-2 py-0.5 bg-yellow-500/90 text-luxury-black text-xs rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    {!item.is_active && (
                      <span className="px-2 py-0.5 bg-red-500/90 text-white text-xs rounded-full">
                        Unpublished
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className="p-1.5 bg-luxury-black/80 hover:bg-luxury-light text-white rounded-sm transition-colors"
                      title={item.is_active ? 'Unpublish' : 'Publish'}
                    >
                      {item.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 bg-luxury-black/80 hover:bg-gold-500 text-white hover:text-luxury-black rounded-sm transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ open: true, item })}
                      className="p-1.5 bg-luxury-black/80 hover:bg-red-500 text-white rounded-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
                  {item.categories && (
                    <p className="text-gray-500 text-xs mt-1">{item.categories.label_en}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 rounded-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-sm text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-gold-500 text-luxury-black'
                          : 'bg-luxury-light/10 border border-luxury-light/20 text-gray-400 hover:text-white hover:bg-luxury-light/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 rounded-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      <GalleryForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        item={editingItem}
        categories={categories}
        loading={formLoading}
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Gallery Item"
        message={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, item: null })}
        loading={deleteLoading}
      />
    </div>
  );
}

export default GalleryManager;
