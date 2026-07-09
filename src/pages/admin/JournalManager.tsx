/**
 * Admin Journal Manager Page
 */

import { Plus, FileText } from 'lucide-react';
import { EmptyState, LoadingCard } from '../../components/admin';

export function JournalManager() {
  const loading = false;
  const items: unknown[] = [];

  if (loading) {
    return <LoadingCard message="Loading journal entries..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Journal Entries"
        description="Create your first journal entry to share stories and insights with your audience."
        action={
          <button className="mt-4 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium font-display rounded-sm transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Entry
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display text-white">Journal Manager</h2>
          <p className="text-gray-500 text-sm mt-1">Create and manage journal entries</p>
        </div>
        <button className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium text-sm rounded-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>
      <div className="space-y-4">
        {items.map((_, idx) => (
          <div key={idx} className="bg-luxury-black border border-luxury-light/20 rounded-sm p-4">
            <p className="text-white">Entry Title</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JournalManager;
