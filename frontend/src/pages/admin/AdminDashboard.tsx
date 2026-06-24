import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/ui/stat-card';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import PageHeader from '../../components/shared/page-header';
import { DollarSign, Users, UserPlus, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Dashboard { totalRevenue: number; monthlyRevenue: number; dailyRevenue: number; newCustomers: number; activeSubscriptions: number; churnRate: number; }

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useApi<Dashboard>('/revenue/dashboard');
  const { data: trend } = useApi<any[]>('/revenue/trend');
  const { data: sales } = useApi<any[]>('/revenue/membership-sales');

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (loading) return <LoadingSpinner />;

  const chartData = (trend || []).slice(-30);
  const salesData = (sales || []).slice(0, 10);

  return (
    <div className='animate-fade-in space-y-6'>
      <PageHeader title='Admin Dashboard' subtitle='Overview of your business' />
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatCard title='Total Revenue' value={data ? '$' + Number(data.totalRevenue).toLocaleString() : ''} icon={DollarSign} trend={{ value: 12, positive: true }} />
        <StatCard title='Monthly Revenue' value={data ? '$' + Number(data.monthlyRevenue).toLocaleString() : ''} icon={TrendingUp} trend={{ value: 8, positive: true }} />
        <StatCard title='Active Subscriptions' value={data?.activeSubscriptions || 0} icon={Users} subtitle='Current members' />
        <StatCard title='New Customers Today' value={data?.newCustomers || 0} icon={UserPlus} />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='card'><h3 className='text-lg font-semibold mb-4'>Revenue Trend (30 days)</h3><div className='h-72'><ResponsiveContainer width='100%' height='100%'><LineChart data={chartData}><CartesianGrid strokeDasharray='3 3' stroke='#1e293b' /><XAxis dataKey='date' stroke='#64748B' fontSize={12} /><YAxis stroke='#64748B' fontSize={12} /><Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8 }} /><Line type='monotone' dataKey='revenue' stroke='#22C55E' strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></div>
        <div className='card'><h3 className='text-lg font-semibold mb-4'>Membership Sales</h3><div className='h-72'><ResponsiveContainer width='100%' height='100%'><BarChart data={salesData}><CartesianGrid strokeDasharray='3 3' stroke='#1e293b' /><XAxis dataKey='plan' stroke='#64748B' fontSize={12} /><YAxis stroke='#64748B' fontSize={12} /><Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8 }} /><Bar dataKey='count' fill='#22C55E' radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></div>
      </div>
    </div>
  );
}
