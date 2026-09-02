'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Bell, LogOut, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
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

  const isPublic = !isAuthenticated || pathname === '/' || pathname === '/login' || pathname === '/register';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-indigo-500/10"
      style={{ background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="gradient-text">StudentPath</span>
              <span className="text-slate-400 text-sm ml-1">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link href="/#features" className="text-slate-400 hover:text-white text-sm transition-colors">Features</Link>
                <Link href="/#counsellors" className="text-slate-400 hover:text-white text-sm transition-colors">Counsellors</Link>
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Get Started Free</Link>
              </>
            ) : (
              <>
                {user?.role === 'STUDENT' && (
                  <>
                    <Link href="/opportunities" className={`text-sm transition-colors ${pathname.startsWith('/opportunities') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>Opportunities</Link>
                    <Link href="/career-guidance" className={`text-sm transition-colors ${pathname === '/career-guidance' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>Career AI</Link>
                    <Link href="/counsellors" className={`text-sm transition-colors ${pathname.startsWith('/counsellors') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>Counsellors</Link>
                  </>
                )}
                <div className="flex items-center gap-3">
                  {user?.role === 'STUDENT' && !user?.studentProfile?.premiumStatus && (
                    <Link href="/premium" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white' }}>
                      <Sparkles size={12} /> Upgrade
                    </Link>
                  )}
                  <button className="text-slate-400 hover:text-white transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full text-[8px] flex items-center justify-center text-white">3</span>
                  </button>
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {(user?.studentProfile?.name || user?.counsellorProfile?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-indigo-500/10 px-4 py-4 space-y-2"
          style={{ background: 'rgba(5, 8, 22, 0.95)' }}>
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="block text-slate-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="btn-primary block text-center text-sm mt-2" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="block text-slate-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/opportunities" className="block text-slate-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Opportunities</Link>
              <Link href="/counsellors" className="block text-slate-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Counsellors</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-red-400 py-2 text-sm">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
