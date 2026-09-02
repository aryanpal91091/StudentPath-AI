import Link from 'next/link';
import { ArrowRight, Sparkles, Target, Map, Users, Star, BookOpen, TrendingUp, Shield, Zap, CheckCircle } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI Career Matching', desc: 'Get personalized career recommendations powered by machine learning based on your skills, interests, and academic background.', color: 'from-purple-500 to-indigo-500' },
  { icon: Target, title: 'Opportunity Discovery', desc: 'Browse 300+ curated internships, hackathons, scholarships, and research programs tailored to your profile.', color: 'from-cyan-500 to-blue-500' },
  { icon: Map, title: 'Career Roadmap', desc: 'Follow AI-generated step-by-step career roadmaps with milestones, resources, and progress tracking.', color: 'from-green-500 to-emerald-500' },
  { icon: Users, title: 'Expert Counsellors', desc: 'Book 1-on-1 sessions with verified career counsellors who specialize in your stream and goals.', color: 'from-orange-500 to-red-500' },
  { icon: TrendingUp, title: 'Skill Gap Analysis', desc: 'Identify exactly what skills you need to develop for your dream career and find the right courses.', color: 'from-pink-500 to-rose-500' },
  { icon: Shield, title: 'Premium Intelligence', desc: 'Unlock advanced AI analysis, unlimited bookings, and priority matching with our Premium plan.', color: 'from-yellow-500 to-orange-500' },
];

const stats = [
  { value: '10,000+', label: 'Students Guided' },
  { value: '300+', label: 'Live Opportunities' },
  { value: '50+', label: 'Expert Counsellors' },
  { value: '95%', label: 'Success Rate' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'CSE Student, IIT Delhi', text: 'StudentPath AI helped me land my dream internship at a top startup. The career roadmap was incredibly detailed!', stars: 5 },
  { name: 'Rohan Mehta', role: 'MBA Aspirant, Mumbai', text: 'The counsellor sessions changed my perspective completely. Went from confused to confident in 2 sessions.', stars: 5 },
  { name: 'Ananya Reddy', role: 'ECE Student, NIT Warangal', text: 'Found 3 scholarships I had no idea existed. The AI recommendations are spot on for my profile.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="hero-bg min-h-screen">
      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-spin-slow"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 animate-float"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8 animate-fade-in-up border"
            style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <Sparkles size={14} />
            AI-Powered Career Guidance for Indian Students
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 animate-fade-in-up delay-100 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Future.<br />
            <span className="gradient-text">One Platform.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Discover 300+ opportunities, get AI-driven career recommendations, follow personalized roadmaps, and connect with verified counsellors — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-3">
              Start Free Today <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-3">
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-fade-in-up delay-400">
            {stats.map((s) => (
              <div key={s.label} className="glass p-4">
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">From AI career matching to expert counselling — we've built the ultimate platform for student success.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className={`glass glass-hover p-6 animate-fade-in-up delay-${(i % 5 + 1) * 100}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${f.color}`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ──────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Tell us about your stream, skills, interests, and goals in our smart onboarding wizard.', icon: BookOpen },
              { step: '02', title: 'Get AI Recommendations', desc: 'Our AI analyzes your profile and matches you with the best opportunities and career paths.', icon: Zap },
              { step: '03', title: 'Track & Grow', desc: 'Follow your roadmap, apply to opportunities, and book counsellor sessions as you progress.', icon: TrendingUp },
            ].map((s) => (
              <div key={s.step} className="glass p-8 text-center relative">
                <div className="text-6xl font-black opacity-10 gradient-text absolute top-4 right-6">{s.step}</div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <s.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────── */}
      <section id="counsellors" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Loved by <span className="gradient-text">Students Across India</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass glass-hover p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)' }} />
            <h2 className="text-4xl font-black text-white mb-4 relative" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ready to Shape Your Future?
            </h2>
            <p className="text-slate-400 mb-8 relative">Join 10,000+ students already using StudentPath AI to unlock their potential.</p>
            <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-3 relative animate-pulse-glow">
              <Sparkles size={18} /> Get Started — It's Free
            </Link>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-400" /> No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-400" /> Free forever plan</span>
              <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-400" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 py-8 px-4 text-center">
        <p className="text-slate-600 text-sm">© 2026 StudentPath AI. Built with ❤️ for Indian Students.</p>
      </footer>
    </div>
  );
}
