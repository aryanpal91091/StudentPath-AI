'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { opportunityAPI, studentAPI } from '@/lib/api';
import { formatDate, daysUntil, categoryColor, statusColor } from '@/lib/utils';
import { Clock, MapPin, ExternalLink, Bookmark, BookmarkCheck, ArrowLeft, Building2, GraduationCap, Calendar, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OpportunityDetailPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data: opp, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => { const res = await opportunityAPI.byId(id); return res.data; },
    enabled: isAuthenticated && !!id,
  });

  const handleApply = async () => {
    setLoading(true);
    try {
      await studentAPI.updateApplication(id, 'APPLIED');
      setApplied(true);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    await studentAPI.toggleSave(id);
    setSaved(!saved);
  };

  if (isLoading) return (
    <div className="flex min-h-screen bg-[#050816]">
      <Sidebar />
      <div className="flex-1 ml-60 pt-16 p-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    </div>
  );

  if (!opp) return null;
  const days = daysUntil(opp.deadline);

  return (
    <div className="flex min-h-screen bg-[#050816]">
      <Sidebar />
      <div className="flex-1 ml-60 pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/opportunities" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>

          <div className="glass p-8 mb-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className={`badge ${categoryColor(opp.category)}`}>{opp.category}</span>
                  <span className={`badge ${statusColor(opp.status)}`}>{opp.status?.replace('_', ' ')}</span>
                  {opp.mode && <span className="badge bg-slate-700 text-slate-300 border-slate-600">{opp.mode}</span>}
                </div>
                <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{opp.title}</h1>
                <p className="text-indigo-400 font-medium flex items-center gap-1">
                  <Building2 size={14} /> {opp.organization}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-ghost flex items-center gap-2">
                  {saved ? <BookmarkCheck size={16} className="text-yellow-400" /> : <Bookmark size={16} />}
                  {saved ? 'Saved' : 'Save'}
                </button>
                {applied ? (
                  <div className="btn-primary flex items-center gap-2 opacity-80 cursor-default"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    <CheckCircle size={16} /> Applied!
                  </div>
                ) : (
                  <button onClick={handleApply} disabled={loading} className="btn-primary flex items-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                    Apply Now
                  </button>
                )}
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Deadline', value: opp.deadline ? formatDate(opp.deadline) : 'Rolling', icon: Calendar, urgent: days <= 7 },
                { label: 'Location', value: opp.location || 'Remote', icon: MapPin },
                { label: 'Education', value: opp.education || 'Any', icon: GraduationCap },
                { label: 'Year', value: `Year ${opp.minYear}–${opp.maxYear}`, icon: Clock },
              ].map((info) => (
                <div key={info.label} className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                    <info.icon size={12} /> {info.label}
                  </div>
                  <div className={`text-sm font-semibold ${(info as any).urgent ? 'text-red-400' : 'text-white'}`}>{info.value}</div>
                </div>
              ))}
            </div>

            {/* Stipend / Prize */}
            {(opp.stipend || opp.prize) && (
              <div className="flex gap-4 mb-6">
                {opp.stipend && <div className="px-4 py-2 rounded-xl text-sm font-bold text-green-300" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>💰 Stipend: {opp.stipend}</div>}
                {opp.prize && <div className="px-4 py-2 rounded-xl text-sm font-bold text-yellow-300" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>🏆 Prize: {opp.prize}</div>}
                {opp.fee > 0 && <div className="px-4 py-2 rounded-xl text-sm font-bold text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>💳 Fee: ₹{opp.fee}</div>}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">About this Opportunity</h2>
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{opp.description}</p>
            </div>

            {/* Skills */}
            {opp.skills && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.split(',').map((s: string) => (
                    <span key={s} className="badge bg-indigo-500/10 text-indigo-300 border-indigo-500/30">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Branch */}
            {opp.branch && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Eligible Branches</h2>
                <p className="text-slate-300 text-sm">{opp.branch}</p>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-4 pt-4 border-t border-slate-800">
              {opp.url && (
                <a href={opp.url} target="_blank" rel="noopener noreferrer"
                  className="btn-ghost flex items-center gap-2 text-sm">
                  <ExternalLink size={14} /> Official Link
                </a>
              )}
              {applied ? (
                <div className="btn-primary flex items-center gap-2 opacity-80"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                  <CheckCircle size={16} /> Application Tracked
                </div>
              ) : (
                <button onClick={handleApply} disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : '🚀'} Track Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
