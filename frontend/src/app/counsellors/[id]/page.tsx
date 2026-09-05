'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { counsellorAPI } from '@/lib/api';
import { Star, CheckCircle, Globe, Briefcase, Clock, ArrowLeft, Calendar, CreditCard, Loader2, Video, QrCode, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const timeSlots = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '19:00 - 20:00'];

export default function CounsellorDetailPage() {
  const { isAuthenticated } = useAuthStore();
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={36} className="animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/counsellors" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 text-xs sm:text-sm font-semibold transition-colors">
        <ArrowLeft size={16} /> Back to All Counsellors
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 sm:gap-5 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white flex-shrink-0 shadow-md"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                {counsellor?.name?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{counsellor?.name}</h1>
                  {counsellor?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                      <CheckCircle size={13} className="text-emerald-600" /> Verified Expert
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">{counsellor?.qualification}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Star size={14} className="fill-amber-400 text-amber-500" />
                    <span className="text-xs font-bold text-amber-800">{counsellor?.rating?.toFixed(1)}</span>
                    <span className="text-[11px] text-amber-600 font-medium">Rating</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-600 font-medium">{counsellor?.experience} Experience</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mb-6">
              {[
                { label: 'Specialization', value: counsellor?.specialization, icon: Briefcase, color: 'text-indigo-600' },
                { label: 'Languages', value: counsellor?.languages, icon: Globe, color: 'text-cyan-600' },
                { label: 'Availability', value: counsellor?.availability, icon: Clock, color: 'text-purple-600' },
                { label: 'Session Price', value: `₹${counsellor?.sessionPrice?.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600' },
              ].map((info) => (
                <div key={info.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                    <info.icon size={13} className={info.color} /> {info.label}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-900 font-bold truncate">{info.value}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">What to expect</h2>
              <div className="space-y-2.5">
                {['45-minute 1-on-1 video session', 'Personalized career assessment report', 'Action plan & follow-up resources', 'Recording of the session (on request)'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session format */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Video size={18} className="text-indigo-600" /> Session Format
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {['Video Call', 'Screen Share', 'Chat Support'].map((f) => (
                <div key={f} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
                  <div className="text-xs text-indigo-900 font-bold">{f}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="space-y-4">
          {booked ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Session Booked!</h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-5 font-medium">
                Your 1-on-1 session with <strong className="text-slate-900">{counsellor?.name}</strong> is confirmed for <span className="text-indigo-600 font-bold">{selectedDate}</span> at <span className="text-indigo-600 font-bold">{selectedSlot}</span>.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold mb-5 flex items-center justify-center gap-2">
                <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" /> Confirmation saved to Dashboard
              </div>
              <Link href="/dashboard" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Calendar size={18} className="text-indigo-600" /> Book Expert Session
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  min={minDate.toISOString().split('T')[0]}
                  value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Time Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${selectedSlot === slot
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-white'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 font-medium">Session Fee</span>
                  <span className="text-slate-900 font-bold">₹{counsellor?.sessionPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Platform Fee</span>
                  <span className="text-emerald-600 font-bold">₹0 Free</span>
                </div>
              </div>

              <button onClick={handleBook} disabled={!selectedDate || !selectedSlot}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all">
                <CreditCard size={18} /> Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PhonePe QR Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-fade-in-up text-center">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-left">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Pay via PhonePe QR</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Scan with any UPI app to pay</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={13} /> Verified
              </span>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <CheckCircle size={14} className="text-emerald-600" /> Receiving money on PhonePe
              </div>
              
              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 w-full max-w-[240px]">
                <img 
                  src="/phonepe-qr.png" 
                  alt="PhonePe Payment QR Code" 
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>

              <div className="mt-3 text-xs font-bold text-slate-700">
                Central Bank - 4217
              </div>
            </div>

            {/* Amount Summary */}
            <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl text-left">
              <div className="flex items-center justify-between text-slate-900 font-black text-sm mb-1">
                <span>Total Amount Due</span>
                <span className="text-indigo-600 text-base">₹{counsellor?.sessionPrice?.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                1-on-1 Session with {counsellor?.name} • {selectedDate} ({selectedSlot})
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowPayment(false)} 
                className="w-1/3 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePayAndBook} 
                disabled={booking}
                className="w-2/3 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {booking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                Confirm & Complete Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


