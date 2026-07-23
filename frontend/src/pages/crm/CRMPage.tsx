import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import DataTable from '../../components/shared/DataTable';
import PageHeader from '../../components/shared/page-header';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import { Search, Dumbbell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CRMPage() {
  const { data, loading, error, refetch } = useApi<{items:Array<Record<string,any>>}>('/crm');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [assigningMember, setAssigningMember] = useState<any | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load available workouts for assignment
    api.get('/workouts').then(res => setWorkouts(res.data.data)).catch(console.error);
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkout || !assigningMember) return;
    try {
      setIsSubmitting(true);
      await api.post(`/workouts/${selectedWorkout}/assign`, { member_id: assigningMember.user_id });
      toast.success('Workout assigned successfully!');
      setAssigningMember(null);
      setSelectedWorkout('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'tags', header: 'Tags', render: (r: any) => r.tags ? r.tags.split(',').map((t: string) => <Badge key={t} variant='blue' className='mr-1'>{t.trim()}</Badge>) : <span className='text-[#64748B]'>-</span> },
    { key: 'lifetime_value', header: 'LTV', render: (r: any) => <span className='font-mono'></span> },
    { key: 'risk_score', header: 'Risk', render: (r: any) => <Badge variant={(r.risk_score || 0) > 70 ? 'red' : (r.risk_score || 0) > 30 ? 'yellow' : 'green'}>{r.risk_score || 0}</Badge> },
    { key: 'actions', header: '', render: (r: any) => (
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={() => setAssigningMember(r)} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" icon={<Dumbbell size={14} />}>Assign Workout</Button>
      </div>
    )}
  ];

  return (
    <div className='animate-fade-in space-y-6'>
      <PageHeader title='CRM' subtitle='Customer relationship management' />
      <div className='card p-0'><DataTable columns={columns} data={data?.items || []} emptyTitle='No customers found' /></div>

      <AnimatePresence>
        {assigningMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-[#1e293b] p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Assign Workout to {assigningMember.name}</h3>
                <button onClick={() => setAssigningMember(null)} className="text-[#64748B] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">Select Workout</label>
                  <select 
                    required
                    className="w-full bg-[#0F172A] border border-[#1e293b] rounded-xl px-4 py-3 text-white transition-all duration-300 focus:outline-none focus:border-[#22C55E]"
                    value={selectedWorkout}
                    onChange={e => setSelectedWorkout(e.target.value)}
                  >
                    <option value="">-- Choose a workout --</option>
                    {workouts.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.duration_minutes}m - {w.difficulty})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setAssigningMember(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" loading={isSubmitting}>
                    Assign
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
