import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
  onClick?: () => void;
}

export default function StatCard({ title, value, icon, trend, className, onClick }: StatCardProps) {
  return (
    <div
      className={cn('stat-card card-hover', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-400 font-medium">{title}</span>
        {icon && <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400">{icon}</div>}
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{value}</p>
      {trend && (
        <div className={cn('flex items-center gap-1 text-xs mt-2', trend.positive ? 'text-green-400' : 'text-red-400')}>
          {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend.value}% vs last month</span>
        </div>
      )}
    </div>
  );
}
