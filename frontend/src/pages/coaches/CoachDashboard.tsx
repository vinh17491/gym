import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Activity, DollarSign } from 'lucide-react';

export default function CoachDashboard() {
  const { data, loading } = useApi<{ assignedMembers: number; activeMembers: number; monthlyEarnings: number }>('/coaches/dashboard');
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Coach Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Assigned Members" value={data?.assignedMembers || 0} icon={Users} />
        <StatCard title="Active This Month" value={data?.activeMembers || 0} icon={Activity} />
        <StatCard title="Monthly Earnings" value={data ? '$' + Number(data.monthlyEarnings).toLocaleString() : '$0'} icon={DollarSign} />
      </div>
    </div>
  );
}
