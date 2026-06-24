import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const { data: codeData, loading } = useApi<any[]>('/referral/my-code');
  const { data: referrals } = useApi<any[]>('/referral/my-referrals');
  const { data: commission } = useApi<{ total: number; count: number }>('/referral/commission');

  const referralCode = codeData?.[0]?.code || 'NONE';
  const referralLink = window.location.origin + '/register?ref=' + referralCode;

  const copyCode = () => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied!'); };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card"><span className="text-sm text-dark-400">Your Referral Code</span><p className="text-2xl font-bold mt-1 font-mono">{referralCode}</p></div>
        <div className="stat-card"><span className="text-sm text-dark-400">Total Referrals</span><p className="text-2xl font-bold mt-1">{referrals?.length || 0}</p></div>
        <div className="stat-card"><span className="text-sm text-dark-400">Commission Earned</span><p className="text-2xl font-bold mt-1 text-green-400">${commission?.total || 0}</p></div>
      </div>
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-3">Share Your Referral Link</h3>
        <div className="flex gap-2"><input className="input flex-1" value={referralLink} readOnly /><button className="btn-primary" onClick={copyCode}><Copy size={16} /></button></div>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Referred Users</h3>
        {(!referrals || referrals.length === 0) ? <p className="text-dark-400">No referrals yet. Share your link!</p> : (
          <div className="space-y-2">{referrals.map((r: any) => <div key={r.id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg"><span>{r.referred_name} ({r.referred_email})</span><span className="badge badge-green">${Number(r.commission_amount).toFixed(2)}</span></div>)}</div>
        )}
      </div>
    </div>
  );
}
