import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { Activity, Flame, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

interface ProgressSummary {
  totalVolume: number;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
}

interface ProgressHistory {
  date: string;
  daily_volume: number;
}

export default function ProgressPage() {
  const { data: summary, loading: loadingSum, error: errorSum, refetch: refetchSum } = useApi<ProgressSummary>('/progress/summary');
  const { data: history, loading: loadingHist, error: errorHist, refetch: refetchHist } = useApi<ProgressHistory[]>('/progress/history');

  if (loadingSum || loadingHist) return <LoadingSpinner text="Đang tải dữ liệu tiến trình..." />;
  if (errorSum || errorHist) return <ErrorState message={errorSum || errorHist || 'Có lỗi xảy ra'} onRetry={() => { refetchSum(); refetchHist(); }} />;

  const maxVolume = history && history.length > 0 
    ? Math.max(1, ...history.map(h => h.daily_volume || 0)) 
    : 1;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Tiến trình Tập luyện</h1>
          <p className="text-slate-400 mt-1">Theo dõi khối lượng và hiệu suất tập luyện của bạn</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3 className="text-slate-300 font-medium">Tổng Khối Lượng</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {summary?.totalVolume?.toLocaleString() || 0} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 bg-gradient-to-br from-emerald-900/40 to-slate-900 border-emerald-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <h3 className="text-slate-300 font-medium">Tỷ Lệ Hoàn Thành</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {summary?.completionRate || 0}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${summary?.completionRate || 0}%` }}></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 bg-gradient-to-br from-amber-900/40 to-slate-900 border-amber-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <h3 className="text-slate-300 font-medium">Số Buổi Tập</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {summary?.completedSessions || 0} <span className="text-sm font-normal text-slate-400">/ {summary?.totalSessions || 0}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6 bg-gradient-to-br from-purple-900/40 to-slate-900 border-purple-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Flame size={20} />
            </div>
            <h3 className="text-slate-300 font-medium">Mục Tiêu</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            Tăng cơ
          </div>
        </motion.div>
      </div>

      {/* Volume Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-400" /> Biểu đồ khối lượng 30 ngày qua
        </h2>
        
        {history && history.length > 0 ? (
          <div className="h-72 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} 
                  stroke="#475569" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString('vi-VN')}
                />
                <Bar dataKey="daily_volume" name="Khối lượng (kg)" fill="url(#colorVol)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
            Chưa có dữ liệu tập luyện để hiển thị biểu đồ
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Simple icon for completion
function CheckCircleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
