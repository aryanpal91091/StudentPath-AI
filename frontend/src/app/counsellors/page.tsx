'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { counsellorAPI } from '@/lib/api';
import { Star, Search, MapPin, Briefcase, Globe, CheckCircle, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import type { CounsellorProfile } from '@/types';

export default function CounsellorsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [specialFilter, setSpecialFilter] = useState('All');

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['counsellors'],
    queryFn: async () => { const res = await counsellorAPI.list(); return res.data; },
    staleTime: 0,
  });

  const counsellors: CounsellorProfile[] = data?.counsellors || data || [];
  const specializations = ['All', ...new Set(counsellors.map((c) => c.specialization?.split(' ')[0]).filter(Boolean))];

  const filtered = counsellors.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialFilter === 'All' || c.specialization?.includes(specialFilter);
    return matchSearch && matchSpec;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Expert Career <span className="gradient-text">Counsellors</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">Book 1-on-1 personalized guidance sessions with verified mentors.</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-200 self-start sm:self-auto">
          {filtered.length} Verified Mentors
        </span>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" />
            <input
              type="text"
              aria-label="Search counsellors"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              placeholder="Search by counsellor name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter size={13} className="text-indigo-600" /> Domain:
          </span>
          {specializations.slice(0, 7).map((s) => {
            const isSelected = specialFilter === s;
            return (
              <button
                key={s}
                onClick={() => setSpecialFilter(s || 'All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/counsellors/${c.id}`}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Avatar + Name */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    {c.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">{c.name}</h3>
                      {c.isVerified && <CheckCircle size={15} className="text-emerald-600 fill-emerald-100 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{c.qualification}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={13} className="fill-amber-400 text-amber-500" />
                      <span className="text-xs text-slate-800 font-bold">{c.rating?.toFixed(1)}</span>
                      <span className="text-[11px] text-slate-400 font-normal">(Verified)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Briefcase size={13} className="text-indigo-600 flex-shrink-0" />
                    <span className="truncate">{c.specialization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-cyan-600 flex-shrink-0" />
                    <span>{c.languages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-purple-600 flex-shrink-0" />
                    <span>{c.experience} Experience</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">₹{c.sessionPrice?.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 font-medium">per session</div>
                </div>
                <div className="btn-primary text-xs flex items-center gap-1 px-3.5 py-2">
                  Book Session <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2 shadow-sm">
          <p className="text-slate-600 font-medium text-sm">No counsellors match your filter.</p>
          <button onClick={() => { setSearch(''); setSpecialFilter('All'); }} className="btn-secondary text-xs mt-2">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
