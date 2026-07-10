interface StatCardProps {
  title: string;
  value: string | number;
  icon?: any;
  trend?: { value: number; positive: boolean };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export default function StatCard({ title, value, icon, trend, subtitle, className, onClick }: StatCardProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'function') {
      const Icon = icon;
      return <Icon size={18} />;
    }
    return icon;
  };

  return (
    <div
      className={'stat-card' + (onClick ? ' cursor-pointer' : '') + (className ? ' ' + className : '')}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-[#94A3B8] font-medium">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E]">{renderIcon()}</div>}
      </div>
      <p className="text-2xl font-bold tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {trend && (
        <div className={'flex items-center gap-1 text-xs mt-2 ' + (trend.positive ? 'text-[#22C55E]' : 'text-red-400')}>
          <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-[#64748B]">vs last month</span>
        </div>
      )}
      {subtitle && <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>}
    </div>
  );
}
