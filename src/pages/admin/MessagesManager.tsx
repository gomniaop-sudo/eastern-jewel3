/**
 * Admin Messages Manager Page
 */

import { Mail } from 'lucide-react';
import { EmptyState, LoadingCard } from '../../components/admin';

export function MessagesManager() {
  const loading = false;
  const messages: unknown[] = [];

  if (loading) {
    return <LoadingCard message="Loading messages..." />;
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No Messages"
        description="Messages from the contact form will appear here. You can read, reply, and manage all communications."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display text-white">Messages</h2>
        <p className="text-gray-500 text-sm mt-1">Manage contact form submissions</p>
      </div>
      <div className="space-y-4">
        {messages.map((_, idx) => (
          <div key={idx} className="bg-luxury-black border border-luxury-light/20 rounded-sm p-4">
            <p className="text-white">Message Subject</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessagesManager;
