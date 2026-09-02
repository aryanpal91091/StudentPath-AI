'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { counsellorAPI } from '@/lib/api';
import { Clock, Save, CheckCircle, Loader2 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '19:00-20:00'];

export default function AvailabilityPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'COUNSELLOR') router.push('/dashboard');
  }, [isAuthenticated, user, router]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const availability = Array.from(selected).join(', ');
    try {
      await counsellorAPI.updateAvailability({ availability });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Set <span className="gradient-text">Availability</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Choose the times you're available for student sessions</p>
          </div>

          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={16} className="text-indigo-400" />
              <span className="text-sm text-slate-300">Click on a time slot to toggle availability. Green = available.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-xs text-slate-500 font-semibold text-left pb-3 pr-3">Day</th>
                    {slots.map((s) => (
                      <th key={s} className="text-xs text-slate-500 font-semibold pb-3 px-1 text-center whitespace-nowrap">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {days.map((day) => (
                    <tr key={day} className="border-t border-slate-800">
                      <td className="py-2 pr-3 text-sm text-slate-400 font-medium whitespace-nowrap">{day}</td>
                      {slots.map((slot) => {
                        const key = `${day}-${slot}`;
                        const active = selected.has(key);
                        return (
                          <td key={slot} className="py-2 px-1 text-center">
                            <button
                              onClick={() => toggle(key)}
                              className={`w-full h-9 rounded-lg text-xs font-medium border transition-all ${active
                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                : 'border-slate-800 hover:border-indigo-500/40 text-slate-700 hover:text-slate-500'}`}>
                              {active ? '✓' : '–'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                {selected.size} slot{selected.size !== 1 ? 's' : ''} selected
              </p>
              <button onClick={handleSave} disabled={saving || selected.size === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
                {saved ? 'Saved!' : 'Save Availability'}
              </button>
            </div>
          </div>
    </div>
  );
}
