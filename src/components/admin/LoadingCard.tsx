/**
 * Loading Card Component
 */

import { Loader as Loader2 } from 'lucide-react';

interface LoadingCardProps {
  message?: string;
}

export function LoadingCard({ message = 'Loading...' }: LoadingCardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-luxury-black border border-luxury-light/20 rounded-sm">
      <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-4" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

export default LoadingCard;
