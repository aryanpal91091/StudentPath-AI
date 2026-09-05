'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { studentAPI, aiAPI } from '@/lib/api';
import {
  Map, CheckCircle, Circle, Clock, ArrowRight, Sparkles,
  Loader2, Play, Lock, Target, Compass, BookOpen, Layers, Award, Check
} from 'lucide-react';
import Link from 'next/link';
import type { Roadmap, RoadmapStep } from '@/types';

const statusIcon = (status: string) => {
  if (status === 'COMPLETED') return <CheckCircle size={22} className="text-emerald-600 fill-emerald-100 flex-shrink-0" />;
  if (status === 'IN_PROGRESS') return <Play size={22} className="text-amber-600 fill-amber-100 flex-shrink-0" />;
  return <Circle size={22} className="text-slate-300 flex-shrink-0" />;
};

const pillarPreview = [
  { step: 1, title: 'Select Core Domain', desc: 'Identify your target field, stream, and degree path.' },
  { step: 2, title: 'Master Core Skills', desc: 'Learn programming languages, tools, and domain theory.' },
  { step: 3, title: 'Build Projects', desc: 'Create 2-3 portfolio projects uploaded to GitHub.' },
  { step: 4, title: 'Exams & Mocks', desc: 'Prepare for GATE, JEE, or competitive corporate challenges.' },
  { step: 5, title: 'Internships & Roles', desc: 'Apply to verified corporate internships & entry roles.' },
];

export default function RoadmapPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data: dashData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const res = await studentAPI.dashboard(); return res.data; },
    staleTime: 0,
  });

  const roadmap: Roadmap | null = dashData?.activeRoadmap || null;
  const [generating, setGenerating] = useState(false);

  const generateRoadmap = async () => {
    setGenerating(true);
    try {
      await aiAPI.careerRoadmap(1);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    } finally {
      setGenerating(false);
    }
  };

  const updateStep = useMutation({
    mutationFn: async ({ stepId, status }: { stepId: number; status: string }) => {
      return Promise.resolve();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  // EMPTY ROADMAP STATE ("No Roadmap Yet")
  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-2 sm:py-4">
        {/* Hero Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-3 relative overflow-hidden">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <Compass size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Build Your Step-by-Step <span className="gradient-text">Career Roadmap</span>
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
            StudentPath AI analyzes your academic stream, branch, and target goals to generate an actionable timeline with clear milestones.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/career-guidance"
              className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles size={18} /> Take Career Assessment
            </Link>
            <button
              onClick={generateRoadmap}
              disabled={generating}
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Map size={18} />}
              Quick Generate Roadmap
            </button>
          </div>
        </div>

        {/* Roadmap Preview Steps Showcase */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" /> How Your Personalized Roadmap Works
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              5 Key Pillars
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {pillarPreview.map((p) => (
              <div key={p.step} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div>
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                    {p.step}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs leading-snug mb-1">{p.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedSteps = roadmap.steps?.filter((s) => s.status === 'COMPLETED').length || 0;
  const totalSteps = roadmap.steps?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5 py-2 sm:py-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Career <span className="gradient-text">Roadmap</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">{roadmap.title}</p>
        </div>
        <Link href="/career-guidance" className="btn-ghost text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles size={14} className="text-indigo-600" /> Regenerate Roadmap
        </Link>
      </div>

      {/* Progress Progress Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700">
          <span>Overall Journey Progress</span>
          <span className="text-indigo-600 font-bold">{completedSteps} of {totalSteps} Steps Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-700 shadow-2xs"
            style={{ width: `${roadmap.progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500 font-medium pt-1">
          <span>Stage 1: Fundamentals</span>
          <span className="text-indigo-600 font-bold">{roadmap.progress.toFixed(0)}% Milestone Score</span>
          <span>Goal: Job Ready 🎯</span>
        </div>
      </div>

      {/* Interactive Step Cards List */}
      <div className="space-y-3">
        {roadmap.steps?.sort((a, b) => a.order - b.order).map((step, idx) => {
          const isDone = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';
          return (
            <div
              key={step.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                isDone ? 'border-emerald-200 bg-emerald-50/20' :
                isInProgress ? 'border-amber-300 ring-2 ring-amber-100 shadow-md' :
                'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Status Icon */}
                <div className="mt-0.5">{statusIcon(step.status)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <h3 className={`font-bold text-sm sm:text-base ${
                      isDone ? 'text-slate-500 line-through' :
                      isInProgress ? 'text-amber-900 font-black' : 'text-slate-900'
                    }`}>
                      {step.order}. {step.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {step.targetDate && (
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock size={11} /> {new Date(step.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className={`badge border text-xs ${
                        isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        isInProgress ? 'bg-amber-50 text-amber-800 border-amber-300' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {step.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {step.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">{step.description}</p>
                  )}

                  {/* Action Buttons */}
                  {!isDone && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                      {step.status === 'NOT_STARTED' && idx === (roadmap.steps?.findIndex((s) => s.status !== 'COMPLETED') ?? 0) && (
                        <button
                          onClick={() => updateStep.mutate({ stepId: step.id, status: 'IN_PROGRESS' })}
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-semibold"
                        >
                          <Play size={12} /> Start This Milestone
                        </button>
                      )}
                      {isInProgress && (
                        <button
                          onClick={() => updateStep.mutate({ stepId: step.id, status: 'COMPLETED' })}
                          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 font-semibold"
                        >
                          <CheckCircle size={14} /> Mark Milestone Complete
                        </button>
                      )}
                      {step.status === 'NOT_STARTED' && idx !== (roadmap.steps?.findIndex((s) => s.status !== 'COMPLETED') ?? 0) && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Lock size={12} /> Complete previous milestone first
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {completedSteps === totalSteps && totalSteps > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-bold text-emerald-900">Roadmap Fully Completed!</h2>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
            You've cleared all milestones on your career path. You are ready to apply for job roles and book 1-on-1 expert sessions.
          </p>
          <Link href="/counsellors" className="btn-primary text-xs inline-flex items-center gap-2">
            Book Counsellor Session <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
