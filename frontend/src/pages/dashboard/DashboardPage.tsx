import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/shared/StatCard';
import { Activity, Users, DollarSign, Calendar, TrendingUp, Dumbbell, Flame } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: bookings } = useApi<Array<{status:string;booking_date:string}>>('/bookings');
  const { data: points } = useApi<{balance:number}>('/loyalty/points');

  if (user?.role === 'admin') return <Navigate to="/admin" />;
  if (user?.role === 'coach') return <Navigate to="/coach" />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Here's your fitness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Loyalty Points" value={points?.balance || 0} icon={<DollarSign size={20} />} />
        <StatCard title="Bookings" value={bookings?.length || 0} icon={<Users size={20} />} subtitle="Your sessions" />
        <StatCard title="Completed Sessions" value={bookings?.filter(item=>item.status==='completed').length || 0} icon={<Dumbbell size={20} />} />
        <StatCard title="Upcoming Classes" value={bookings?.filter(item=>['pending','confirmed'].includes(item.status)).length || 0} icon={<Calendar size={20} />} subtitle="Scheduled" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#22C55E]/20 to-[#16A34A]/5 border border-[#22C55E]/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#22C55E]/20"><Flame size={20} className="text-[#22C55E]" /></div>
            <h3 className="font-semibold">Workout Plans</h3>
          </div>
          <p className="text-sm text-[#94A3B8] mb-3">Access your personalized workout routines</p>
          <button className="btn-primary btn-sm">View Workouts</button>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20"><Activity size={20} className="text-blue-400" /></div>
            <h3 className="font-semibold">Book a Coach</h3>
          </div>
          <p className="text-sm text-[#94A3B8] mb-3">Schedule sessions with expert trainers</p>
          <button className="btn-secondary btn-sm">Book Now</button>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20"><TrendingUp size={20} className="text-purple-400" /></div>
            <h3 className="font-semibold">Progress</h3>
          </div>
          <p className="text-sm text-[#94A3B8] mb-3">Track your fitness journey and achievements</p>
          <button className="btn-secondary btn-sm">View Progress</button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <button className="btn-ghost btn-sm">View All</button>
        </div>
        <div className="space-y-3">
          {[1,2,3,4].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[#0F172A]/50">
              <div className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Workout session completed</p>
                <p className="text-xs text-[#64748B]">2 hours ago</p>
              </div>
              <span className="text-xs text-[#64748B]">-</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
