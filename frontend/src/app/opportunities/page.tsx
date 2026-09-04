'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { opportunityAPI, studentAPI } from '@/lib/api';
import { formatDate, daysUntil, categoryColor, statusColor, truncate } from '@/lib/utils';
import {
  Search, Clock, MapPin, Bookmark, BookmarkCheck,
  Loader2, Filter, Sparkles, Building2, ExternalLink, ArrowUpRight, X, RefreshCw
} from 'lucide-react';
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

  const { data, isLoading, isError, refetch } = useQuery<{ opportunities: Opportunity[]; pagination: { total: number; pages: number; page: number; limit: number } }>({
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
  const totalCount = data?.pagination?.total || opps.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Opportunity <span className="gradient-text">Hub</span>
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
              {totalCount} Verified Opportunities
            </span>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Discover internships, hackathons, scholarships, and research grants curated for students across India.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex-shrink-0">
          <Sparkles size={16} className="text-indigo-600 flex-shrink-0 animate-pulse" />
          <span>Real-time verified listings</span>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" />
            <input
              type="text"
              aria-label="Search opportunities"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              placeholder="Search by title, organization, domain, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mode Dropdown Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="mode-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Mode:
            </label>
            <select
              id="mode-select"
              aria-label="Select mode filter"
              className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer min-h-[44px]"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="All">All Modes</option>
              <option value="ONLINE">Online / Remote</option>
              <option value="OFFLINE">In-Person</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (Mobile Horizontal Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter size={13} className="text-indigo-600" /> Filter:
          </span>
          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 min-h-[38px] ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <p className="text-rose-600 font-semibold text-sm">Failed to fetch opportunities from server.</p>
          <button onClick={() => refetch()} className="btn-secondary text-xs inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {opps.map((opp) => {
            const days = daysUntil(opp.deadline);
            const isSaved = savedIds.has(opp.id);
            return (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div>
                  {/* Category Pill & Bookmark Button */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`badge border ${categoryColor(opp.category)}`}>
                      {opp.category}
                    </span>

                    <button
                      onClick={(e) => toggleSave(opp.id, e)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title={isSaved ? 'Remove Bookmark' : 'Save Opportunity'}
                      aria-label={isSaved ? 'Remove Bookmark' : 'Save Opportunity'}
                      disabled={savingId === opp.id}
                    >
                      {savingId === opp.id ? (
                        <Loader2 size={16} className="animate-spin text-indigo-600" />
                      ) : isSaved ? (
                        <BookmarkCheck size={18} className="text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark size={18} />
                      )}
                    </button>
                  </div>

                  {/* Opportunity Title */}
                  <h2 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors mb-1.5 line-clamp-2">
                    {opp.title}
                  </h2>

                  {/* Organization */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                    <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{opp.organization || 'Official Provider'}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {opp.description}
                  </p>
                </div>

                {/* Card Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {/* Mode */}
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      <MapPin size={11} className="text-slate-500" /> {opp.mode}
                    </span>

                    {/* Deadline Badge */}
                    {opp.deadline && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                        days <= 7 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        days <= 30 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <Clock size={11} /> {days > 0 ? `${days}d left` : 'Expired'}
                      </span>
                    )}
                  </div>

                  {/* Compensation / Prize badge or View Details */}
                  {(opp.stipend || opp.prize) ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate max-w-[140px]">
                      {opp.stipend ? `💰 ${opp.stipend}` : `🏆 ${opp.prize}`}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                      View details <ArrowUpRight size={14} className="ml-0.5" />
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty Filter State */}
      {!isLoading && opps.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Search size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-900">No opportunities match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try clearing your search query or choosing a different category to view all listings.
          </p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setMode('All'); }}
            className="btn-secondary text-xs mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
