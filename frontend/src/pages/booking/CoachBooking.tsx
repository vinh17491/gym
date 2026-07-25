import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Users, ChevronLeft, ChevronRight, CheckCircle, Video, MessageSquare, Shield } from 'lucide-react';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import { getBookableCoaches, getCoachAvailability, createBooking, BookableCoach } from '../../services/bookings';
import api from '../../api/axios';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';

interface BookingItem {
  id: number;
  coach_id: number;
  member_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  coach_notes?: string;
  rating?: number;
  review?: string;
  coach_name: string;
}

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const days = Array.from({ length: 21 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CoachBooking() {
  const user = useAuthStore(state => state.user);
  const isCoach = user?.role === 'coach';

  // ── ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURN ───────────
  // Coach view hooks
  const coachBookings = useApi<BookingItem[]>('/bookings');
  const [coachStatusError, setCoachStatusError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [coachNotesInput, setCoachNotesInput] = useState('');

  // Member wizard hooks
  const [step, setStep] = useState<'coach' | 'slot' | 'confirm'>('coach');
  const [coaches, setCoaches] = useState<BookableCoach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<BookableCoach | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Rating Modal state (member only)
  const myBookings = useApi<BookingItem[]>('/bookings');
  const [ratingBookingId, setRatingBookingId] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [reviewInput, setReviewInput] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    if (isCoach) return; // Skip member data fetching for coaches
    setIsLoading(true);
    getBookableCoaches()
      .then(setCoaches)
      .catch((err) => setError(err?.message || 'Failed to load coaches'))
      .finally(() => setIsLoading(false));
  }, [isCoach]);

  useEffect(() => {
    if (!selectedCoach || isCoach) return;
    const date = formatDateInput(days[selectedDay]);
    setIsLoading(true);
    getCoachAvailability(selectedCoach.id, date)
      .then((availability) => setAvailableSlots(availability.available_slots))
      .catch((err) => setError(err?.message || 'Failed to load availability'))
      .finally(() => setIsLoading(false));
  }, [selectedCoach, selectedDay, isCoach]);

  // ── COACH-SPECIFIC FUNCTIONS ─────────────────────────────────────────────
  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      setCoachStatusError(null);
      await api.put(`/bookings/${id}/status`, { status, coach_notes: notes });
      setCompletingId(null);
      setCoachNotesInput('');
      void coachBookings.refetch();
    } catch (err: any) {
      setCoachStatusError(err?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  // ── MEMBER-SPECIFIC FUNCTIONS ─────────────────────────────────────────────
  const handleCoachSelect = (coach: BookableCoach) => {
    setSelectedCoach(coach);
    setSelectedSlot(null);
    setStep('slot');
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedCoach || !selectedSlot) return;
    try {
      setIsLoading(true);
      const bookingDate = formatDateInput(days[selectedDay]);
      const startTime = selectedSlot;
      const endHour = Number(startTime.split(':')[0]) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${startTime.split(':')[1]}`;
      await createBooking({
        coach_id: selectedCoach.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
      });
      setBookingSuccess(true);
      setStep('confirm');
      setError(null);
      void myBookings.refetch();
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(apiMessage || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRating = async () => {
    if (!ratingBookingId) return;
    try {
      setRatingSubmitting(true);
      await api.post(`/bookings/${ratingBookingId}/rating`, {
        rating: ratingValue,
        review: reviewInput,
      });
      setRatingBookingId(null);
      setReviewInput('');
      void myBookings.refetch();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // ── COACH VIEW (early return AFTER all hooks) ──────────────────────────
  if (isCoach) {
    const pending = (coachBookings.data || []).filter(b => b.status === 'pending');
    const upcoming = (coachBookings.data || []).filter(b => b.status === 'confirmed');
    const past = (coachBookings.data || []).filter(b => ['completed', 'cancelled'].includes(b.status));

    return (
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-3"><Shield size={28} className="text-blue-400" /> Quản lý Lịch Tập</h1>
            <p className="text-slate-400 mt-1">Xác nhận yêu cầu, quản lý lịch và hoàn thành buổi tập.</p>
          </div>
        </motion.div>

        {coachStatusError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{coachStatusError}</div>
        )}

        {/* Pending Requests */}
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Yêu cầu đang chờ ({pending.length})
          </h2>
          {pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map(b => (
                <div key={b.id} className="card p-5 border border-amber-900/30 bg-amber-950/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-semibold text-white">{(b as any).member_name}</span>
                      <span className="ml-3 text-xs text-slate-400">{new Date(b.booking_date).toLocaleDateString('vi-VN')} · {b.start_time} – {b.end_time}</span>
                    </div>
                    <Badge variant="yellow">pending</Badge>
                  </div>
                  {b.notes && <p className="text-xs text-slate-400">Ghi chú: {b.notes}</p>}
                  <div className="flex gap-2 justify-end">
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600/30" onClick={() => updateStatus(b.id, 'confirmed')}>✓ Xác nhận</button>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 border border-red-600/30 hover:bg-red-600/30" onClick={() => updateStatus(b.id, 'cancelled')}>✕ Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 py-4">Không có yêu cầu nào đang chờ.</p>}
        </section>

        {/* Upcoming Confirmed */}
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" /> Lịch tập sắp tới ({upcoming.length})
          </h2>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="card p-5 border border-blue-900/30 bg-blue-950/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-semibold text-white">{(b as any).member_name}</span>
                      <span className="ml-3 text-xs text-slate-400">{new Date(b.booking_date).toLocaleDateString('vi-VN')} · {b.start_time} – {b.end_time}</span>
                    </div>
                    <Badge variant="blue">confirmed</Badge>
                  </div>
                  {completingId === b.id ? (
                    <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-300">Ghi chú / Nhận xét Coach:</label>
                      <textarea
                        className="w-full rounded-md bg-slate-950 border border-slate-700 p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        rows={2}
                        placeholder="Nhận xét, hướng dẫn hoặc lưu ý cho học viên..."
                        value={coachNotesInput}
                        onChange={e => setCoachNotesInput(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700" onClick={() => setCompletingId(null)}>Hủy</button>
                        <button className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-500 flex items-center gap-1" onClick={() => updateStatus(b.id, 'completed', coachNotesInput)}>
                          <CheckCircle size={14} /> Xác nhận hoàn thành
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600/30" onClick={() => { setCompletingId(b.id); setCoachNotesInput(''); }}>Hoàn thành buổi tập</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 py-4">Không có lịch tập sắp tới.</p>}
        </section>

        {/* Past Sessions */}
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-slate-500" /> Buổi tập đã qua ({past.length})
          </h2>
          {past.length > 0 ? (
            <div className="space-y-2">
              {past.map(b => (
                <div key={b.id} className="card p-4 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-sm font-medium text-white">{(b as any).member_name}</span>
                    <span className="ml-3 text-xs text-slate-500">{new Date(b.booking_date).toLocaleDateString('vi-VN')} · {b.start_time}</span>
                  </div>
                  <Badge variant={b.status === 'completed' ? 'green' : 'red'}>{b.status}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 py-4">Chưa có buổi tập nào đã hoàn thành.</p>}
        </section>
      </div>
    );
  }

  // ── MEMBER BOOKING WIZARD ──────────────────────────────────────────────
  if (isLoading && step === 'coach') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading coaches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="page-title">Book a Coach</h1>
        <p className="text-dark-400 mt-1">Find your perfect coach and schedule a session.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-8">
        {['coach', 'slot', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === s ? 'bg-primary-600 text-white' : i < ['coach', 'slot', 'confirm'].indexOf(step) ? 'bg-primary-600/20 text-primary-400' : 'bg-dark-800 text-dark-500'
            }`}>{i + 1}</div>
            <span className={`text-sm capitalize hidden sm:block ${step === s ? 'text-white' : 'text-dark-500'}`}>{s}</span>
            {i < 2 && <ChevronRight size={16} className="text-dark-600" />}
          </div>
        ))}
      </div>

      {step === 'coach' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coaches.map((coach) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: coach.id * 0.05 }}
              className={`card-hover p-5 cursor-pointer ${selectedCoach?.id === coach.id ? 'border-primary-500/50 bg-primary-500/5' : ''}`}
              onClick={() => handleCoachSelect(coach)}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">
                  {coach.name.split(' ').map((chunk) => chunk[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{coach.name}</h3>
                  <p className="text-sm text-dark-400">{coach.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400 fill-yellow-400" />{Number(coach.avg_rating || 5).toFixed(1)}</span>
                    <span className="flex items-center gap-1"><Users size={12} />{coach.total_members} members</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <Badge variant="green">Book</Badge>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/coaches/${coach.id}`;
                      }}
                      className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </motion.div>
          ))}
        </motion.div>
      )}

      {step === 'slot' && selectedCoach && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <button onClick={() => setStep('coach')} className="btn-ghost text-sm"><ChevronLeft size={16} /> Back to coaches</button>
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Select Date & Time</h2>
            <p className="text-sm text-dark-400 mb-6">with <span className="text-white font-medium">{selectedCoach.name}</span></p>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDay(i); setSelectedSlot(null); }}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[72px] transition-colors ${
                    selectedDay === i ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-medium">{d.toLocaleDateString('en', { weekday: 'short' })}</span>
                  <span className="text-lg font-bold">{d.getDate()}</span>
                  <span className="text-[10px]">{d.toLocaleDateString('en', { month: 'short' })}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {timeSlots.map((slot) => {
                const formatted = slot;
                let isAvailable = availableSlots.includes(formatted);
                if (selectedDay === 0) {
                  const now = new Date();
                  const [hour, minute] = slot.split(':').map(Number);
                  if (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() > minute)) {
                    isAvailable = false;
                  }
                }
                return (
                  <button
                    key={slot}
                    onClick={() => isAvailable && setSelectedSlot(formatted)}
                    disabled={!isAvailable}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      selectedSlot === formatted
                        ? 'bg-primary-600 text-white'
                        : isAvailable
                        ? 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
                        : 'bg-dark-900 text-dark-600 cursor-not-allowed'
                    }`}
                  >
                    <Clock size={14} />{slot}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-dark-800/50 rounded-lg border border-dark-700/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Session Details</p>
                  <p className="text-xs text-dark-400 mt-1">
                    {selectedCoach.name} · {days[selectedDay]?.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {selectedSlot ? ` · ${selectedSlot}` : ''}
                  </p>
                  <p className="text-xs text-dark-500 mt-1">60 min session · Direct Gym Session</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleConfirm} disabled={!selectedSlot || isLoading}>{isLoading ? 'Booking…' : 'Confirm Booking'}</Button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'confirm' && selectedCoach && selectedSlot && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold">{bookingSuccess ? 'Booking Confirmed!' : 'Booking Request Sent'}</h2>
            <p className="text-dark-400 mt-2">{bookingSuccess ? 'Your session has been scheduled.' : 'Your booking request is being processed.'}</p>
            <div className="mt-6 p-4 bg-dark-800/50 rounded-lg text-left space-y-2">
              <div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-primary-400" /> {days[selectedDay]?.toLocaleDateString('vi-VN')}</div>
              <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-primary-400" /> {selectedSlot} · 60 min</div>
              <div className="flex items-center gap-2 text-sm"><Users size={14} className="text-primary-400" /> {selectedCoach.name}</div>
              <div className="flex items-center gap-2 text-sm"><Video size={14} className="text-primary-400" /> Direct Gym Session</div>
            </div>
            <Button className="mt-6 w-full" onClick={() => { setStep('coach'); setSelectedSlot(null); setBookingSuccess(false); }}>Book Another Session</Button>
          </div>
        </motion.div>
      )}

      {/* Member Session History & Rating Section */}
      <div className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Lịch sử buổi tập & Đánh giá Coach</h2>
        {myBookings.data?.length ? (
          <div className="space-y-4">
            {myBookings.data.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-blue-400" />
                    <span className="font-semibold text-white">{item.coach_name}</span>
                    <span className="text-xs text-slate-400">{new Date(item.booking_date).toLocaleDateString('vi-VN')} ({item.start_time} - {item.end_time})</span>
                  </div>
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </div>

                {item.coach_notes && (
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/40 text-xs text-blue-200">
                    <strong className="block text-blue-400 mb-1">💬 Nhận xét của Coach:</strong>
                    <p>{item.coach_notes}</p>
                  </div>
                )}

                {item.status === 'completed' && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    {item.rating ? (
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <span className="flex items-center gap-1 font-bold"><Star size={14} className="fill-amber-400" /> {item.rating}/5</span>
                        {item.review && <span className="text-slate-400 font-normal">"{item.review}"</span>}
                      </div>
                    ) : (
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 flex items-center gap-1"
                        onClick={() => { setRatingBookingId(item.id); setRatingValue(5); setReviewInput(''); }}
                      >
                        <Star size={14} /> Gửi đánh giá buổi tập
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Bạn chưa có lịch tập nào trong hệ thống.</p>
        )}
      </div>

      {/* Member Rating Modal */}
      {ratingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={20} /> Đánh giá buổi tập
            </h3>
            
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRatingValue(star)} className="p-1 text-2xl transition-transform hover:scale-110">
                  <Star size={28} className={star <= ratingValue ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nhận xét của bạn (không bắt buộc):</label>
              <textarea
                className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Chia sẻ trải nghiệm buổi tập cùng Coach..."
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button className="secondary-button text-xs" onClick={() => setRatingBookingId(null)}>Hủy</button>
              <button className="primary-button text-xs" onClick={() => void submitRating()} disabled={ratingSubmitting}>
                {ratingSubmitting ? 'Đang gửi…' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


