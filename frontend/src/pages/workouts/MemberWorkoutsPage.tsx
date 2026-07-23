import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { Play, Clock, Calendar, Activity, CheckCircle, Dumbbell, Plus, Minus } from 'lucide-react';
import Button from '../../components/ui/button';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import Badge from '../../components/ui/badge';
import toast from 'react-hot-toast';

interface AssignedWorkout {
  id: number;
  workout_id: number;
  workout_name: string;
  description: string;
  difficulty: string;
  duration_minutes: number;
  assigned_at: string;
  notes: string;
}

interface WorkoutExercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest_seconds: number;
  exercise_id: number;
}

interface ActiveSession {
  id: number;
  workout_id: number;
  workout_name: string;
  exercises: WorkoutExercise[];
  loggedSets: Record<number, number[]>; // exerciseId -> array of logged weights per set
}

export default function MemberWorkoutsPage() {
  const { data: assignments, loading, error, refetch } = useApi<AssignedWorkout[]>('/workouts/assigned');
  const [starting, setStarting] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);

  const startWorkout = async (workout: AssignedWorkout) => {
    setStarting(workout.workout_id);
    try {
      // 1. Start session
      const sessionRes = await api.post('/sessions/start', { workout_id: workout.workout_id });
      const session = sessionRes.data.data;

      // 2. Fetch workout details (exercises)
      const detailRes = await api.get(`/workouts/${workout.workout_id}`);
      const workoutDetail = detailRes.data.data;

      setActiveSession({
        id: session.id,
        workout_id: workout.workout_id,
        workout_name: workout.workout_name,
        exercises: workoutDetail.exercises || [],
        loggedSets: {},
      });
      toast.success(`Bắt đầu "${workout.workout_name}"!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể bắt đầu bài tập');
    } finally {
      setStarting(null);
    }
  };

  const logSet = async (exerciseId: number, setNumber: number, reps: number, weight: number) => {
    if (!activeSession) return;
    try {
      await api.post(`/sessions/${activeSession.id}/sets`, {
        exercise_id: exerciseId,
        set_number: setNumber,
        reps,
        weight,
      });
      setActiveSession(prev => {
        if (!prev) return prev;
        const current = prev.loggedSets[exerciseId] || [];
        return {
          ...prev,
          loggedSets: { ...prev.loggedSets, [exerciseId]: [...current, weight] },
        };
      });
      toast.success(`Set ${setNumber} ghi nhận!`, { duration: 1500 });
    } catch (err: any) {
      toast.error('Không thể ghi nhận set');
    }
  };

  const finishSession = async () => {
    if (!activeSession) return;
    setFinishing(true);
    try {
      await api.put(`/sessions/${activeSession.id}/finish`, { notes: sessionNotes });
      toast.success('Hoàn thành buổi tập! 💪');
      setActiveSession(null);
      setShowFinishModal(false);
      setSessionNotes('');
      void refetch();
    } catch (err: any) {
      toast.error('Không thể kết thúc buổi tập');
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải lịch tập..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // ── ACTIVE SESSION VIEW ───────────────────────────────────────────────────
  if (activeSession) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Buổi tập đang diễn ra
            </div>
            <h1 className="page-title">{activeSession.workout_name}</h1>
          </div>
          <Button onClick={() => setShowFinishModal(true)} icon={<CheckCircle size={16} />} variant="secondary">
            Kết thúc buổi tập
          </Button>
        </motion.div>

        {/* Exercise Cards */}
        <div className="space-y-4">
          {activeSession.exercises.length > 0 ? activeSession.exercises.map((ex, idx) => {
            const loggedCount = (activeSession.loggedSets[ex.id] || []).length;
            const totalSets = ex.sets || 3;
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card p-5 border border-slate-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{ex.name}</h3>
                    <p className="text-slate-400 text-sm">{ex.sets} sets × {ex.reps} reps @ {ex.weight}kg · Nghỉ {ex.rest_seconds}s</p>
                  </div>
                  <Badge variant={loggedCount >= totalSets ? 'green' : 'yellow'}>
                    {loggedCount}/{totalSets} sets
                  </Badge>
                </div>

                {/* Set Logging Buttons */}
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: totalSets }, (_, i) => i + 1).map(setNum => {
                    const done = loggedCount >= setNum;
                    return (
                      <button
                        key={setNum}
                        onClick={() => !done && logSet(ex.id, setNum, ex.reps || 10, ex.weight || 0)}
                        disabled={done}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1 ${
                          done
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 cursor-not-allowed'
                            : 'bg-blue-600/20 text-blue-300 border border-blue-600/30 hover:bg-blue-600/40'
                        }`}
                      >
                        {done ? <CheckCircle size={14} /> : <Dumbbell size={14} />} Set {setNum}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          }) : (
            <div className="card p-8 text-center text-slate-400">
              Bài tập này chưa có bài tập nào được thiết lập.
            </div>
          )}
        </div>

        {/* Finish Modal */}
        {showFinishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="text-emerald-400" size={20} /> Kết thúc buổi tập
              </h3>
              <p className="text-slate-400 text-sm">
                Bạn đã ghi nhận {Object.values(activeSession.loggedSets).reduce((sum, sets) => sum + sets.length, 0)} sets. Nhập ghi chú cá nhân nếu muốn:
              </p>
              <textarea
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[80px]"
                placeholder="Cảm nhận sau buổi tập, điểm cần cải thiện..."
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setShowFinishModal(false)}>Quay lại</Button>
                <Button loading={finishing} onClick={finishSession} icon={<CheckCircle size={16} />}>
                  Xác nhận hoàn thành
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ASSIGNED WORKOUT LIST VIEW ────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">Chương trình tập của tôi</h1>
          <p className="text-slate-400 mt-1">Các bài tập được HLV giao cho bạn</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments && assignments.length > 0 ? assignments.map((assignment, idx) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={assignment.difficulty === 'beginner' ? 'green' : assignment.difficulty === 'intermediate' ? 'yellow' : 'red'}>
                  {assignment.difficulty}
                </Badge>
                <div className="flex items-center text-slate-400 text-sm gap-1">
                  <Clock size={14} /> {assignment.duration_minutes || '--'} phút
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{assignment.workout_name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">{assignment.description || 'Không có mô tả'}</p>

              {assignment.notes && (
                <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 text-sm text-blue-200 mb-4">
                  <span className="font-semibold block mb-1">HLV dặn dò:</span>
                  {assignment.notes}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 border-t border-slate-800/50 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={12} /> {new Date(assignment.assigned_at).toLocaleDateString('vi-VN')}
              </span>
              <Button
                onClick={() => startWorkout(assignment)}
                loading={starting === assignment.workout_id}
                icon={<Play size={16} />}
              >
                Bắt đầu
              </Button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">Chưa có bài tập nào</h3>
            <p>Hiện tại bạn chưa được giao bài tập nào. Hãy liên hệ với HLV của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
