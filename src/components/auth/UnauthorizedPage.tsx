/**
 * Unauthorized Page Component
 */

import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Hop as Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-luxury-black border-2 border-red-500/30 flex items-center justify-center mx-auto">
              <ShieldX className="w-16 h-16 text-red-500" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl font-bold"
            >
              403
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-display text-white mb-4"
        >
          Access Denied
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-gray-400">
            You don't have permission to access this page.
          </p>

          {isAuthenticated && user && (
            <div className="p-4 bg-luxury-black border border-luxury-light/20 rounded-sm">
              <p className="text-gray-500 text-sm mb-2">You are signed in as:</p>
              <p className="text-white font-medium">{user.email}</p>
              <p className="text-gray-400 text-sm mt-1">
                Role: <span className="text-gold-400">{(user.user_metadata?.role as string) || 'viewer'}</span>
              </p>
            </div>
          )}

          <p className="text-gray-500 text-sm">
            Contact your administrator if you believe this is an error.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium rounded-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white font-medium rounded-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-8 border-t border-luxury-light/10"
        >
          <p className="text-gray-600 text-xs">
            Eastern Jewel Admin Panel &bull; RBAC Protected
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default UnauthorizedPage;
