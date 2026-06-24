import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Star, Gift, History } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function LoyaltyPage() {
  const { data: points, loading, refetch } = useApi<any>('/loyalty/points');
  const { data: history } = useApi<any[]>('/loyalty/history');
  const { data: rewards } = useApi<any[]>('/loyalty/rewards');

  const claimDaily = async () => {
    try { await api.post('/loyalty/daily-login'); toast.success('+10 points claimed!'); refetch(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Already claimed today'); }
  };

  const redeem = async (rewardId: number) => {
    try { await api.post('/loyalty/redeem', { reward_id: rewardId }); toast.success('Reward redeemed!'); refetch(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Redeem failed'); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Loyalty Points</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card"><span className="text-sm text-dark-400">Balance</span><p className="text-3xl font-bold mt-1 text-yellow-400">{points?.balance || 0} pts</p></div>
        <div className="stat-card"><span className="text-sm text-dark-400">Lifetime Earned</span><p className="text-2xl font-bold mt-1">{points?.lifetime_earned || 0}</p></div>
        <div className="stat-card"><span className="text-sm text-dark-400">Lifetime Spent</span><p className="text-2xl font-bold mt-1">{points?.lifetime_spent || 0}</p></div>
      </div>
      <button onClick={claimDaily} className="btn-primary mb-8">🎁 Claim Daily Login (+10 pts)</button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h3 className="text-lg font-semibold mb-4"><Star className="inline mr-2" />Rewards Catalog</h3>
          {(!rewards || rewards.length === 0) ? <p className="text-dark-400">No rewards available</p> : rewards.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg mb-2">
              <div><p className="font-medium">{r.name}</p><p className="text-xs text-dark-400">{r.description}</p></div>
              <button onClick={() => redeem(r.id)} className="btn-secondary text-sm">{r.points_cost} pts</button>
            </div>
          ))}
        </div>
        <div className="card"><h3 className="text-lg font-semibold mb-4"><History className="inline mr-2" />Transaction History</h3>
          {(!history || history.length === 0) ? <p className="text-dark-400">No history</p> : history.slice(0, 10).map((h: any) => (
            <div key={h.id} className="flex items-center justify-between p-3 border-b border-dark-700/50">
              <div><p className="text-sm">{h.description || h.source}</p><p className="text-xs text-dark-400">{new Date(h.created_at).toLocaleDateString()}</p></div>
              <span className={h.type === 'earn' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{h.type === 'earn' ? '+' : '-'}{h.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
