/**
 * Empty State Component
 */

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-luxury-light/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-display text-white mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm text-center max-w-md mb-4">{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
