import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import DataTable from '../../components/shared/DataTable';
import PageHeader from '../../components/shared/page-header';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import { Search, Dumbbell, X, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CRMPage() {
  const { data, loading, error, refetch } = useApi<{ items: Array<Record<string, any>> }>('/crm');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [assigningMember, setAssigningMember] = useState<any | null>(null);
  const [memberWorkouts, setMemberWorkouts] = useState<any[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyMember, setHistoryMember] = useState<any | null>(null);
  const [historySessions, setHistorySessions] = useState<any[]>([]);

  useEffect(() => {
    // Load available workouts for assignment
    api.get('/workouts').then(res => setWorkouts(res.data.data)).catch(console.error);
  }, []);

  const openWorkoutsModal = async (member: any) => {
    setAssigningMember(member);
    try {
      const res = await api.get(`/workouts/member/${member.user_id}/assigned`);
      setMemberWorkouts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load assigned workouts', err);
    }
  };

  const openHistoryModal = async (member: any) => {
    setHistoryMember(member);
    try {
      const res = await api.get(`/sessions`);
      const allSessions = res.data.data || [];
      const memberSessions = allSessions.filter((s: any) => s.user_id === member.user_id);
      setHistorySessions(memberSessions);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkout || !assigningMember) return;
    try {
      setIsSubmitting(true);
      await api.post(`/workouts/${selectedWorkout}/assign`, { member_id: assigningMember.user_id });
      toast.success('Workout assigned successfully!');
      setSelectedWorkout('');
      // Reload assigned workouts
      const res = await api.get(`/workouts/member/${assigningMember.user_id}/assigned`);
      setMemberWorkouts(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAssignment = async (assignmentId: number) => {
    if (!assigningMember) return;
    if (!confirm('Are you sure you want to cancel this assignment?')) return;
    try {
      await api.post(`/workouts/assignments/${assignmentId}/cancel`);
      toast.success('Assignment cancelled');
      const res = await api.get(`/workouts/member/${assigningMember.user_id}/assigned`);
      setMemberWorkouts(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel assignment');
    }
  };


  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'tags', header: 'Tags', render: (r: any) => r.tags ? r.tags.split(',').map((t: string) => <Badge key={t} variant='blue' className='mr-1'>{t.trim()}</Badge>) : <span className='text-[#64748B]'>-</span> },
    { key: 'lifetime_value', header: 'LTV', render: (r: any) => <span className='font-mono'></span> },
    { key: 'risk_score', header: 'Risk', render: (r: any) => <Badge variant={(r.risk_score || 0) > 70 ? 'red' : (r.risk_score || 0) > 30 ? 'yellow' : 'green'}>{r.risk_score || 0}</Badge> },
    {
      key: 'actions', header: '', render: (r: any) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => openHistoryModal(r)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" icon={<History size={14} />}>History</Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => openWorkoutsModal(r)} 
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50 disabled:cursor-not-allowed" 
            icon={<Dumbbell size={14} />}
            disabled={!r.has_booked_sessions}
            title={!r.has_booked_sessions ? "Member must book a session first" : "Assign workouts"}
          >
            Assign Workouts
          </Button>
        </div>
      )
    }
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
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-[#1e293b] p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Workouts for {assigningMember.name}</h3>
                <button onClick={() => setAssigningMember(null)} className="text-[#64748B] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* List of currently assigned workouts */}
              <div className="mb-6 space-y-3">
                <h4 className="text-sm font-semibold text-[#94A3B8]">Currently Assigned (In Progress)</h4>
                {memberWorkouts.filter(mw => mw.status === 'active').length > 0 ? memberWorkouts.filter(mw => mw.status === 'active').map(mw => (
                  <div key={mw.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{mw.workout_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400">Assigned: {new Date(mw.assigned_at).toLocaleDateString()}</p>
                        {mw.total_sets > 0 && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                            {mw.completed_sets || 0}/{mw.total_sets} sets
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={mw.status === 'completed' ? 'green' : mw.status === 'cancelled' ? 'red' : 'blue'}>{mw.status}</Badge>
                      {mw.status === 'active' && (
                        <button onClick={() => handleCancelAssignment(mw.id)} className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-400/10 transition-colors" title="Cancel assignment">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No workouts assigned yet.</p>
                )}
              </div>

              <hr className="border-slate-800 mb-6" />

              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#94A3B8] mb-3">Assign New Workout</h4>
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
                    Close
                  </Button>
                  <Button type="submit" className="flex-1" loading={isSubmitting}>
                    Assign Workout
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {historyMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F172A] border border-[#1e293b] p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Workout History: {historyMember.name}</h3>
                <button onClick={() => setHistoryMember(null)} className="text-[#64748B] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {historySessions.length > 0 ? historySessions.map(session => (
                  <div key={session.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-white">{session.workout_name}</p>
                      <Badge variant={session.status === 'completed' ? 'green' : 'yellow'}>{session.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Started: {new Date(session.started_at).toLocaleString()}</p>
                    {session.notes && (
                      <div className="bg-slate-800/50 p-3 rounded text-sm text-slate-300 italic mt-3">
                        "{session.notes}"
                      </div>
                    )}
                    {session.rating && (
                      <p className="mt-2 text-sm text-yellow-400">Rating: {session.rating}/5</p>
                    )}
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic text-center py-4">No completed workouts found.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
