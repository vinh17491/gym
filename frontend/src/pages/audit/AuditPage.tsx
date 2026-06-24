import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AuditPage() {
  const { data, loading } = useApi<{ logs: any[]; total: number }>('/audit');
  const columns = [
    { key: 'user_name', header: 'User' }, { key: 'action', header: 'Action', render: (r: any) => <span className="badge badge-blue">{r.action}</span> },
    { key: 'entity_type', header: 'Entity' }, { key: 'ip', header: 'IP' },
    { key: 'timestamp', header: 'Time', render: (r: any) => new Date(r.timestamp).toLocaleString() },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Audit Log</h2></div>
      <div className="card"><DataTable columns={columns} data={data?.logs || []} /></div>
    </div>
  );
}
