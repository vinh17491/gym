import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function BackupPage() {
  const { data, loading, refetch } = useApi<any[]>('/backup');
  const columns = [
    { key: 'type', header: 'Type', render: (r: any) => <span className={'badge ' + (r.type === 'daily' ? 'badge-blue' : r.type === 'weekly' ? 'badge-yellow' : 'badge-green')}>{r.type}</span> },
    { key: 'status', header: 'Status', render: (r: any) => <span className={'badge ' + (r.status === 'completed' ? 'badge-green' : r.status === 'failed' ? 'badge-red' : 'badge-yellow')}>{r.status}</span> },
    { key: 'file_size', header: 'Size', render: (r: any) => r.file_size ? (r.file_size / 1024 / 1024).toFixed(1) + 'MB' : '-' },
    { key: 'verified', header: 'Verified', render: (r: any) => r.verified ? '✅' : '❌' },
    { key: 'created_at', header: 'Date', render: (r: any) => new Date(r.created_at).toLocaleString() },
  ];

  const createBackup = async () => {
    try { await api.post('/backup/create'); toast.success('Backup created!'); refetch(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Backups</h2><button onClick={createBackup} className="btn-primary">+ Create Backup</button></div>
      <div className="card"><DataTable columns={columns} data={data || []} /></div>
    </div>
  );
}
