import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TicketPage() {
  const { data, loading, refetch } = useApi<any[]>('/tickets');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' as const });
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: 'id', header: '#' },
    { key: 'subject', header: 'Subject' },
    { key: 'priority', header: 'Priority', render: (r: any) => <span className={'badge ' + (r.priority === 'urgent' ? 'badge-red' : r.priority === 'high' ? 'badge-yellow' : 'badge-green')}>{r.priority}</span> },
    { key: 'status', header: 'Status', render: (r: any) => <span className={'badge ' + (r.status === 'open' ? 'badge-blue' : r.status === 'resolved' ? 'badge-green' : 'badge-yellow')}>{r.status}</span> },
    { key: 'created_at', header: 'Created', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
  ];

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/tickets', form); toast.success('Ticket created'); setShowCreate(false); setForm({ subject: '', description: '', priority: 'medium' }); refetch(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Support Tickets</h2><button onClick={() => setShowCreate(true)} className="btn-primary">+ New Ticket</button></div>
      {showCreate && <div className="card mb-6"><form onSubmit={createTicket} className="space-y-4">
        <input className="input" placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
        <textarea className="input min-h-[100px]" placeholder="Describe your issue..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})}><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option><option value="low">Low</option></select>
        <div className="flex gap-2"><button className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create'}</button><button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button></div>
      </form></div>}
      <div className="card"><DataTable columns={columns} data={data || []} /></div>
    </div>
  );
}
