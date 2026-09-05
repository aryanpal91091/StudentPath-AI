'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { studentAPI } from '@/lib/api';
import { User, Save, Loader2, CheckCircle, Shield, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const profile = user?.studentProfile;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    location: profile?.location || '',
    branch: profile?.branch || '',
    year: profile?.year || 1,
    cgpa: profile?.cgpa || '',
    stream: profile?.stream || '',
    careerInterests: profile?.careerInterests || '',
    opportunityPreference: profile?.opportunityPreference || '',
    timeAvailability: profile?.timeAvailability || '',
  });

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 py-2 sm:py-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Profile <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage your academic profile, stream, and opportunity preferences.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
          {form.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="font-bold text-slate-900 text-base">{form.name || 'Your Name'}</div>
          <div className="text-xs text-slate-500 font-medium">{user?.email}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`badge border text-xs ${user?.studentProfile?.premiumStatus ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-semibold'}`}>
              {user?.studentProfile?.premiumStatus ? '👑 Premium Member' : '🆓 Free Plan'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
          <User size={18} className="text-indigo-600" /> Academic & Personal Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stream</label>
            <input className="input-field" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Branch / Specialization</label>
            <input className="input-field" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Academic Year</label>
            <select className="input-field cursor-pointer" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Year {n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">CGPA / Percentage</label>
            <input className="input-field" type="number" step="0.1" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location (City)</label>
            <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Career Interests (comma separated)</label>
            <input className="input-field" placeholder="e.g. Technology, AI/ML, Research"
              value={form.careerInterests} onChange={(e) => setForm({ ...form, careerInterests: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Opportunity Preference</label>
            <select className="input-field cursor-pointer" value={form.opportunityPreference} onChange={(e) => setForm({ ...form, opportunityPreference: e.target.value })}>
              {['Internships', 'Hackathons', 'Scholarships', 'Research', 'All'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time Availability</label>
            <select className="input-field cursor-pointer" value={form.timeAvailability} onChange={(e) => setForm({ ...form, timeAvailability: e.target.value })}>
              {['Part-time', 'Full-time', 'Weekends', 'Flexible'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 font-semibold text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <><CheckCircle size={16} /> Profile Saved Successfully!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
