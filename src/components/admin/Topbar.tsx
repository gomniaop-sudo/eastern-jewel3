/**
 * Admin Topbar Component
 */

import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-luxury-black border-b border-luxury-light/20 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-luxury-light/10 rounded-sm transition-colors text-gray-400 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-display text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-luxury-light/10 rounded-sm transition-colors text-gray-400 hover:text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-luxury-light/20">
          <div className="w-8 h-8 rounded-full bg-luxury-light flex items-center justify-center">
            <User className="w-4 h-4 text-gold-500" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-white">{user?.email || 'Admin User'}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
