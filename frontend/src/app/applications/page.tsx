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
  SELECTED: <CheckCircle size={14} className="text-green-400" />,
  REJECTED: <XCircle size={14} className="text-red-400" />,
  APPLIED: <AlertCircle size={14} className="text-blue-400" />,
  SHORTLISTED: <AlertCircle size={14} className="text-yellow-400" />,
  PLANNING_TO_APPLY: <Clock size={14} className="text-slate-400" />,
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
    <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Application <span className="gradient-text">Tracker</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track all your opportunity applications</p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', count: applications.length, color: 'text-white' },
              { label: 'Applied', count: statusCounts['APPLIED'] || 0, color: 'text-blue-400' },
              { label: 'Shortlisted', count: statusCounts['SHORTLISTED'] || 0, color: 'text-yellow-400' },
              { label: 'Selected', count: statusCounts['SELECTED'] || 0, color: 'text-green-400' },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center">
                <div className={`text-3xl font-black ${s.color}`}>{s.count}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {['All', ...statusOrder].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === s
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-indigo-500/40'}`}>
                {s.replace('_', ' ')} {s !== 'All' && statusCounts[s] ? `(${statusCounts[s]})` : ''}
              </button>
            ))}
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((app) => (
                <div key={app.id} className="glass glass-hover p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)' }}>
                    {app.opportunity?.category === 'Internship' ? '💼' :
                     app.opportunity?.category === 'Hackathon' ? '⚡' :
                     app.opportunity?.category === 'Scholarship' ? '🎓' : '🚀'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm">{app.opportunity?.title}</h3>
                      <span className={`badge text-xs ${statusColor(app.status)}`}>
                        {statusIcon[app.status]} <span className="ml-1">{app.status?.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{app.opportunity?.organization}</p>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <Clock size={10} /> Applied: {formatDate(app.applicationDate)}
                    </p>
                  </div>
                  <Link href={`/opportunities/${app.opportunityId}`}
                    className="btn-ghost text-xs flex items-center gap-1 flex-shrink-0">
                    View <ArrowUpRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-16 text-center">
              <FileText size={48} className="mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-bold text-white mb-2">No Applications Yet</h3>
              <p className="text-slate-400 text-sm mb-6">Start applying to opportunities to track them here</p>
              <Link href="/opportunities" className="btn-primary">Browse Opportunities</Link>
            </div>
          )}
    </div>
  );
}
