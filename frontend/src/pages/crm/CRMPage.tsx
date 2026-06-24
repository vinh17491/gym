import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CRMPage() {
  const { data, loading } = useApi<any[]>('/crm');
  const columns = [
    { key: 'name', header: 'Name' }, { key: 'email', header: 'Email' },
    { key: 'tags', header: 'Tags', render: (r: any) => r.tags ? r.tags.split(',').map((t: string) => <span key={t} className="badge badge-blue mr-1">{t}</span>) : '-' },
    { key: 'lifetime_value', header: 'LTV', render: (r: any) => '$' + Number(r.lifetime_value || 0).toFixed(2) },
    { key: 'risk_score', header: 'Risk', render: (r: any) => <span className={'badge ' + (r.risk_score > 70 ? 'badge-red' : r.risk_score > 30 ? 'badge-yellow' : 'badge-green')}>{r.risk_score || 0}</span> },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">CRM</h2></div>
      <div className="card"><DataTable columns={columns} data={data || []} /></div>
    </div>
  );
}
