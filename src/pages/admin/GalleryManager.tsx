/**
 * Admin Gallery Manager Page
 */

import { Plus, Image } from 'lucide-react';
import { EmptyState, LoadingCard } from '../../components/admin';

export function GalleryManager() {
  const loading = false;
  const items: unknown[] = [];

  if (loading) {
    return <LoadingCard message="Loading gallery items..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Image}
        title="No Gallery Items"
        description="Start building your gallery by adding your first item. Each item can include images, descriptions, and category tags."
        action={
          <button className="mt-4 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium font-display rounded-sm transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Gallery Item
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display text-white">Gallery Manager</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your gallery items and collections</p>
        </div>
        <button className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium text-sm rounded-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((_, idx) => (
          <div key={idx} className="bg-luxury-black border border-luxury-light/20 rounded-sm p-4">
            <div className="aspect-[3/4] bg-luxury-light/10 rounded-sm mb-3"></div>
            <p className="text-white text-sm">Item Title</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GalleryManager;
