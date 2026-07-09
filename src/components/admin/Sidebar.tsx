/**
 * Admin Sidebar Component with RBAC
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image, FileText, Mail, Users, Settings, LogOut, ChevronLeft, User, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { type Permission, ROUTE_PERMISSIONS } from '../../lib/rbac';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  labelKey: string;
  end?: boolean;
  permission?: Permission;
}

const allNavItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', labelKey: 'admin.nav.dashboard', end: true },
  { to: '/admin/gallery', icon: Image, label: 'Gallery', labelKey: 'admin.nav.gallery' },
  { to: '/admin/journal', icon: FileText, label: 'Journal', labelKey: 'admin.nav.journal' },
  { to: '/admin/messages', icon: Mail, label: 'Messages', labelKey: 'admin.nav.messages' },
  { to: '/admin/newsletter', icon: Users, label: 'Newsletter', labelKey: 'admin.nav.newsletter' },
  { to: '/admin/media', icon: ImageIcon, label: 'Media Library', labelKey: 'admin.nav.media' },
  { to: '/admin/settings', icon: Settings, label: 'Settings', labelKey: 'admin.nav.settings' },
  { to: '/admin/profile', icon: User, label: 'Profile', labelKey: 'admin.nav.profile' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { signOut, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const visibleNavItems = allNavItems.filter((item) => {
    if (item.label === 'Profile') return true;
    const permission = ROUTE_PERMISSIONS[item.to];
    if (permission) return hasPermission(permission);
    return true;
  });

  return (
    <aside
      role="navigation"
      aria-label={t('accessibility.admin_navigation', 'Admin navigation')}
      className={`fixed left-0 top-0 h-full bg-luxury-black border-r border-luxury-light/20 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-luxury-light/20">
          {!collapsed && (
            <span className="text-gold-500 font-display text-xl" aria-label="Admin Panel">Admin</span>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-luxury-light/10 rounded-sm transition-colors text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            aria-label={collapsed ? t('accessibility.expand_sidebar', 'Expand sidebar') : t('accessibility.collapse_sidebar', 'Collapse sidebar')}
            aria-expanded={!collapsed}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1" role="list">
            {visibleNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  aria-label={t(item.labelKey, item.label)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 mx-2 rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      isActive
                        ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500'
                        : 'text-gray-400 hover:text-white hover:bg-luxury-light/10'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="text-sm font-medium">{t(item.labelKey, item.label)}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-luxury-light/20">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-2 py-3 rounded-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={t('admin.sign_out', 'Sign out')}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span className="text-sm">{t('admin.sign_out', 'Sign Out')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
