import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import StatCard from '../../components/shared/StatCard';
import { motion } from 'framer-motion';
import { Copy, Gift, Users, DollarSign, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';

export default function ReferralPage() {
  const { data: codeData, loading: l1, error: e1, refetch: r1 } = useApi<any[]>('/referral/my-code');
  const { data: referrals, loading: l2 } = useApi<any[]>('/referral/my-referrals');
  const { data: commission } = useApi<{ total: number; count: number }>('/referral/commission');

  if (l1 || l2) return <LoadingSpinner text="Loading referral data..." />;
  if (e1) return <ErrorState message={e1} onRetry={r1} />;

  const referralCode = codeData?.[0]?.code || 'NONE';
  const referralLink = window.location.origin + '/register?ref=' + referralCode;

  const copyCode = () => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied!'); };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Referral Program</h1>
        <p className="text-dark-400 mt-1">Invite friends and earn rewards</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="text-sm text-dark-400">Your Referral Code</span>
          <p className="text-2xl font-bold mt-1 font-mono tracking-wider text-primary-400">{referralCode}</p>
        </div>
        <StatCard title="Total Referrals" value={referrals?.length || 0} icon={<Users size={20} />} />
        <StatCard title="Commission Earned" value={commission ? `$${Number(commission.total).toFixed(2)}` : '$0'} icon={<DollarSign size={20} />} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h3 className="section-title flex items-center gap-2"><Share2 size={18} /> Share Your Referral Link</h3>
        <div className="flex gap-2 mt-3">
          <Input value={referralLink} readOnly className="flex-1 font-mono text-xs" />
          <Button onClick={copyCode} icon={<Copy size={16} />}>Copy</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h3 className="section-title flex items-center gap-2"><Gift size={18} /> Referred Users</h3>
        {(!referrals || referrals.length === 0) ? (
          <div className="py-8 text-center text-dark-500">No referrals yet. Share your link to get started!</div>
        ) : (
          <div className="space-y-2 mt-3">
            {referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors">
                <div>
                  <p className="text-sm font-medium">{r.referred_name}</p>
                  <p className="text-xs text-dark-500">{r.referred_email}</p>
                </div>
                <span className="text-sm font-mono text-green-400">+${Number(r.commission_amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
