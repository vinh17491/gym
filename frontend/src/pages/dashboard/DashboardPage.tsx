import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Activity, Users, DollarSign, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, loading } = useApi<{ dailyRevenue: number; activeSubscriptions: number; weeklyWorkouts: number; upcomingClasses: number }>('/analytics/dashboard');

  if (user?.role === 'admin') return <Navigate to="/admin" />;
  if (user?.role === 'coach') return <Navigate to="/coach" />;

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={data?.dailyRevenue ? '$' + data.dailyRevenue : '$0'} icon={DollarSign} />
        <StatCard title="Active Members" value={data?.activeSubscriptions || 0} icon={Users} />
        <StatCard title="Weekly Workouts" value={0} icon={Activity} />
        <StatCard title="Upcoming Classes" value={0} icon={Calendar} />
      </div>
    </div>
  );
}
