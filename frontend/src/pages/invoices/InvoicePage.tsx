import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function InvoicePage() {
  const { data, loading } = useApi<any[]>('/invoices');
  const columns = [
    { key: 'invoice_number', header: 'Invoice #' },
    { key: 'amount', header: 'Amount', render: (r: any) => '$' + Number(r.amount).toFixed(2) },
    { key: 'total', header: 'Total', render: (r: any) => <span className="font-bold">${Number(r.total).toFixed(2)}</span> },
    { key: 'email_sent', header: 'Emailed', render: (r: any) => r.email_sent ? '✓' : '—' },
    { key: 'created_at', header: 'Date', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Invoices</h2></div>
      <div className="card"><DataTable columns={columns} data={data || []} /></div>
    </div>
  );
}
