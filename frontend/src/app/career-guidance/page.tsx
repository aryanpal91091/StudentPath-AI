'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { aiAPI } from '@/lib/api';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, Loader2, Target, TrendingUp, Zap, Map } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { CareerRecommendation } from '@/types';
import Link from 'next/link';

const questions = [
  { id: 'interests', label: 'What are your primary interests?', options: ['Technology & Computing', 'Science & Research', 'Business & Finance', 'Arts & Design', 'Healthcare & Medicine', 'Education & Teaching', 'Law & Policy', 'Engineering'] },
  { id: 'skills', label: 'What are your strongest skills?', options: ['Programming & Coding', 'Mathematics & Analytics', 'Communication & Writing', 'Leadership & Management', 'Design & Creativity', 'Problem Solving', 'Research & Analysis', 'People Skills'] },
  { id: 'workStyle', label: 'What work environment do you prefer?', options: ['Remote / Work from Home', 'Office / On-site', 'Fieldwork / Travel', 'Hybrid', 'Lab / Research', 'Startup', 'Large Corporation', 'Government / PSU'] },
  { id: 'values', label: 'What matters most to you in a career?', options: ['High Salary & Growth', 'Work-Life Balance', 'Making Social Impact', 'Creative Freedom', 'Stability & Security', 'Continuous Learning', 'Leadership Opportunities', 'Entrepreneurship'] },
  { id: 'education', label: 'What is your educational background?', options: ['PCM (Physics, Chemistry, Math)', 'PCB (Physics, Chemistry, Biology)', 'Commerce', 'Arts / Humanities', 'Engineering (B.Tech)', 'Science (B.Sc)', 'Management (BBA/MBA)', 'Other'] },
  { id: 'salary', label: 'What are your salary expectations (5 years from now)?', options: ['₹3–6 LPA', '₹6–12 LPA', '₹12–25 LPA', '₹25–50 LPA', '₹50 LPA+', 'Startup Equity', 'Government Grade', 'Flexible / Unsure'] },
];

