/**
 * Admin Sidebar Component
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  FileText,
  Mail,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/gallery', icon: Image, label: 'Gallery' },
  { to: '/admin/journal', icon: FileText, label: 'Journal' },
  { to: '/admin/messages', icon: Mail, label: 'Messages' },
  { to: '/admin/newsletter', icon: Users, label: 'Newsletter' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/profile', icon: User, label: 'Profile' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-luxury-black border-r border-luxury-light/20 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-luxury-light/20">
          {!collapsed && (
            <span className="text-gold-500 font-display text-xl">Admin</span>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-luxury-light/10 rounded-sm transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 mx-2 rounded-sm transition-all ${
                      isActive
                        ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500'
                        : 'text-gray-400 hover:text-white hover:bg-luxury-light/10'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-luxury-light/20">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-2 py-3 rounded-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
