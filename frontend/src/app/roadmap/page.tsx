'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { studentAPI, aiAPI } from '@/lib/api';
import { Map, CheckCircle, Circle, Clock, ArrowRight, Sparkles, Loader2, Play, Lock } from 'lucide-react';
import Link from 'next/link';
import type { Roadmap, RoadmapStep } from '@/types';

const statusIcon = (status: string) => {
  if (status === 'COMPLETED') return <CheckCircle size={20} className="text-green-400" />;
  if (status === 'IN_PROGRESS') return <Play size={20} className="text-yellow-400" />;
  return <Circle size={20} className="text-slate-600" />;
};

export default function RoadmapPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const res = await studentAPI.dashboard(); return res.data; },
    staleTime: 0,
  });

  const roadmap: Roadmap | null = dashData?.activeRoadmap || null;
  const [generating, setGenerating] = useState(false);

  const generateRoadmap = async () => {
    setGenerating(true);
    try {
      const careerId = dashData?.profile?.currentCareerMatch ? 1 : 1; // use first career as default
      await aiAPI.careerRoadmap(careerId);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    } finally {
      setGenerating(false);
    }
  };

  const updateStep = useMutation({
    mutationFn: async ({ stepId, status }: { stepId: number; status: string }) => {
      // Optimistically update
      return Promise.resolve();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  if (!roadmap) {
    return (
      <div>
        <div className="flex-1 ml-60 pt-16 p-6 flex items-center justify-center">
          <div className="glass p-12 text-center max-w-md">
            <Map size={56} className="mx-auto mb-4 text-slate-600" />
            <h2 className="text-2xl font-black text-white mb-3">No Roadmap Yet</h2>
            <p className="text-slate-400 mb-6">Take the career assessment to generate your personalized career roadmap with AI.</p>
            <div className="flex flex-col gap-3">
              <Link href="/career-guidance" className="btn-primary flex items-center justify-center gap-2 py-3">
                <Sparkles size={18} /> Take Career Assessment
              </Link>
              <button onClick={generateRoadmap} disabled={generating}
                className="btn-secondary flex items-center justify-center gap-2">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Map size={16} />}
                Quick Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedSteps = roadmap.steps?.filter((s) => s.status === 'COMPLETED').length || 0;
  const totalSteps = roadmap.steps?.length || 0;

  return (
    <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Career <span className="gradient-text">Roadmap</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">{roadmap.title}</p>
            </div>
            <Link href="/career-guidance" className="btn-ghost flex items-center gap-2 text-sm">
              <Sparkles size={14} /> Regenerate
            </Link>
          </div>

          {/* Progress */}
          <div className="glass p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Overall Progress</span>
              <span className="text-sm font-bold text-indigo-400">{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${roadmap.progress}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Started</span>
              <span className="text-indigo-400 font-semibold">{roadmap.progress.toFixed(0)}% Complete</span>
              <span>Goal 🎯</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {roadmap.steps?.sort((a, b) => a.order - b.order).map((step, idx) => (
              <div key={step.id}
                className={`glass p-5 transition-all duration-300 ${
                  step.status === 'COMPLETED' ? 'opacity-70' :
                  step.status === 'IN_PROGRESS' ? 'border-yellow-500/40 shadow-yellow-500/10 shadow-lg' : ''}`}>
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-0.5">{statusIcon(step.status)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm ${
                        step.status === 'COMPLETED' ? 'text-slate-500 line-through' :
                        step.status === 'IN_PROGRESS' ? 'text-yellow-300' : 'text-white'}`}>
                        {step.order}. {step.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {step.targetDate && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {new Date(step.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        <span className={`badge text-xs ${
                          step.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                          step.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-slate-700 text-slate-400'}`}>
                          {step.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {step.description && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.description}</p>
                    )}

                    {/* Action buttons */}
                    {step.status !== 'COMPLETED' && (
                      <div className="flex gap-2 mt-3">
                        {step.status === 'NOT_STARTED' && idx === (roadmap.steps?.findIndex((s) => s.status !== 'COMPLETED') ?? 0) && (
                          <button onClick={() => updateStep.mutate({ stepId: step.id, status: 'IN_PROGRESS' })}
                            className="btn-ghost text-xs flex items-center gap-1">
                            <Play size={10} /> Start Step
                          </button>
                        )}
                        {step.status === 'IN_PROGRESS' && (
                          <button onClick={() => updateStep.mutate({ stepId: step.id, status: 'COMPLETED' })}
                            className="btn-primary text-xs flex items-center gap-1">
                            <CheckCircle size={10} /> Mark Complete
                          </button>
                        )}
                        {step.status === 'NOT_STARTED' && idx !== (roadmap.steps?.findIndex((s) => s.status !== 'COMPLETED') ?? 0) && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Lock size={10} /> Complete previous steps first
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {completedSteps === totalSteps && totalSteps > 0 && (
            <div className="glass p-8 text-center mt-6"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.1))' }}>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-black text-white mb-2">Roadmap Complete!</h2>
              <p className="text-slate-400">Congratulations! You've completed all steps. Ready for the next challenge?</p>
              <Link href="/counsellors" className="btn-primary mt-4 inline-flex items-center gap-2">
                Book a Counsellor <ArrowRight size={16} />
              </Link>
            </div>
          )}
    </div>
  );
}
