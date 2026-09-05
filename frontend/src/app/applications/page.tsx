'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { studentAPI } from '@/lib/api';
import { FileText, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Application } from '@/types';
import { formatDate, statusColor } from '@/lib/utils';

const statusOrder = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN', 'PLANNING_TO_APPLY'];
const statusIcon: Record<string, React.ReactNode> = {
  SELECTED: <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />,
  REJECTED: <XCircle size={14} className="text-rose-600 flex-shrink-0" />,
  APPLIED: <AlertCircle size={14} className="text-indigo-600 flex-shrink-0" />,
  SHORTLISTED: <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />,
  PLANNING_TO_APPLY: <Clock size={14} className="text-slate-400 flex-shrink-0" />,
};

export default function ApplicationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => { const res = await studentAPI.getApplications(); return res.data; },
    staleTime: 0,
  });

  const applications: Application[] = data?.applications || [];
  const filtered = filter === 'All' ? applications : applications.filter((a) => a.status === filter);

  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Application <span className="gradient-text">Tracker</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">Manage and track your opportunity submission status.</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200 self-start sm:self-auto">
          {applications.length} Applications Total
        </span>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tracked', count: applications.length, color: 'text-slate-900' },
          { label: 'Applied', count: statusCounts['APPLIED'] || 0, color: 'text-indigo-600' },
          { label: 'Shortlisted', count: statusCounts['SHORTLISTED'] || 0, color: 'text-amber-600' },
          { label: 'Selected', count: statusCounts['SELECTED'] || 0, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
            <div className={`text-3xl font-black ${s.color}`}>{s.count}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {['All', ...statusOrder].map((s) => {
          const isSelected = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {s.replace('_', ' ')} {s !== 'All' && statusCounts[s] ? `(${statusCounts[s]})` : ''}
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 shadow-sm transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                  {app.opportunity?.category === 'Internship' ? '💼' :
                   app.opportunity?.category === 'Hackathon' ? '⚡' :
                   app.opportunity?.category === 'Scholarship' ? '🎓' : '🚀'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{app.opportunity?.title}</h3>
                    <span className={`badge border text-xs ${statusColor(app.status)}`}>
                      {statusIcon[app.status]} <span className="ml-1">{app.status?.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{app.opportunity?.organization}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={10} /> Applied on: {formatDate(app.applicationDate)}
                  </p>
                </div>
              </div>

              <Link
                href={`/opportunities/${app.opportunityId}`}
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1 flex-shrink-0"
              >
                View <ArrowUpRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <FileText size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-900">No Applications Tracked</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse active internships, hackathons, and scholarships to submit applications and track them here.
          </p>
          <Link href="/opportunities" className="btn-primary text-xs inline-flex mt-2">
            Browse Opportunities
          </Link>
        </div>
      )}
    </div>
  );
}
