import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  BookOpen,
  Users,
  BarChart2,
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/pendaftaran', icon: FileText, label: 'Pendaftaran' },
  { to: '/admin/placement-test', icon: GraduationCap, label: 'Placement Test' },
  { to: '/admin/kelas', icon: BookOpen, label: 'Manajemen Kelas' },
  { to: '/admin/program', icon: BarChart2, label: 'Program' },
  { to: '/admin/santri', icon: Users, label: 'Data Santri' },
];

export function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 min-h-full hidden md:flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</p>
      </div>
      <nav className="p-2 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = pathname === to || (to !== '/admin' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
