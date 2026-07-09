/**
 * Admin Settings Manager Page
 */

import { Settings } from 'lucide-react';
import { EmptyState, LoadingCard } from '../../components/admin';

export function SettingsManager() {
  const loading = false;
  const settings: unknown[] = [];

  if (loading) {
    return <LoadingCard message="Loading settings..." />;
  }

  if (settings.length === 0) {
    return (
      <EmptyState
        icon={Settings}
        title="Site Settings"
        description="Configure your website settings, including site name, description, and other options."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display text-white">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage site configuration</p>
      </div>
      <div className="bg-luxury-black border border-luxury-light/20 rounded-sm p-6">
        <p className="text-gray-400 text-sm">Settings configuration will be available here.</p>
      </div>
    </div>
  );
}

export default SettingsManager;
