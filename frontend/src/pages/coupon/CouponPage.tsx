import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CouponPage() {
  const { data, loading } = useApi<any[]>('/coupons');
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'type', header: 'Type', render: (r: any) => <span className="badge badge-blue">{r.type}</span> },
    { key: 'value', header: 'Value', render: (r: any) => r.type === 'percentage' ? r.value + '%' : '$' + r.value },
    { key: 'usage_limit', header: 'Limit', render: (r: any) => r.usage_limit || '∞' },
    { key: 'start_date', header: 'Start', render: (r: any) => new Date(r.start_date).toLocaleDateString() },
    { key: 'end_date', header: 'End', render: (r: any) => new Date(r.end_date).toLocaleDateString() },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Coupons</h2></div>
      <div className="card"><DataTable columns={columns} data={data || []} /></div>
    </div>
  );
}
