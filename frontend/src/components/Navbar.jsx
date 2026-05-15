import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <nav className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
            <BookOpen size={24} />
            <span className="hidden sm:block">Lembaga Qur'an</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/program" className="text-sm text-primary-200 hover:text-white transition-colors">
              Program
            </Link>
            {user ? (
              <>
                <span className="text-sm text-primary-200">Halo, {user.name.split(' ')[0]}</span>
                <Link to={dashboardLink} className="flex items-center gap-1.5 text-sm hover:text-primary-200 transition-colors">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm hover:text-primary-200 transition-colors"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-primary-200 transition-colors">
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-1" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary-800 px-4 py-3 space-y-2 border-t border-primary-600">
          <Link to="/program" className="block text-sm py-2 text-primary-200 hover:text-white" onClick={() => setOpen(false)}>
            Program
          </Link>
          {user ? (
            <>
              <Link to={dashboardLink} className="block text-sm py-2 hover:text-primary-200" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block text-sm py-2 w-full text-left hover:text-primary-200">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm py-2" onClick={() => setOpen(false)}>Masuk</Link>
              <Link to="/register" className="block text-sm py-2" onClick={() => setOpen(false)}>Daftar</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
