/**
 * Suspense Wrapper Component
 * Elegant loading fallback for lazy-loaded pages
 */

import { Suspense, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PageSkeleton, DashboardSkeleton, ImageGridSkeleton, Skeleton } from './Skeleton';

interface SuspenseWrapperProps {
  children: ReactNode;
  type?: 'page' | 'dashboard' | 'gallery' | 'content' | 'minimal';
}

const loadingVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function LoadingSpinner() {
  return (
    <motion.div
      variants={loadingVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[400px]"
    >
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
      <span className="text-gray-400">Loading...</span>
    </motion.div>
  );
}

export function SuspenseWrapper({ children, type = 'page' }: SuspenseWrapperProps) {
  const getFallback = () => {
    switch (type) {
      case 'dashboard':
        return (
          <motion.div
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DashboardSkeleton />
          </motion.div>
        );
      case 'gallery':
        return (
          <motion.div
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pt-24"
          >
            <ImageGridSkeleton />
          </motion.div>
        );
      case 'content':
        return (
          <motion.div
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center py-20"
          >
            <Skeleton className="w-10 h-10 rounded-full mb-4" />
            <Skeleton className="h-4 w-24" />
          </motion.div>
        );
      case 'minimal':
        return <LoadingSpinner />;
      case 'page':
      default:
        return <PageSkeleton />;
    }
  };

  return (
    <Suspense fallback={getFallback()}>
      {children}
    </Suspense>
  );
}

export default SuspenseWrapper;
