import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Users, ChevronLeft, ChevronRight, CheckCircle, Video, MapPin } from 'lucide-react';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';

const coaches = [
  { id: 1, name: 'Coach Mike', specialty: 'Strength & Conditioning', rating: 4.9, sessions: 342, image: null, bio: '10+ years experience. Specialist in strength training and muscle building.', available: true },
  { id: 2, name: 'Coach Sarah', specialty: 'HIIT & Cardio', rating: 4.8, sessions: 289, image: null, bio: 'Certified HIIT instructor. Love helping people burn fat effectively.', available: true },
  { id: 3, name: 'Coach Emma', specialty: 'Yoga & Flexibility', rating: 4.9, sessions: 198, image: null, bio: 'RYT-500 certified yoga teacher. Helping you find balance and flexibility.', available: false },
  { id: 4, name: 'Coach Alex', specialty: 'CrossFit & Functional', rating: 4.7, sessions: 156, image: null, bio: 'CrossFit Level 2 trainer. Functional fitness for real life.', available: true },
];

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

export default function CoachBooking() {
  const [step, setStep] = useState<'coach' | 'slot' | 'confirm'>('coach');
  const [selectedCoach, setSelectedCoach] = useState<typeof coaches[0] | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleBook = () => {
    // API call would go here
    setStep('confirm');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="page-title">Book a Coach</h1>
        <p className="text-dark-400 mt-1">Find your perfect coach and schedule a session</p>
      </div>

      {/* Steps indicator */}
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
          {coaches.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`card-hover p-5 cursor-pointer ${selectedCoach?.id === c.id ? 'border-primary-500/50 bg-primary-500/5' : ''} ${!c.available ? 'opacity-60 pointer-events-none' : ''}`}
              onClick={() => { setSelectedCoach(c); setStep('slot'); }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">
                  {c.name.split(' ')[1][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-dark-400">{c.specialty}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" />{c.rating}</span>
                    <span className="flex items-center gap-1"><Users size={12} />{c.sessions} sessions</span>
                  </div>
                  <p className="text-xs text-dark-500 mt-2 line-clamp-2">{c.bio}</p>
                </div>
                {c.available && <Badge variant="green">Available</Badge>}
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

            {/* Day selector */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
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

            {/* Time slots */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    selectedSlot === slot ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  <Clock size={14} />{slot}
                </button>
              ))}
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
                  <p className="text-xs text-dark-500 mt-1">60 min session · Virtual or In-person</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep('confirm')} disabled={!selectedSlot}>Continue to Confirm</Button>
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
            <h2 className="text-xl font-bold">Booking Confirmed!</h2>
            <p className="text-dark-400 mt-2">Your session has been scheduled.</p>
            <div className="mt-6 p-4 bg-dark-800/50 rounded-lg text-left space-y-2">
              <div className="flex items-center gap-2 text-sm"><Calendar size={14} className="text-primary-400" /> {days[selectedDay]?.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-primary-400" /> {selectedSlot} · 60 min</div>
              <div className="flex items-center gap-2 text-sm"><Users size={14} className="text-primary-400" /> {selectedCoach.name}</div>
              <div className="flex items-center gap-2 text-sm"><Video size={14} className="text-primary-400" /> Virtual Session</div>
            </div>
            <Button className="mt-6 w-full" onClick={() => { setStep('coach'); setSelectedSlot(null); }}>Book Another Session</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
