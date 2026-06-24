import { LucideIcon } from 'lucide-react'

export default function StatCard({ title, value, icon: Icon, trend, subtitle }: { title: string; value: string | number; icon: LucideIcon; trend?: { value: number; positive: boolean }; subtitle?: string }) {
  return (
    <div className='stat-card'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-sm text-[#94A3B8]'>{title}</span>
        <div className='p-2 rounded-lg bg-[#22C55E]/10'><Icon size={18} className='text-[#22C55E]' /></div>
      </div>
      <p className='text-2xl font-bold tracking-tight'>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {trend && <p className={'text-xs mt-1 ' + (trend.positive ? 'text-[#22C55E]' : 'text-red-400')}>
        <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
      </p>}
      {subtitle && <p className='text-xs text-[#64748B] mt-1'>{subtitle}</p>}
    </div>
  )
}
