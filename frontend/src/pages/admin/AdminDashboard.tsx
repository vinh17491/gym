import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DollarSign, Users, UserPlus, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Dashboard { totalRevenue: number; monthlyRevenue: number; dailyRevenue: number; newCustomers: number; activeSubscriptions: number; churnRate: number; }

export default function AdminDashboard() {
  const { data, loading } = useApi<Dashboard>('/revenue/dashboard');
  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={data ? '$' + Number(data.totalRevenue).toLocaleString() : '$0'} icon={DollarSign} trend={{ value: 12, positive: true }} />
        <StatCard title="Monthly Revenue" value={data ? '$' + Number(data.monthlyRevenue).toLocaleString() : '$0'} icon={TrendingUp} trend={{ value: 8, positive: true }} />
        <StatCard title="Active Subscriptions" value={data?.activeSubscriptions || 0} icon={Users} />
        <StatCard title="New Customers Today" value={data?.newCustomers || 0} icon={UserPlus} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h3 className="text-lg font-semibold mb-4">Revenue Trend</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={[]}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} /><Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>
        <div className="card"><h3 className="text-lg font-semibold mb-4">Membership Sales</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={[]}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} /><Bar dataKey="count" fill="#6366f1" /></BarChart></ResponsiveContainer></div></div>
      </div>
    </div>
  );
}