export default function CareerGuidancePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = intro, 1-6 = questions, 7 = results
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CareerRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [skillGap, setSkillGap] = useState<any>(null);
  const [selectedCareer, setSelectedCareer] = useState<number | null>(null);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const selectAnswer = (qId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const runAssessment = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.careerRecommendation(answers);
      setResults(res.data.recommendations || res.data);
      setStep(7);
    } catch {
      setResults([]);
      setStep(7);
    } finally {
      setLoading(false);
    }
  };

  const loadSkillGap = async (careerId: number) => {
    setSelectedCareer(careerId);
    try {
      const res = await aiAPI.skillGap(careerId);
      setSkillGap(res.data);
    } catch {
      setSkillGap(null);
    }
  };

  const generateRoadmap = async (careerId: number) => {
    setLoading(true);
    try {
      await aiAPI.careerRoadmap(careerId);
      router.push('/roadmap');
    } catch {
      router.push('/roadmap');
    } finally {
      setLoading(false);
    }
  };

  const progress = step === 0 ? 0 : step === 7 ? 100 : (step / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              AI Career <span className="gradient-text">Guidance</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Answer a few questions to get personalized career recommendations</p>
          </div>

          {/* Progress Bar */}
          {step > 0 && step < 7 && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Question {step} of {questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* ── Intro ──────────────────────────────── */}
          {step === 0 && (
            <div className="glass p-10 text-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Sparkles size={36} className="text-white animate-float" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Career Assessment Wizard</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Our AI will analyze your answers across {questions.length} dimensions and match you with the best career paths based on your unique profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                {['🧠 AI-powered matching', '📊 Skill gap analysis', '🗺️ Career roadmap generation'].map((f) => (
                  <span key={f} className="px-4 py-2 rounded-xl text-sm text-slate-300 border border-slate-700">{f}</span>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-3">
                Start Assessment <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* ── Questions ──────────────────────────── */}
          {step >= 1 && step <= questions.length && (
            <div className="glass p-8 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {step}
                </div>
                <h2 className="text-xl font-bold text-white">{questions[step - 1].label}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {questions[step - 1].options.map((opt) => {
                  const selected = answers[questions[step - 1].id] === opt;
                  return (
                    <button key={opt} onClick={() => selectAnswer(questions[step - 1].id, opt)}
                      className={`p-4 rounded-xl border text-left text-sm font-medium transition-all ${selected
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                        : 'border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}>
                      {selected && <CheckCircle size={14} className="inline mr-2 text-indigo-400" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="btn-ghost flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                {step < questions.length ? (
                  <button onClick={() => setStep(step + 1)} disabled={!answers[questions[step - 1].id]}
                    className="btn-primary flex items-center gap-2 flex-1 justify-center">
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={runAssessment} disabled={loading}
                    className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} /> Analyze My Profile</>}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Results ───────────────────────────── */}
          {step === 7 && (
            <div className="animate-fade-in-up space-y-5">
              <div className="glass p-6">
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Target className="text-indigo-400" size={20} /> Your Career Matches
                </h2>
                <p className="text-slate-400 text-sm">Based on your assessment, here are your top career recommendations</p>
              </div>

              {loading && (
                <div className="glass p-12 text-center">
                  <Loader2 size={40} className="animate-spin text-indigo-400 mx-auto mb-4" />
                  <p className="text-slate-400">Analyzing your profile with AI...</p>
                </div>
              )}

              {results && results.length === 0 && (
                <div className="glass p-12 text-center">
                  <p className="text-slate-400">Could not generate results. Please try again.</p>
                  <button onClick={() => setStep(1)} className="btn-primary mt-4">Retake Assessment</button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                {(results || []).slice(0, 6).map((r: CareerRecommendation, idx: number) => (
                  <div key={idx} className={`glass glass-hover p-5 cursor-pointer transition-all ${selectedCareer === r.career?.id ? 'border-indigo-500' : ''}`}
                    onClick={() => r.career?.id && loadSkillGap(r.career.id)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))' }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎯'}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{r.career?.title || 'Career Match'}</h3>
                          <p className="text-xs text-slate-500">{r.career?.careerType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black gradient-text">{Math.round((r.matchScore || 0) * 100)}%</div>
                        <div className="text-xs text-slate-500">match</div>
                      </div>
                    </div>

                    {/* Match score bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
                      <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${(r.matchScore || 0) * 100}%` }} />
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{r.reasoning?.rationale || r.career?.description}</p>

                    {(r.reasoning?.matchingSkills?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {r.reasoning?.matchingSkills?.slice(0, 4).map((s: string) => (
                          <span key={s} className="badge bg-green-500/10 text-green-400 border-green-500/20 text-xs">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); r.career?.id && loadSkillGap(r.career.id); }}
                        className="btn-ghost text-xs flex items-center gap-1 flex-1 justify-center">
                        <TrendingUp size={12} /> Skill Gap
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); r.career?.id && generateRoadmap(r.career.id); }}
                        disabled={loading}
                        className="btn-primary text-xs flex items-center gap-1 flex-1 justify-center">
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <><Map size={12} /> Roadmap</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Gap Radar */}
              {skillGap && (
                <div className="glass p-6 animate-fade-in-up">
                  <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-indigo-400" size={18} /> Skill Gap Analysis
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={skillGap.radarData || []}>
                        <PolarGrid stroke="rgba(99,102,241,0.2)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Radar name="Your Level" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        <Radar name="Required" dataKey="required" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeDasharray="4 2" />
                        <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-3">Skills to Develop</h3>
                      {(skillGap.missingSkills || skillGap.skill_gaps || []).slice(0, 6).map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs text-white font-medium">{typeof s === 'string' ? s : s.skill}</div>
                            {s.gap && <div className="text-xs text-slate-500">Gap: {s.gap}</div>}
                          </div>
                        </div>
                      ))}
                      {(skillGap.recommendations || []).slice(0, 3).map((r: string, i: number) => (
                        <div key={i} className="text-xs text-slate-400 flex items-start gap-2 mb-2">
                          <Zap size={10} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setResults(null); setAnswers({}); }} className="btn-ghost">
                  Retake Assessment
                </button>
                <Link href="/opportunities" className="btn-secondary flex items-center gap-2">
                  Find Opportunities <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
    </div>
  );
}
