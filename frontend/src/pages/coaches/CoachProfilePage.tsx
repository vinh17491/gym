import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, Clock, CheckCircle, ArrowLeft, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getCoachById, type CoachDetail } from '../../services/coaches';
import { createBooking, getCoachAvailability } from '../../services/bookings';
import toast from 'react-hot-toast';

export default function CoachProfilePage() {
  const { id } = useParams();
  const [coach, setCoach] = useState<CoachDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Date selection logic
  const [selectedDate, setSelectedDate] = useState<string>('');

  const upcomingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      // Simulate availability: make all days available
      const isAvailable = true;
      dates.push({
        date: d,
        dateString: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayName: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isAvailable
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (!selectedDate && upcomingDates.length > 0) {
      const firstAvail = upcomingDates.find(d => d.isAvailable);
      if (firstAvail) setSelectedDate(firstAvail.dateString);
    }
  }, [upcomingDates, selectedDate]);

  const [bookedSlotsByDate, setBookedSlotsByDate] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!id || upcomingDates.length === 0) return;
    const fetchAvailabilities = async () => {
      const results = await Promise.all(
        upcomingDates.map(async (d) => {
          try {
            const avail = await getCoachAvailability(Number(id), d.dateString);
            return { dateString: d.dateString, bookedSlots: avail?.booked_slots || [] };
          } catch {
            return { dateString: d.dateString, bookedSlots: [] };
          }
        })
      );
      const availMap: Record<string, string[]> = {};
      results.forEach(r => {
        availMap[r.dateString] = r.bookedSlots;
      });
      setBookedSlotsByDate(availMap);
    };
    fetchAvailabilities();
  }, [id, upcomingDates]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBooking = async () => {
    if (!coach || !selectedSlot || !selectedDate) return;
    try {
      setBookingLoading(true);

      const startHour = parseInt(selectedSlot.split(':')[0], 10);
      const endHour = startHour + 1;
      const endTime = `${String(endHour).padStart(2, '0')}:${selectedSlot.split(':')[1]}`;

      await createBooking({
        coach_id: parseInt(id!),
        booking_date: selectedDate,
        start_time: selectedSlot,
        end_time: endTime,
      });

      toast.success('Đặt lịch thành công!');
      setShowBookingModal(false);
      setBookedSlotsByDate(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), selectedSlot]
      }));
      setSelectedSlot(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể đặt lịch. Vui lòng thử lại.');
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      getCoachById(id).then(data => {
        setCoach(data);
        setLoading(false);
      }).catch(() => {
        setError('Failed to load coach');
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading coach profile...</p>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen bg-[#020617] py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Coach Not Found</h2>
          <Link to="/coaches" className="text-[#60a5fa] hover:text-[#93c5fd]">Back to Coaches</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/coaches" className="mb-8 inline-flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to All Coaches
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Coach Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="h-32 w-32 flex-shrink-0 rounded-full bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] flex items-center justify-center text-4xl font-bold text-white">
                  {coach.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-white">{coach.name}</h1>
                  <p className="mb-3 text-lg text-[#60a5fa]">{coach.specialty}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-[#94a3b8]">
                    <span className="flex items-center gap-1"><Star size={16} className="text-[#fbbf24]" /> {Number(coach.rating || 5).toFixed(1)} ({coach.reviews || 0} reviews)</span>
                    <span className="flex items-center gap-1"><MapPin size={16} /> {coach.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={16} /> {coach.experience}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-[#1e293b] pt-6">
                <h3 className="mb-3 text-lg font-semibold text-white">About</h3>
                <p className="text-[#94a3b8] leading-relaxed">{coach.bio}</p>
              </div>
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {coach.certifications?.map(cert => (
                    <span key={cert} className="inline-flex items-center gap-1 rounded-full bg-[#2563eb]/10 px-3 py-1 text-sm text-[#60a5fa]">
                      <CheckCircle size={14} /> {cert}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Reviews ({coach.reviews || 0})</h2>
              <div className="space-y-4">
                {coach.reviewsList?.map((review: any, i: number) => (
                  <div key={i} className="border-b border-[#1e293b] pb-6 last:border-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1e293b] flex items-center justify-center text-sm font-semibold text-white">
                          {(review.user || 'U').split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-white">{review.user}</p>
                          <p className="text-xs text-[#64748b]">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={14} className={j < review.rating ? 'text-[#fbbf24] fill-[#fbbf24]' : 'text-[#1e293b]'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#94a3b8]">{review.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Member Results */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Member Results</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {coach.memberResults?.map((result, i) => (
                  <div key={i} className="rounded-lg border border-[#1e293b] bg-[#020617] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle size={16} className="text-[#22c55e]" />
                      <p className="font-medium text-white">{result.name}</p>
                    </div>
                    <p className="text-sm text-[#94a3b8]">{result.result}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24 rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6">
              <div className="mb-6 text-center">
                <p className="mb-2 text-4xl font-bold text-white">${coach.price}</p>
                <p className="text-[#94a3b8]">per session</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Select Date</h3>
                  <span className="text-xs text-[#94a3b8]">3 Weeks</span>
                </div>

                {/* Horizontal scrollable date list */}
                <div className="flex overflow-x-auto gap-2 pb-2 snap-x scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
                  {upcomingDates.map((d, i) => {
                    const dayBookedSlots = bookedSlotsByDate[d.dateString] || [];
                    const isFullyBooked = dayBookedSlots.length >= (coach?.availableSlots?.length || 8);
                    const isSelectable = d.isAvailable && !isFullyBooked;

                    return (
                      <button
                        key={i}
                        disabled={!isSelectable}
                        onClick={() => setSelectedDate(d.dateString)}
                        className={`relative flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border snap-start transition-all ${!isSelectable
                            ? 'border-[#1e293b] bg-[#020617]/50 text-[#475569] cursor-not-allowed opacity-50'
                            : selectedDate === d.dateString
                              ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-lg shadow-blue-500/20'
                              : 'border-[#1e293b] bg-[#020617] text-[#94a3b8] hover:border-[#3b82f6] hover:text-white'
                          }`}
                      >
                        <span className="text-xs font-medium uppercase tracking-wider mb-1">{d.dayName}</span>
                        <span className="text-xl font-bold">{d.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Available Slots</h3>
                <div className="grid grid-cols-3 gap-2">
                  {coach.availableSlots?.map(slot => {
                    const isBooked = bookedSlotsByDate[selectedDate]?.includes(slot);
                    let isAvailable = !isBooked;

                    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
                    if (selectedDate === todayStr) {
                      const now = new Date();
                      const [hour, minute] = slot.split(':').map(Number);
                      if (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() > minute)) {
                        isAvailable = false;
                      }
                    }

                    return (
                      <button
                        key={slot}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border p-2 text-center text-sm transition-all ${!isAvailable
                            ? 'border-[#1e293b] bg-[#020617]/50 text-[#475569] cursor-not-allowed opacity-50'
                            : selectedSlot === slot
                              ? 'border-[#2563eb] bg-[#2563eb] text-white'
                              : 'border-[#1e293b] bg-[#020617] text-[#94a3b8] hover:border-[#2563eb] hover:text-white'
                          }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                disabled={!selectedSlot}
                className="w-full rounded-lg bg-[#2563eb] py-4 text-lg font-semibold text-white transition-all hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {coach.available ? 'Book Session' : 'Join Waitlist'}
              </button>

              <p className="mt-4 text-center text-sm text-[#64748b]">
                <MessageSquare size={14} className="mr-1 inline" />
                Free consultation included
              </p>
            </motion.div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6">
              <h3 className="mb-4 text-xl font-bold text-white">Book Session with {coach.name}</h3>
              <p className="mb-2 text-[#94a3b8]">Date: <span className="text-white">{new Date(selectedDate).toLocaleDateString('vi-VN')}</span></p>
              <p className="mb-4 text-[#94a3b8]">Time: <span className="text-white">{selectedSlot}</span></p>
              <p className="mb-6 text-[#94a3b8]">Price: <span className="text-white font-semibold">${coach.price}</span></p>
              <div className="flex gap-3">
                <button onClick={() => setShowBookingModal(false)} className="flex-1 rounded-lg border border-[#1e293b] py-3 text-[#94a3b8] hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-lg bg-[#2563eb] py-3 font-semibold text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Đang xử lý...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}