'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Bell, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200"
      style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="gradient-text">StudentPath</span>
              <span className="text-slate-500 text-sm ml-1 font-semibold">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link href="/#features" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">Features</Link>
                <Link href="/#counsellors" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors">Counsellors</Link>
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Get Started Free</Link>
              </>
            ) : (
              <>
                {user?.role === 'STUDENT' && (
                  <>
                    <Link href="/opportunities" className={`text-sm font-medium transition-colors ${pathname.startsWith('/opportunities') ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}`}>Opportunities</Link>
                    <Link href="/career-guidance" className={`text-sm font-medium transition-colors ${pathname === '/career-guidance' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}`}>Career AI</Link>
                    <Link href="/counsellors" className={`text-sm font-medium transition-colors ${pathname.startsWith('/counsellors') ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'}`}>Counsellors</Link>
                  </>
                )}
                <div className="flex items-center gap-3">
                  {user?.role === 'STUDENT' && !user?.studentProfile?.premiumStatus && (
                    <Link href="/premium" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: 'white' }}>
                      <Sparkles size={12} /> Upgrade
                    </Link>
                  )}
                  <button className="text-slate-500 hover:text-slate-800 transition-colors relative p-1.5 rounded-lg hover:bg-slate-100">
                    <Bell size={18} />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-600 rounded-full text-[8px] flex items-center justify-center text-white font-bold">3</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                      {(user?.studentProfile?.name || user?.counsellorProfile?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100" title="Logout">
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 py-4 space-y-2 bg-white shadow-lg">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="btn-primary block text-center text-sm mt-2" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/opportunities" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Opportunities</Link>
              <Link href="/career-guidance" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Career AI</Link>
              <Link href="/roadmap" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>My Roadmap</Link>
              <Link href="/counsellors" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Counsellors</Link>
              <Link href="/applications" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Applications</Link>
              <Link href="/settings" className="block text-slate-700 py-2 text-sm font-medium hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Settings</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left text-rose-600 py-2 text-sm font-medium border-t border-slate-100 mt-2 pt-3">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
