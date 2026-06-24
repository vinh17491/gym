import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/shared/StatCard';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import { motion } from 'framer-motion';
import { Users, Activity, DollarSign, Calendar } from 'lucide-react';

export default function CoachDashboard() {
  const { data, loading, error, refetch } = useApi<any>('/coaches/dashboard');

  if (loading) return <LoadingSpinner text="Loading coach dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Coach Dashboard</h1>
        <p className="text-dark-400 mt-1">Your coaching overview</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Members" value={data?.assignedMembers || 0} icon={<Users size={20} />} />
        <StatCard title="Active This Month" value={data?.activeMembers || 0} icon={<Activity size={20} />} />
        <StatCard title="Monthly Earnings" value={data ? `$${Number(data.monthlyEarnings).toLocaleString()}` : '$0'} icon={<DollarSign size={20} />} />
        <StatCard title="Upcoming Sessions" value={0} icon={<Calendar size={20} />} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h3 className="section-title">Schedule</h3>
        <p className="text-dark-400 text-sm">Your coaching schedule will appear here.</p>
      </motion.div>
    </div>
  );
}
