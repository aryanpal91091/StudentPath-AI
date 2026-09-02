'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;
      setAuth(user, token);
      if (user.role === 'STUDENT') router.push('/dashboard');
      else if (user.role === 'COUNSELLOR') router.push('/counsellor/dashboard');
      else router.push('/admin');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setForm({ email, password });
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      setAuth(user, token);
      if (user.role === 'STUDENT') router.push('/dashboard');
      else if (user.role === 'COUNSELLOR') router.push('/counsellor/dashboard');
      else router.push('/admin');
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Welcome back</h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to continue your journey</p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="glass p-4 mb-6 space-y-2">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '🎓 Student', email: 'student@studentpath.ai', pwd: 'Student@123' },
              { label: '👩‍🏫 Counsellor', email: 'counsellor@studentpath.ai', pwd: 'Counsellor@123' },
              { label: '🔧 Admin', email: 'admin@studentpath.ai', pwd: 'Admin@123' },
            ].map((d) => (
              <button key={d.label} onClick={() => quickLogin(d.email, d.pwd)}
                className="btn-ghost text-xs py-2 px-2 text-center">
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPwd ? 'text' : 'password'} required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
