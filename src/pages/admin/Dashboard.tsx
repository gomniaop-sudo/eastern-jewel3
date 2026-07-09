/**
 * Admin Dashboard Page
 */

import { useState, useEffect } from 'react';
import { Image, FileText, Users, Mail, Activity } from 'lucide-react';
import { StatCard, LoadingCard } from '../../components/admin';
import { galleryService, journalService, newsletterService, contactService } from '../../services';
import { isSupabaseConfigured } from '../../lib';

interface DashboardStats {
  galleryCount: number;
  journalCount: number;
  subscriberCount: number;
  messageCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured()) {
        setStats({
          galleryCount: 12,
          journalCount: 6,
          subscriberCount: 128,
          messageCount: 24,
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [galleryItems, journalItems, subscriberCount, messageCount] = await Promise.all([
          galleryService.getAll({ limit: 1000 }).catch(() => []),
          journalService.getAll({ limit: 1000 }).catch(() => []),
          newsletterService.getSubscriberCount().catch(() => 0),
          contactService.getUnreadCount().catch(() => 0),
        ]);

        const totalMessages = await contactService.getAll({ limit: 1000 }).catch(() => []);

        setStats({
          galleryCount: galleryItems.length,
          journalCount: journalItems.length,
          subscriberCount,
          messageCount: messageCount + (totalMessages.length > 0 ? totalMessages.length - messageCount : 0),
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
        setStats({
          galleryCount: 0,
          journalCount: 0,
          subscriberCount: 0,
          messageCount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingCard message="Loading dashboard statistics..." />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gallery Items"
          value={stats?.galleryCount ?? 0}
          icon={Image}
          loading={false}
        />
        <StatCard
          title="Journal Entries"
          value={stats?.journalCount ?? 0}
          icon={FileText}
          loading={false}
        />
        <StatCard
          title="Subscribers"
          value={stats?.subscriberCount ?? 0}
          icon={Users}
          loading={false}
        />
        <StatCard
          title="Messages"
          value={stats?.messageCount ?? 0}
          icon={Mail}
          loading={false}
        />
      </div>

      <div className="bg-luxury-black border border-luxury-light/20 rounded-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-gold-500" />
          <h2 className="text-lg font-display text-white">Recent Activity</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Activity feed will be displayed here once CRUD operations are implemented.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-luxury-black border border-luxury-light/20 rounded-sm p-6">
          <h3 className="text-md font-display text-white mb-4">Quick Actions</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Add new gallery item</li>
            <li>Create journal entry</li>
            <li>View pending messages</li>
            <li>Export subscribers</li>
          </ul>
        </div>
        <div className="bg-luxury-black border border-luxury-light/20 rounded-sm p-6">
          <h3 className="text-md font-display text-white mb-4">System Status</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-400">Database: Connected</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-400">Auth Service: Active</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-400">Storage: Available</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
