'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { counsellorAPI } from '@/lib/api';
import { Users, Eye, FileText, ChevronRight, Search, Loader2, Star } from 'lucide-react';

export default function CounsellorStudentsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reportText, setReportText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'COUNSELLOR') router.push('/dashboard');
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['counsellor-students'],
    queryFn: async () => { const res = await counsellorAPI.students(); return res.data; },
    staleTime: 0,
  });

  const students = data?.students || [];
  const filtered = students.filter((s: any) =>
    !search || s.studentProfile?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const loadStudentReport = async (studentId: number) => {
    try {
      const res = await counsellorAPI.studentReport(studentId);
      setSelectedStudent(res.data);
    } catch {
      setSelectedStudent({ studentId, error: true });
    }
  };

  const submitReport = async () => {
    setSubmitting(true);
    try {
      await counsellorAPI.createReport({
        counsellingSessionId: selectedStudent?.latestSession?.id,
        studentSituation: reportText,
        assessment: 'Assessment conducted',
        recommendedCareer: selectedStudent?.profile?.currentCareerMatch || 'Technology',
        recommendedCourse: 'Online courses in core skills',
        recommendedExams: 'JEE / GATE / CAT',
        skillsToDevelop: 'Communication, Problem Solving',
        actionPlan: reportText,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              My <span className="gradient-text">Students</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Students who have booked sessions with you</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Students List */}
            <div className="lg:col-span-1 glass p-4">
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input-field pl-9 py-2 text-sm" placeholder="Search students..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-indigo-400" />
                </div>
              ) : filtered.length > 0 ? (
                <div className="space-y-2">
                  {filtered.map((s: any) => (
                    <button key={s.id} onClick={() => loadStudentReport(s.studentProfileId || s.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedStudent?.profile?.id === s.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-transparent hover:border-slate-700 hover:bg-slate-900/50'}`}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {s.studentProfile?.name?.[0] || 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{s.studentProfile?.name || 'Student'}</div>
                        <div className="text-xs text-slate-500">{s.studentProfile?.branch || 'No branch'}</div>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500">No students yet</p>
                </div>
              )}
            </div>

            {/* Student Detail / Report */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="space-y-4">
                  {/* Profile */}
                  <div className="glass p-5">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Eye size={16} className="text-indigo-400" /> Student Profile
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Name', value: selectedStudent?.profile?.name },
                        { label: 'Branch', value: selectedStudent?.profile?.branch },
                        { label: 'Year', value: selectedStudent?.profile?.year ? `Year ${selectedStudent.profile.year}` : '—' },
                        { label: 'CGPA', value: selectedStudent?.profile?.cgpa || '—' },
                        { label: 'Career Match', value: selectedStudent?.profile?.currentCareerMatch || '—' },
                        { label: 'Readiness', value: selectedStudent?.profile?.careerReadinessScore ? `${selectedStudent.profile.careerReadinessScore}%` : '—' },
                      ].map((info) => (
                        <div key={info.label} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                          <div className="text-xs text-slate-500">{info.label}</div>
                          <div className="text-sm font-medium text-white mt-0.5">{info.value || '—'}</div>
                        </div>
                      ))}
                    </div>
                    {selectedStudent?.profile?.skills?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 mb-2">Skills</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedStudent.profile.skills.map((s: any) => (
                            <span key={s.skillId} className="badge bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-xs">
                              {s.skill?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Write Report */}
                  <div className="glass p-5">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-green-400" /> Session Report
                    </h2>
                    {submitted ? (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="text-green-400 font-semibold">Report submitted successfully!</p>
                      </div>
                    ) : (
                      <>
                        <textarea
                          className="input-field min-h-[120px] resize-none mb-4"
                          placeholder="Write your session notes, action plan, and recommendations for this student..."
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                        />
                        <button onClick={submitReport} disabled={submitting || !reportText}
                          className="btn-primary flex items-center gap-2 disabled:opacity-50">
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                          Submit Report
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass p-16 text-center">
                  <Users size={48} className="mx-auto text-slate-700 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Select a Student</h3>
                  <p className="text-slate-400 text-sm">Click on a student from the list to view their profile and write a report</p>
                </div>
              )}
            </div>
          </div>
    </div>
  );
}
