import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DollarSign, TrendingUp, Users, Percent } from 'lucide-react';

export default function RevenuePage() {
  const { data, loading } = useApi<any>('/revenue/dashboard');
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Revenue Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={data ? '$' + Number(data.totalRevenue).toLocaleString() : '$0'} icon={DollarSign} />
        <StatCard title="Monthly Revenue" value={data ? '$' + Number(data.monthlyRevenue).toLocaleString() : '$0'} icon={TrendingUp} />
        <StatCard title="Active Subscriptions" value={data?.activeSubscriptions || 0} icon={Users} />
        <StatCard title="Churn Rate" value={data ? data.churnRate + '%' : '0%'} icon={Percent} />
      </div>
    </div>
  );
}
