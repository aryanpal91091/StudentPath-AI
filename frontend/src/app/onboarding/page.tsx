'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, GraduationCap, BookOpen, Lightbulb, Target } from 'lucide-react';

const steps = [
  { id: 1, title: 'Academic Info', subtitle: 'Tell us about your education', icon: GraduationCap },
  { id: 2, title: 'Skills', subtitle: 'What are you good at?', icon: BookOpen },
  { id: 3, title: 'Interests', subtitle: 'What excites you?', icon: Lightbulb },
  { id: 4, title: 'Goals', subtitle: 'Where do you want to go?', icon: Target },
];

const allSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C++', 'Machine Learning', 'Data Analysis', 'HTML', 'CSS', 'SQL', 'Communication', 'Leadership', 'Figma', 'Algorithms', 'Data Structures', 'Cloud Computing', 'Android Development', 'UI/UX Design', 'Photography'];
const interests = ['Technology', 'AI/ML', 'Finance', 'Healthcare', 'Design', 'Research', 'Entrepreneurship', 'Marketing', 'Law', 'Education', 'Engineering', 'Arts', 'Science', 'Business', 'Sports'];
const streams = ['PCM Stream', 'PCB Stream', 'Commerce', 'Arts / Humanities', 'Engineering', 'Medical', 'Management', 'Law', 'Other'];
const branches = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Information Technology', 'Biotechnology', 'Other'];

export default function OnboardingPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', classLevel: 'Undergraduate', board: 'CBSE', stream: 'PCM Stream',
    branch: 'Computer Science', year: 1, cgpa: '', location: '',
    onlinePreference: true, opportunityPreference: 'Internships', timeAvailability: 'Part-time',
    careerInterests: '', currentCareerMatch: '',
  });

  const toggleSkill = (s: string) =>
    setSelectedSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleInterest = (i: string) =>
    setSelectedInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        year: parseInt(String(form.year)),
        cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
        careerInterests: selectedInterests.join(', '),
        skills: selectedSkills,
      };
      const res = await authAPI.onboard(payload);
      const { token, user } = res.data;
      if (token) setAuth(user, token);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="hero-bg min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Let's set up your profile
          </h1>
          <p className="text-slate-400 text-sm">This helps us personalize your experience</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-800 -z-10" />
          <div className="absolute left-0 top-5 h-0.5 bg-indigo-500 -z-10 transition-all duration-500"
            style={{ width: `${progress}%` }} />
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step > s.id ? 'bg-indigo-500' : step === s.id
                  ? 'bg-indigo-500 ring-4 ring-indigo-500/30' : 'bg-slate-800'}`}>
                {step > s.id ? <CheckCircle size={18} className="text-white" /> : <s.icon size={16} className={step >= s.id ? 'text-white' : 'text-slate-600'} />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? 'text-indigo-400' : 'text-slate-600'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-6">Academic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
                  <input className="input-field" placeholder="Your full name"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Education Level</label>
                  <select className="input-field" value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })}>
                    {['Class 10', 'Class 11', 'Class 12', 'Undergraduate', 'Postgraduate', 'Diploma'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Board</label>
                  <select className="input-field" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })}>
                    {['CBSE', 'ICSE', 'State Board', 'IB', 'NIOS', 'Other'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Stream</label>
                  <select className="input-field" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}>
                    {streams.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Branch / Specialization</label>
                  <select className="input-field" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                    {branches.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Current Year</label>
                  <select className="input-field" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Year {n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">CGPA / Percentage</label>
                  <input className="input-field" type="number" step="0.1" placeholder="e.g. 8.5"
                    value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Location (City)</label>
                  <input className="input-field" placeholder="e.g. Mumbai, Delhi, Bangalore"
                    value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your Skills</h2>
              <p className="text-slate-400 text-sm mb-6">Select all the skills you have (select multiple)</p>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((s) => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      selectedSkills.includes(s)
                        ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300'
                        : 'border-slate-700 text-slate-400 hover:border-indigo-500/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <p className="mt-4 text-xs text-slate-500">{selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your Interests</h2>
              <p className="text-slate-400 text-sm mb-6">What domains excite you the most?</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((i) => (
                  <button key={i} type="button" onClick={() => toggleInterest(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      selectedInterests.includes(i)
                        ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                        : 'border-slate-700 text-slate-400 hover:border-purple-500/40'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-6">Your Goals</h2>
              <div>
                <label className="block text-sm text-slate-400 mb-2">What opportunities are you looking for?</label>
                <select className="input-field" value={form.opportunityPreference} onChange={(e) => setForm({ ...form, opportunityPreference: e.target.value })}>
                  {['Internships', 'Hackathons', 'Scholarships', 'Research', 'Jobs', 'Internships, Hackathons', 'All'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Time Availability</label>
                <select className="input-field" value={form.timeAvailability} onChange={(e) => setForm({ ...form, timeAvailability: e.target.value })}>
                  {['Part-time', 'Full-time', 'Weekends', 'Flexible'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Do you prefer online or offline opportunities?</label>
                <div className="flex gap-3">
                  {['Online', 'Offline', 'Both'].map((o) => (
                    <button key={o} type="button"
                      onClick={() => setForm({ ...form, onlinePreference: o === 'Online' || o === 'Both' })}
                      className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                        (o === 'Online' && form.onlinePreference) || (o === 'Offline' && !form.onlinePreference) || (o === 'Both' && form.onlinePreference)
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Dream Career / Role (optional)</label>
                <input className="input-field" placeholder="e.g. Software Engineer, Data Scientist"
                  value={form.currentCareerMatch} onChange={(e) => setForm({ ...form, currentCareerMatch: e.target.value })} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-ghost flex items-center gap-2 flex-1">
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center justify-center gap-2 flex-1"
                disabled={step === 1 && !form.name}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 flex-1 py-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Complete Setup</>}
              </button>
            )}
          </div>
          {step < 4 && (
            <button onClick={() => setStep(step + 1)} className="w-full text-center text-xs text-slate-600 hover:text-slate-400 mt-3">
              Skip this step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
