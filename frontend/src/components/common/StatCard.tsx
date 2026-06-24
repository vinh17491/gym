import { LucideIcon } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: { title: string; value: string | number; icon: LucideIcon; trend?: { value: number; positive: boolean }; color?: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-dark-400">{title}</span>
        <div className={'p-2 rounded-lg bg-' + color + '-500/20'}><Icon size={18} className={'text-' + color + '-400'} /></div>
      </div>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {trend && <p className={'text-xs mt-1 ' + (trend.positive ? 'text-green-400' : 'text-red-400')}>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last month</p>}
    </div>
  );
}
