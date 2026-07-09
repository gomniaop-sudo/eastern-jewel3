/**
 * Admin Newsletter Manager Page
 */

import { Users } from 'lucide-react';
import { EmptyState, LoadingCard } from '../../components/admin';

export function NewsletterManager() {
  const loading = false;
  const subscribers: unknown[] = [];

  if (loading) {
    return <LoadingCard message="Loading subscribers..." />;
  }

  if (subscribers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Subscribers"
        description="Newsletter subscribers will appear here. You can manage your email list and send campaigns."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display text-white">Newsletter Manager</h2>
        <p className="text-gray-500 text-sm mt-1">View and manage your email subscribers</p>
      </div>
      <div className="bg-luxury-black border border-luxury-light/20 rounded-sm overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-luxury-light/20">
            <tr>
              <th className="text-left p-4 text-gray-500 text-sm font-medium">Email</th>
              <th className="text-left p-4 text-gray-500 text-sm font-medium">Date</th>
              <th className="text-left p-4 text-gray-500 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((_, idx) => (
              <tr key={idx} className="border-b border-luxury-light/10">
                <td className="p-4 text-white text-sm">email@example.com</td>
                <td className="p-4 text-gray-400 text-sm">2024-01-01</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NewsletterManager;
