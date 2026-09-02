'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
    <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Expert <span className="gradient-text">Counsellors</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Book 1-on-1 sessions with verified career experts</p>
          </div>

          {/* Search + Filter */}
          <div className="glass p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-field pl-10 py-2" placeholder="Search by name or specialization..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {specializations.slice(0, 6).map((s) => (
                <button key={s} onClick={() => setSpecialFilter(s || 'All')}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${specialFilter === s
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'border-slate-700 text-slate-400 hover:border-indigo-500/40'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <Link key={c.id} href={`/counsellors/${c.id}`}
                  className="glass glass-hover p-6 flex flex-col">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {c.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm truncate">{c.name}</h3>
                        {c.isVerified && <CheckCircle size={14} className="text-green-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{c.qualification}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-semibold">{c.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Briefcase size={12} className="text-indigo-400" />
                      <span className="truncate">{c.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Globe size={12} className="text-cyan-400" />
                      <span>{c.languages}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={12} className="text-purple-400" />
                      <span>{c.experience}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-white">₹{c.sessionPrice?.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">per session</div>
                    </div>
                    <div className="btn-primary text-xs flex items-center gap-1 px-4 py-2">
                      Book Now <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400">No counsellors found. Try clearing filters.</p>
            </div>
          )}
    </div>
  );
}
