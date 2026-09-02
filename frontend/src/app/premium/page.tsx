'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import { Sparkles, CheckCircle, Zap, ArrowRight, Loader2, CreditCard } from 'lucide-react';

const freeFeatures = ['Browse 300+ opportunities', 'Basic career assessment', 'View counsellor profiles', 'Application tracker', '1 roadmap generation'];
const premiumFeatures = ['Everything in Free', 'AI-powered recommendations', 'Unlimited career assessments', 'Advanced skill gap analysis', 'Unlimited roadmap generations', 'Priority counsellor matching', 'Early access to opportunities', 'Dedicated support'];

export default function PremiumPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const isPremium = user?.studentProfile?.premiumStatus;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await paymentAPI.upgradePremium();
      setSuccess(true);
      setShowPayment(false);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {success || isPremium ? (
        <div className="glass p-16 text-center animate-fade-in-up"
          style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(249,115,22,0.1))' }}>
          <div className="text-7xl mb-6">👑</div>
          <h1 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            You&apos;re <span className="gradient-text-gold">Premium!</span>
          </h1>
          <p className="text-slate-300 max-w-md mx-auto mb-8">Welcome to StudentPath AI Premium. You now have access to all advanced AI features and priority support.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary px-10 py-3 text-base"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
            Go to Dashboard <ArrowRight className="inline ml-2" size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 border"
              style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              <Sparkles size={14} /> Unlock Your Full Potential
            </div>
            <h1 className="text-5xl font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Upgrade to <span className="gradient-text-gold">Premium</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">Get advanced AI features, unlimited access, and priority support to accelerate your career journey.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Free */}
            <div className="glass p-6">
              <div className="mb-4">
                <div className="text-lg font-bold text-white">Free</div>
                <div className="text-3xl font-black text-white mt-1">₹0<span className="text-sm font-normal text-slate-400">/month</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckCircle size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl font-bold border border-slate-700 text-slate-400" disabled>Current Plan</button>
            </div>

            {/* Premium */}
            <div className="relative overflow-hidden rounded-2xl border p-6"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.08))', borderColor: 'rgba(245,158,11,0.3)' }}>
              <div className="mb-4">
                <div className="text-lg font-bold text-white flex items-center gap-3">
                  Premium <Zap size={16} className="text-yellow-400" />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                    POPULAR
                  </span>
                </div>
                <div className="text-3xl font-black text-white mt-1">₹499<span className="text-sm font-normal text-slate-400">/month</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white">
                    <CheckCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {showPayment ? (
                <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col items-center animate-fade-in-up">
                  <p className="text-slate-300 text-sm mb-4 font-medium text-center">Scan QR to pay via PhonePe or UPI</p>
                  <div className="bg-white p-2 rounded-xl mb-4 shadow-xl w-[200px]">
                    <img src="/payment-qr.png" alt="Payment QR Code" className="w-full h-auto rounded-lg" />
                  </div>
                  <div className="w-full p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mb-4">
                    <div className="flex justify-between text-sm font-bold text-white">
                      <span>Premium — 1 Month</span>
                      <span>₹499</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setShowPayment(false)} className="btn-ghost flex-1 py-2">Cancel</button>
                    <button onClick={handleUpgrade} disabled={loading}
                      className="flex-[2] py-2 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : '✅'} Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowPayment(true)}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 mt-2"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                  <Zap size={18} /> Upgrade Now
                </button>
              )}
            </div>
          </div>
        </>
      )}


    </div>
  );
}
