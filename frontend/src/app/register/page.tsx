'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, GraduationCap, Users, Shield } from 'lucide-react';

const roles = [
  { id: 'STUDENT', label: 'Student', desc: 'Looking for opportunities & guidance', icon: GraduationCap, color: 'indigo' },
  { id: 'COUNSELLOR', label: 'Counsellor', desc: 'Guide students in their career', icon: Users, color: 'purple' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'STUDENT' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authAPI.register({ email: form.email, password: form.password, role: form.role });
      router.push(form.role === 'STUDENT' ? '/onboarding' : '/login?registered=true');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Create your account</h1>
          <p className="text-slate-400 mt-2 text-sm">Start your journey — completely free</p>
        </div>

        <div className="glass p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button key={r.id} type="button"
                    onClick={() => setForm({ ...form, role: r.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${form.role === r.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-indigo-500/50'}`}>
                    <r.icon size={18} className={form.role === r.id ? 'text-indigo-400' : 'text-slate-500'} />
                    <div className="text-sm font-semibold text-white mt-2">{r.label}</div>
                    <div className="text-xs text-slate-500">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPwd ? 'text' : 'password'} required className="input-field pl-10 pr-10"
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" required className="input-field pl-10"
                  placeholder="Repeat password"
                  value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
