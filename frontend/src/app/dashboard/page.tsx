'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { studentAPI } from '@/lib/api';
import { formatDate, daysUntil, categoryColor, statusColor, truncate } from '@/lib/utils';
import {
  TrendingUp, Compass, Map, Calendar, BookOpen,
  ArrowRight, Sparkles, Clock, Zap, Target, Award, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import type { DashboardData } from '@/types';

function ReadinessRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#6366f1';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="progress-ring-circle" />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-black text-white">{score.toFixed(0)}</div>
        <div className="text-xs text-slate-400">/ 100</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="skeleton h-32 rounded-xl" />;
}

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role === 'COUNSELLOR') router.push('/counsellor/dashboard');
    else if (user?.role === 'ADMIN') router.push('/admin');
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await studentAPI.dashboard();
      // Normalize backend shape → frontend shape
      const d = res.data;
      return {
        ...d,
        activeRoadmap: d.activeRoadmap || d.roadmap || null,
        profile: d.profile || user?.studentProfile,
        careerReadinessScore: d.careerReadinessScore ?? user?.studentProfile?.careerReadinessScore ?? 0,
        appliedCount: d.appliedCount ?? 0,
        savedCount: d.savedCount ?? 0,
      };
    },
    staleTime: 0,
  });

  const profile = data?.profile || user?.studentProfile;
  const score = data?.careerReadinessScore ?? profile?.careerReadinessScore ?? 0;

  return (
    <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Welcome back, <span className="gradient-text">{profile?.name?.split(' ')[0] || 'Student'}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Here's your career progress at a glance</p>
          </div>

          {/* Top Row: Readiness + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
            {/* Readiness Card */}
            <div className="glass p-6 lg:col-span-1 flex flex-col items-center text-center animate-fade-in-up">
              <div className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-1">
                <Zap size={14} className="text-indigo-400" /> Career Readiness
              </div>
              {isLoading ? <div className="skeleton w-36 h-36 rounded-full" /> : <ReadinessRing score={score} />}
              <div className="mt-4 text-xs text-slate-500">
                {score >= 70 ? '🟢 High Readiness' : score >= 40 ? '🟡 Building Up' : '🔵 Just Starting'}
              </div>
              <Link href="/career-guidance" className="btn-secondary text-xs mt-4 w-full flex items-center justify-center gap-1">
                <Sparkles size={12} /> Boost Score
              </Link>
            </div>

            {/* Stat Cards */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Opportunities', value: data?.recommendedOpportunities?.length ?? '—', icon: Compass, color: 'text-cyan-400', sub: 'Matched for you' },
                { label: 'Applications', value: data?.appliedCount ?? '—', icon: Target, color: 'text-purple-400', sub: 'Submitted' },
                { label: 'Saved', value: data?.savedCount ?? '—', icon: BookOpen, color: 'text-yellow-400', sub: 'Bookmarked' },
                { label: 'Skills', value: profile?.skills?.length ?? '—', icon: Award, color: 'text-green-400', sub: 'In profile' },
                { label: 'Roadmap', value: data?.activeRoadmap ? `${data.activeRoadmap.progress.toFixed(0)}%` : '—', icon: Map, color: 'text-indigo-400', sub: 'Progress' },
                { label: 'Deadlines', value: data?.upcomingDeadlines?.length ?? '—', icon: Clock, color: 'text-red-400', sub: 'This month' },
              ].map((s) => (
                <div key={s.label} className="stat-card animate-fade-in-up">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">{s.label}</span>
                    <s.icon size={14} className={s.color} />
                  </div>
                  <div className={`text-2xl font-black ${s.color}`}>{isLoading ? <span className="skeleton w-8 h-6 inline-block" /> : s.value}</div>
                  <div className="text-xs text-slate-600 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Recommended Opportunities */}
            <div className="lg:col-span-2 glass p-5 animate-fade-in-up">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" /> AI Recommended
                </h2>
                <Link href="/opportunities" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {isLoading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) :
                  (data?.recommendedOpportunities?.slice(0, 4) || []).map((opp) => (
                    <Link key={opp.id} href={`/opportunities/${opp.id}`}
                      className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.15)' }}>
                        {opp.category === 'Internship' ? '💼' : opp.category === 'Hackathon' ? '⚡' : opp.category === 'Scholarship' ? '🎓' : '🚀'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{opp.title}</h3>
                          <span className={`badge text-xs flex-shrink-0 ${categoryColor(opp.category)}`}>{opp.category}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{opp.organization}</p>
                        {opp.deadline && (
                          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            {daysUntil(opp.deadline) > 0 ? `${daysUntil(opp.deadline)} days left` : 'Expired'}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))
                }
                {!isLoading && !data?.recommendedOpportunities?.length && (
                  <div className="text-center py-8 text-slate-500">
                    <Compass size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Complete your profile to get recommendations</p>
                    <Link href="/settings" className="btn-secondary text-xs mt-3 inline-flex">Update Profile</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Active Roadmap */}
              <div className="glass p-5 animate-fade-in-up delay-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Map size={16} className="text-indigo-400" /> Roadmap
                  </h2>
                  <Link href="/roadmap" className="text-xs text-indigo-400">View <ArrowRight size={10} className="inline" /></Link>
                </div>
                {data?.activeRoadmap ? (
                  <div>
                    <p className="text-sm text-white font-medium mb-2">{data.activeRoadmap.title}</p>
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                      <div className="h-2 rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${data.activeRoadmap.progress}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{data.activeRoadmap.progress.toFixed(0)}% complete</p>
                    <div className="mt-3 space-y-2">
                      {data.activeRoadmap.steps?.slice(0, 3).map((s) => (
                        <div key={s.id} className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${s.status === 'COMPLETED' ? 'bg-green-400' : s.status === 'IN_PROGRESS' ? 'bg-yellow-400' : 'bg-slate-600'}`} />
                          <span className={s.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-300'}>{s.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Map size={28} className="mx-auto mb-2 text-slate-600" />
                    <p className="text-xs text-slate-500 mb-3">No roadmap yet</p>
                    <Link href="/career-guidance" className="btn-primary text-xs flex items-center justify-center gap-1">
                      <Sparkles size={12} /> Generate Roadmap
                    </Link>
                  </div>
                )}
              </div>

              {/* Upcoming Deadlines */}
              <div className="glass p-5 animate-fade-in-up delay-200">
                <h2 className="font-bold text-white flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-red-400" /> Upcoming Deadlines
                </h2>
                <div className="space-y-2">
                  {data?.upcomingDeadlines?.slice(0, 4).map((d) => (
                    <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                      <div className={`text-xs font-bold px-2 py-1 rounded-lg ${daysUntil(d.deadline) <= 7 ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
                        {daysUntil(d.deadline)}d
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{d.title}</p>
                        <p className="text-xs text-slate-500">{formatDate(d.deadline)}</p>
                      </div>
                    </div>
                  ))}
                  {!isLoading && !data?.upcomingDeadlines?.length && (
                    <p className="text-xs text-slate-500 text-center py-4">No upcoming deadlines 🎉</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Banner */}
          {profile && !profile.premiumStatus && (
            <div className="mt-5 rounded-2xl p-6 relative overflow-hidden animate-fade-in-up"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={20} /> Unlock Premium Intelligence
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Get advanced AI analysis, unlimited counsellor sessions, and priority matching.</p>
                </div>
                <Link href="/premium" className="btn-primary flex items-center gap-2 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                  Upgrade Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
    </div>
  );
}
