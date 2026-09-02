'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { counsellorAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, Users, Star, CreditCard, Clock, ArrowRight, Video, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate, statusColor } from '@/lib/utils';

export default function CounsellorDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'COUNSELLOR') router.push('/dashboard');
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['counsellor-dashboard'],
    queryFn: async () => { const res = await counsellorAPI.dashboard(); return res.data; },
    staleTime: 0,
  });

  const profile = user?.counsellorProfile;
  const sessions = data?.upcomingSessions || [];
  const recentSessions = data?.recentSessions || [];

  const chartData = [
    { month: 'Apr', sessions: 4 },
    { month: 'May', sessions: 6 },
    { month: 'Jun', sessions: 8 },
    { month: 'Jul', sessions: 5 },
    { month: 'Aug', sessions: 9 },
    { month: 'Sep', sessions: data?.totalSessions || 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Counsellor <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Welcome back, {profile?.name || user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sessions', value: data?.totalSessions || 0, icon: Video, color: 'text-indigo-400' },
              { label: 'Upcoming', value: sessions.length, icon: Calendar, color: 'text-cyan-400' },
              { label: 'Students', value: data?.totalStudents || 0, icon: Users, color: 'text-purple-400' },
              { label: 'Rating', value: profile?.rating?.toFixed(1) || '5.0', icon: Star, color: 'text-yellow-400' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <s.icon size={14} className={s.color} />
                </div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Sessions Chart */}
            <div className="lg:col-span-2 glass p-5">
              <h2 className="font-bold text-white mb-5">Sessions This Year</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
                  <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Upcoming Sessions */}
            <div className="glass p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400" /> Upcoming
                </h2>
                <Link href="/counsellor/students" className="text-xs text-indigo-400">All <ArrowRight size={10} className="inline" /></Link>
              </div>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 4).map((s: any) => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          {s.studentProfile?.name?.[0] || 'S'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate">{s.studentProfile?.name || 'Student'}</div>
                          <div className="text-xs text-slate-500">{formatDate(s.date)} • {s.timeSlot}</div>
                        </div>
                      </div>
                      <span className={`badge text-xs ${statusColor(s.status)}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500">No upcoming sessions</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mt-5">
            {[
              { href: '/counsellor/availability', icon: Clock, label: 'Set Availability', color: 'from-indigo-500 to-purple-500' },
              { href: '/counsellor/students', icon: Users, label: 'View Students', color: 'from-cyan-500 to-blue-500' },
              { href: '/settings', icon: CheckCircle, label: 'Profile Settings', color: 'from-green-500 to-emerald-500' },
            ].map((action) => (
              <Link key={action.href} href={action.href}
                className="glass glass-hover p-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.color}`}>
                  <action.icon size={18} className="text-white" />
                </div>
                <span className="font-medium text-sm text-white">{action.label}</span>
              </Link>
            ))}
          </div>
    </div>
  );
}
