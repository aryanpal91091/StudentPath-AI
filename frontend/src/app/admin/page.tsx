'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Compass, ShieldCheck, TrendingUp, CreditCard, Award, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e'];

export default function AdminPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [verifiedIds, setVerifiedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'ADMIN') router.push('/dashboard');
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => { const res = await adminAPI.analytics(); return res.data; },
    staleTime: 0,
  });

  const { data: pendingData, refetch } = useQuery({
    queryKey: ['pending-counsellors'],
    queryFn: async () => { const res = await adminAPI.pendingCounsellors(); return res.data; },
    staleTime: 0,
  });

  const verify = async (id: number, approve: boolean) => {
    setVerifyingId(id);
    try {
      await adminAPI.verifyCounsellor(id, approve);
      setVerifiedIds(prev => new Set([...prev, id]));
      refetch();
    } finally { setVerifyingId(null); }
  };

  const stats = [
    { label: 'Students', value: data?.totalStudents || 0, icon: Users, color: 'text-indigo-400' },
    { label: 'Opportunities', value: data?.totalOpportunities || 0, icon: Compass, color: 'text-cyan-400' },
    { label: 'Counsellors', value: data?.totalCounsellors || 0, icon: ShieldCheck, color: 'text-purple-400' },
    { label: 'Premium', value: data?.premiumStudents || 0, icon: CreditCard, color: 'text-yellow-400' },
    { label: 'Applications', value: data?.totalApplications || 0, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Avg Readiness', value: `${data?.avgCareerReadiness || 0}%`, icon: Award, color: 'text-rose-400' },
  ];

  const growthData = data?.studentGrowth || [
    { month: 'Apr', students: 120 }, { month: 'May', students: 180 },
    { month: 'Jun', students: 250 }, { month: 'Jul', students: 310 },
    { month: 'Aug', students: 420 }, { month: 'Sep', students: 500 },
  ];

  const categoryData = data?.opportunitiesByCategory || [
    { category: 'Internship', count: 80 }, { category: 'Hackathon', count: 60 },
    { category: 'Scholarship', count: 50 }, { category: 'Research', count: 40 },
  ];

  const pending = (pendingData?.counsellors || []).filter((c: any) => !verifiedIds.has(c.id));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Admin <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{s.label}</span>
              <s.icon size={14} className={s.color} />
            </div>
            <div className={`text-2xl font-black ${s.color}`}>{isLoading ? '—' : s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 glass p-5">
          <h2 className="font-bold text-white mb-4">Student Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <h2 className="font-bold text-white mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="count">
                {categoryData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((c: any, i: number) => (
              <div key={c.category} className="flex items-center gap-1 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                {c.category}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Counsellor Verification */}
      <div className="glass p-5">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={18} className="text-indigo-400" />
          <h2 className="font-bold text-white">Pending Verifications</h2>
          {pending.length > 0 && (
            <span className="badge bg-red-500/20 text-red-400 border-red-500/30 text-xs">{pending.length} pending</span>
          )}
        </div>

        {pending.length > 0 ? (
          <div className="space-y-3">
            {pending.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {c.name?.[0] || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.qualification} · {c.specialization}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => verify(c.id, false)} disabled={verifyingId === c.id}
                    className="btn-ghost text-xs flex items-center gap-1 text-red-400 border-red-500/30">
                    {verifyingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Reject
                  </button>
                  <button onClick={() => verify(c.id, true)} disabled={verifyingId === c.id}
                    className="btn-primary text-xs flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                    {verifyingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <CheckCircle size={36} className="mx-auto text-green-400 mb-3" />
            <p className="text-slate-400 text-sm">All counsellors are verified! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
