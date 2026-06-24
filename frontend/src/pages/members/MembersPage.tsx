import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MembersPage() {
  const { data, loading } = useApi<any[]>('/crm');
  if (loading) return <LoadingSpinner />;
  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'tags', header: 'Tags', render: (r: any) => r.tags ? r.tags.split(',').map((t: string) => <span key={t} className="badge badge-blue mr-1">{t}</span>) : '-' },
    { key: 'lifetime_value', header: 'Value', render: (r: any) => '$' + Number(r.lifetime_value || 0).toFixed(2) },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Members</h2></div>
      <div className="card"><DataTable columns={columns} data={data || []} /></div>
    </div>
  );
}
