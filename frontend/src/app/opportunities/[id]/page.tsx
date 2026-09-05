'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={36} className="animate-spin text-indigo-600" />
    </div>
  );

  if (!opp) return null;
  const days = daysUntil(opp.deadline);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link href="/opportunities" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 text-xs sm:text-sm font-semibold transition-colors">
        <ArrowLeft size={16} /> Back to Opportunities
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge ${categoryColor(opp.category)}`}>{opp.category}</span>
              <span className={`badge ${statusColor(opp.status)}`}>{opp.status?.replace('_', ' ')}</span>
              {opp.mode && <span className="badge bg-slate-100 text-slate-700 border-slate-200">{opp.mode}</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{opp.title}</h1>
            <p className="text-indigo-600 font-bold flex items-center gap-1.5 text-sm sm:text-base">
              <Building2 size={16} /> {opp.organization}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button onClick={handleSave} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition-all">
              {saved ? <BookmarkCheck size={16} className="text-amber-500 fill-amber-100" /> : <Bookmark size={16} />}
              {saved ? 'Saved' : 'Save'}
            </button>
            {applied ? (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" /> Applied!
              </div>
            ) : (
              <button onClick={handleApply} disabled={loading} className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          {[
            { label: 'Deadline', value: opp.deadline ? formatDate(opp.deadline) : 'Rolling', icon: Calendar, urgent: days <= 7 },
            { label: 'Location', value: opp.location || 'Remote', icon: MapPin },
            { label: 'Education', value: opp.education || 'Any', icon: GraduationCap },
            { label: 'Year', value: `Year ${opp.minYear}–${opp.maxYear}`, icon: Clock },
          ].map((info) => (
            <div key={info.label} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-1">
                <info.icon size={13} className="text-indigo-600" /> {info.label}
              </div>
              <div className={`text-xs sm:text-sm font-bold ${(info as any).urgent ? 'text-red-600' : 'text-slate-900'}`}>{info.value}</div>
            </div>
          ))}
        </div>

        {/* Stipend / Prize */}
        {(opp.stipend || opp.prize) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {opp.stipend && <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">💰 Stipend: {opp.stipend}</div>}
            {opp.prize && <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200">🏆 Prize: {opp.prize}</div>}
            {opp.fee > 0 && <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-red-800 bg-red-50 border border-red-200">💳 Fee: ₹{opp.fee}</div>}
          </div>
        )}

        {/* Description */}
        <div className="mb-6 space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">About this Opportunity</h2>
          <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">{opp.description}</p>
        </div>

        {/* Skills */}
        {opp.skills && (
          <div className="mb-6 space-y-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {opp.skills.split(',').map((s: string) => (
                <span key={s} className="badge bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Branch */}
        {opp.branch && (
          <div className="mb-6 space-y-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligible Branches</h2>
            <p className="text-slate-800 text-sm font-medium">{opp.branch}</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-4 pt-5 border-t border-slate-100">
          {opp.url && (
            <a href={opp.url} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition-all">
              <ExternalLink size={15} /> Official Website Link
            </a>
          )}
          {applied ? (
            <div className="px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" /> Application Tracked
            </div>
          ) : (
            <button onClick={handleApply} disabled={loading} className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5">
              {loading ? <Loader2 size={16} className="animate-spin" /> : '🚀'} Track Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

