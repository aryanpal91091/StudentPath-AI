'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { studentAPI } from '@/lib/api';
import { User, Save, Loader2, CheckCircle } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Profile <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Update your academic profile and preferences</p>
          </div>

          {/* Avatar */}
          <div className="glass p-6 mb-5 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {form.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-bold text-white">{form.name || 'Your Name'}</div>
              <div className="text-sm text-slate-400">{user?.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge text-xs ${user?.studentProfile?.premiumStatus ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-slate-700 text-slate-400'}`}>
                  {user?.studentProfile?.premiumStatus ? '👑 Premium' : '🆓 Free Plan'}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass p-6 space-y-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <User size={16} className="text-indigo-400" /> Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-2">Full Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Stream</label>
                <input className="input-field" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Branch</label>
                <input className="input-field" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Year</label>
                <select className="input-field" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Year {n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">CGPA</label>
                <input className="input-field" type="number" step="0.1" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-2">Location (City)</label>
                <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-2">Career Interests (comma-separated)</label>
                <input className="input-field" placeholder="e.g. Technology, AI/ML, Research"
                  value={form.careerInterests} onChange={(e) => setForm({ ...form, careerInterests: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Opportunity Preference</label>
                <select className="input-field" value={form.opportunityPreference} onChange={(e) => setForm({ ...form, opportunityPreference: e.target.value })}>
                  {['Internships', 'Hackathons', 'Scholarships', 'Research', 'All'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Time Availability</label>
                <select className="input-field" value={form.timeAvailability} onChange={(e) => setForm({ ...form, timeAvailability: e.target.value })}>
                  {['Part-time', 'Full-time', 'Weekends', 'Flexible'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
    </div>
  );
}
