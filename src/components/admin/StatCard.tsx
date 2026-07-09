/**
 * Stat Card Component
 */

import { Loader as Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string | null;
  icon: React.ElementType;
  loading?: boolean;
  trend?: { value: number; isPositive: boolean };
}

export function StatCard({ title, value, icon: Icon, loading, trend }: StatCardProps) {
  return (
    <div className="bg-luxury-black border border-luxury-light/20 rounded-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          {loading ? (
            <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
          ) : (
            <p className="text-3xl font-display text-white">{value ?? 0}</p>
          )}
          {trend && !loading && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-sm bg-gold-500/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gold-500" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
