/**
 * Admin Journal Manager Page - Full CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Search, ArrowUpDown, CreditCard as Edit2, Trash2, Star, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import {
  EmptyState, LoadingCard, ConfirmDialog, Notification
} from '../../components/admin';
import { JournalForm } from '../../components/admin/JournalForm';
import { journalService, type JournalEntryRow } from '../../services';
import { isSupabaseConfigured } from '../../lib';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ITEMS_PER_PAGE = 20;

export function JournalManager() {
  const [articles, setArticles] = useState<JournalEntryRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<JournalEntryRow | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; article: JournalEntryRow | null }>({
    open: false,
    article: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setArticles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [articlesData, categoriesData, count] = await Promise.all([
        journalService.getAllAdmin({
          search: search || undefined,
          category: categoryFilter,
          isPublished: statusFilter === 'all' ? undefined : statusFilter === 'published',
          sortBy,
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
        }),
        journalService.getCategories(),
        journalService.getCount({
          search: search || undefined,
          category: categoryFilter,
          isPublished: statusFilter === 'all' ? undefined : statusFilter === 'published',
        }),
      ]);

      setArticles(articlesData);
      setCategories(categoriesData);
      setTotalCount(count);
    } catch (err) {
      console.error('Error loading articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, sortBy]);

  const handleCreate = () => {
    setEditingArticle(null);
    setFormOpen(true);
  };

  const handleEdit = (article: JournalEntryRow) => {
    setEditingArticle(article);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: {
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
  }) => {
    try {
      setFormLoading(true);

      const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

      const payload = {
        title: formData.title_en,
        slug: formData.slug,
        excerpt: formData.excerpt_en || null,
        content: formData.content_en,
        image_url: formData.image_url || null,
        category: formData.category || null,
        tags: tags.length > 0 ? tags : null,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        published_at: formData.is_published && !editingArticle?.published_at
          ? new Date().toISOString()
          : editingArticle?.published_at,
        metadata: {
          title_ar: formData.title_ar,
          excerpt_ar: formData.excerpt_ar,
          content_ar: formData.content_ar,
        },
      };

      if (editingArticle) {
        await journalService.update(editingArticle.id, payload);
        setNotification({ message: 'Article updated successfully', type: 'success' });
      } else {
        await journalService.create(payload);
        setNotification({ message: 'Article created successfully', type: 'success' });
      }

      setFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving article:', err);
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to save article',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.article) return;

    try {
      setDeleteLoading(true);
      await journalService.delete(deleteDialog.article.id);
      setNotification({ message: 'Article deleted successfully', type: 'success' });
      setDeleteDialog({ open: false, article: null });
      fetchData();
    } catch (err) {
      console.error('Error deleting article:', err);
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to delete article',
        type: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleFeatured = async (article: JournalEntryRow) => {
    try {
      await journalService.update(article.id, { is_featured: !article.is_featured });
      setNotification({
        message: article.is_featured ? 'Removed from featured' : 'Added to featured',
        type: 'success',
      });
      fetchData();
    } catch (err) {
      setNotification({
        message: 'Failed to update article',
        type: 'error',
      });
    }
  };

  const handleCheckSlug = async (slug: string): Promise<boolean> => {
    return journalService.checkSlugUnique(slug, editingArticle?.id);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not published';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && articles.length === 0) {
    return <LoadingCard message="Loading articles..." />;
  }

  if (error && articles.length === 0) {
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
          <h2 className="text-xl font-display text-white">Journal Manager</h2>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} article{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium text-sm rounded-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Article
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
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="px-3 py-2 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
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

      {articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Articles"
          description={
            search || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No articles match your filters. Try adjusting your search criteria.'
              : 'Start your journal by creating your first article.'
          }
          action={
            !search && categoryFilter === 'all' && statusFilter === 'all' ? (
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium font-display rounded-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Article
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`bg-luxury-black border rounded-sm p-4 flex gap-4 ${
                  article.is_published ? 'border-luxury-light/20' : 'border-yellow-500/30'
                }`}
              >
                {article.image_url && (
                  <div className="hidden sm:block w-24 h-24 rounded-sm overflow-hidden bg-luxury-light/10 flex-shrink-0">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-medium truncate">{article.title}</h3>
                        {article.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-500/90 text-luxury-black text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                        {!article.is_published && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatDate(article.published_at)}</span>
                        {article.category && (
                          <>
                            <span>/</span>
                            <span>{article.category}</span>
                          </>
                        )}
                        <span>/</span>
                        <span>{article.view_count || 0} views</span>
                      </div>
                      {article.excerpt && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
                      )}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.tags.slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-luxury-light/10 text-gray-400 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 4 && (
                            <span className="text-gray-500 text-xs">+{article.tags.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {article.is_published && (
                        <a
                          href={`/journal/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-luxury-light/10 rounded-sm text-gray-400 hover:text-white transition-colors"
                          title="View public page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleFeatured(article)}
                        className={`p-2 rounded-sm transition-colors ${
                          article.is_featured
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'hover:bg-luxury-light/10 text-gray-400 hover:text-yellow-400'
                        }`}
                        title={article.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 hover:bg-gold-500/20 rounded-sm text-gray-400 hover:text-gold-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, article })}
                        className="p-2 hover:bg-red-500/20 rounded-sm text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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

      <JournalForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleFormSubmit}
        item={editingArticle}
        categories={categories}
        loading={formLoading}
        onCheckSlug={handleCheckSlug}
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteDialog.article?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, article: null })}
        loading={deleteLoading}
      />
    </div>
  );
}

export default JournalManager;
