'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { opportunityAPI, studentAPI } from '@/lib/api';
import { formatDate, daysUntil, categoryColor, statusColor, truncate } from '@/lib/utils';
import { Search, Filter, Clock, MapPin, ExternalLink, Bookmark, BookmarkCheck, Loader2, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { Opportunity } from '@/types';

const categories = ['All', 'Internship', 'Hackathon', 'Scholarship', 'Research', 'Competition', 'Workshop', 'Fellowship', 'Job'];
const modes = ['All', 'ONLINE', 'OFFLINE', 'HYBRID'];

export default function OpportunitiesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('All');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery<{ opportunities: Opportunity[]; pagination: { total: number; pages: number; page: number; limit: number } }>({
    queryKey: ['opportunities', category, mode, search],
    queryFn: async () => {
      const res = await opportunityAPI.list({
        category: category !== 'All' ? category : undefined,
        mode: mode !== 'All' ? mode : undefined,
        search: search || undefined,
        limit: 100,
      });
      return res.data;
    },
    staleTime: 0,
    retry: 2,
  });

  // Load saved IDs
  useQuery({
    queryKey: ['saved-opportunities'],
    queryFn: async () => {
      const res = await studentAPI.getSaved();
      const ids = new Set<number>(res.data.saved?.map((s: any) => s.opportunityId) || []);
      setSavedIds(ids);
      return res.data;
    },
  });

  const toggleSave = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setSavingId(id);
    try {
      await studentAPI.toggleSave(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    } finally {
      setSavingId(null);
    }
  };

  const opps = data?.opportunities || [];

  return (
    <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Opportunity <span className="gradient-text">Hub</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Discover opportunities matched to your profile — {data?.pagination?.total || 0} available</p>
          </div>

          {/* Search + Filters */}
          <div className="glass p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-field pl-10 py-2"
                placeholder="Search opportunities..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${category === c
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'border-slate-700 text-slate-400 hover:border-indigo-500/40'}`}>
                  {c}
                </button>
              ))}
            </div>
            <select className="input-field py-2 text-sm w-auto"
              value={mode} onChange={(e) => setMode(e.target.value)}>
              {modes.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton h-52 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {opps.map((opp) => {
                const days = daysUntil(opp.deadline);
                const isSaved = savedIds.has(opp.id);
                return (
                  <Link key={opp.id} href={`/opportunities/${opp.id}`}
                    className="glass glass-hover p-5 flex flex-col group">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <span className={`badge ${categoryColor(opp.category)}`}>{opp.category}</span>
                      <button
                        onClick={(e) => toggleSave(opp.id, e)}
                        className="text-slate-500 hover:text-yellow-400 transition-colors ml-2"
                        disabled={savingId === opp.id}>
                        {savingId === opp.id ? <Loader2 size={16} className="animate-spin" /> :
                          isSaved ? <BookmarkCheck size={16} className="text-yellow-400" /> : <Bookmark size={16} />}
                      </button>
                    </div>

                    {/* Title & Org */}
                    <h3 className="font-bold text-white text-sm leading-snug mb-1 group-hover:text-indigo-300 transition-colors">
                      {truncate(opp.title, 60)}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">{opp.organization}</p>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed flex-1">
                      {truncate(opp.description, 100)}
                    </p>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {opp.mode}
                        </span>
                        {opp.deadline && (
                          <span className={`flex items-center gap-1 ${days <= 7 ? 'text-red-400' : days <= 30 ? 'text-yellow-400' : ''}`}>
                            <Clock size={10} /> {days > 0 ? `${days}d left` : 'Expired'}
                          </span>
                        )}
                      </div>
                      <span className={`badge text-xs ${statusColor(opp.status)}`}>{opp.status?.replace('_', ' ')}</span>
                    </div>
                    {(opp.stipend || opp.prize) && (
                      <div className="mt-2 text-xs text-green-400 font-medium">
                        {opp.stipend ? `💰 ${opp.stipend}` : ''}{opp.prize ? ` 🏆 ${opp.prize}` : ''}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {!isLoading && opps.length === 0 && (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">No opportunities found for this filter.</p>
              <button onClick={() => { setSearch(''); setCategory('All'); setMode('All'); }}
                className="btn-secondary mt-4 text-sm">Clear Filters</button>
            </div>
          )}
    </div>
  );
}
