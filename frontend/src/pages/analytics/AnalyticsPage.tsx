import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { data: dashboard, loading } = useApi<any>('/analytics/dashboard');
  const { data: revenue } = useApi<any[]>('/analytics/revenue');
  const { data: growth } = useApi<any[]>('/analytics/user-growth');

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card"><span className="text-sm text-dark-400">DAU</span><p className="text-2xl font-bold">{dashboard?.dau || 0}</p></div>
        <div className="stat-card"><span className="text-sm text-dark-400">MAU</span><p className="text-2xl font-bold">{dashboard?.mau || 0}</p></div>
        <div className="stat-card"><span className="text-sm text-dark-400">Daily Revenue</span><p className="text-2xl font-bold">${dashboard?.dailyRevenue || 0}</p></div>
        <div className="stat-card"><span className="text-sm text-dark-400">Churn</span><p className="text-2xl font-bold text-red-400">{dashboard?.churnRate?.toFixed(1) || 0}%</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenue || []}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} /><Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>
        <div className="card"><h3 className="text-lg font-semibold mb-4">User Growth</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={growth || []}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} /><Line type="monotone" dataKey="new_users" stroke="#10b981" strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>
      </div>
    </div>
  );
}
