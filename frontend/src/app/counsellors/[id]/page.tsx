'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { counsellorAPI, paymentAPI } from '@/lib/api';
import { Star, CheckCircle, Globe, Briefcase, Clock, ArrowLeft, Calendar, CreditCard, Loader2, Video } from 'lucide-react';
import Link from 'next/link';

const timeSlots = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '19:00 - 20:00'];

export default function CounsellorDetailPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);

  const { data: counsellor, isLoading } = useQuery({
    queryKey: ['counsellor', id],
    queryFn: async () => { const res = await counsellorAPI.byId(id); return res.data; },
    enabled: isAuthenticated && !!id,
  });

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return;
    setShowPayment(true);
  };

  const handlePayAndBook = async () => {
    setBooking(true);
    try {
      await counsellorAPI.book({
        counsellorProfileId: id,
        date: selectedDate,
        timeSlot: selectedSlot,
        price: counsellor?.sessionPrice,
      });
      setBooked(true);
      setShowPayment(false);
    } finally {
      setBooking(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  if (isLoading) return (
    <div className="flex min-h-screen bg-[#050816]">
      <Sidebar />
      <div className="flex-1 ml-60 pt-16 p-6 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#050816]">
      <Sidebar />
      <div className="flex-1 ml-60 pt-16 p-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/counsellors" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> Back to Counsellors
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-5">
              <div className="glass p-6">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {counsellor?.name?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-black text-white">{counsellor?.name}</h1>
                      {counsellor?.isVerified && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                          <CheckCircle size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{counsellor?.qualification}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{counsellor?.rating?.toFixed(1)}</span>
                        <span className="text-xs text-slate-500">rating</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{counsellor?.experience} experience</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Specialization', value: counsellor?.specialization, icon: Briefcase },
                    { label: 'Languages', value: counsellor?.languages, icon: Globe },
                    { label: 'Availability', value: counsellor?.availability, icon: Clock },
                    { label: 'Session Price', value: `₹${counsellor?.sessionPrice?.toLocaleString()}`, icon: CreditCard },
                  ].map((info) => (
                    <div key={info.label} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <info.icon size={11} /> {info.label}
                      </div>
                      <div className="text-sm text-white font-medium">{info.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">What to expect</h2>
                  <div className="space-y-2">
                    {['45-minute 1-on-1 video session', 'Personalized career assessment report', 'Action plan & follow-up resources', 'Recording of the session (on request)'].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Session format */}
              <div className="glass p-5">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Video size={16} className="text-indigo-400" /> Session Format
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {['Video Call', 'Screen Share', 'Chat Support'].map((f) => (
                    <div key={f} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-center">
                      <div className="text-xs text-indigo-300 font-medium">{f}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="space-y-4">
              {booked ? (
                <div className="glass p-6 text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-black text-white mb-2">Session Booked!</h3>
                  <p className="text-slate-400 text-sm mb-4">Your session with {counsellor?.name} is confirmed for {selectedDate} at {selectedSlot}</p>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 mb-4">
                    <CheckCircle size={14} className="inline mr-1" /> A confirmation will appear in your dashboard
                  </div>
                  <Link href="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2">
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="glass p-6">
                  <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" /> Book a Session
                  </h2>

                  <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-2">Select Date</label>
                    <input type="date" className="input-field"
                      min={minDate.toISOString().split('T')[0]}
                      value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs text-slate-400 mb-2">Select Time Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-2 rounded-lg text-xs border transition-all ${selectedSlot === slot
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                            : 'border-slate-700 text-slate-400 hover:border-indigo-500/40'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Session Fee</span>
                      <span className="text-white font-bold">₹{counsellor?.sessionPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Platform Fee</span>
                      <span>₹0</span>
                    </div>
                  </div>

                  <button onClick={handleBook} disabled={!selectedDate || !selectedSlot}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    <CreditCard size={16} /> Proceed to Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass p-8 max-w-md w-full animate-fade-in-up">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <CreditCard className="text-indigo-400" size={20} /> Simulated Payment
            </h2>
            <p className="text-slate-400 text-sm mb-6">This is a demo payment flow. No real charges will be made.</p>

            <div className="space-y-3 mb-6">
              <div className="input-field text-slate-400">4242 4242 4242 4242</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="input-field text-slate-400">12/27</div>
                <div className="input-field text-slate-400">123</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-5 text-sm">
              <div className="flex justify-between text-white font-bold">
                <span>Total</span>
                <span>₹{counsellor?.sessionPrice?.toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Session with {counsellor?.name} on {selectedDate} at {selectedSlot}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPayment(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handlePayAndBook} disabled={booking}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {booking ? <Loader2 size={16} className="animate-spin" /> : '✅'} Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
