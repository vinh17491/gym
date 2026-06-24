import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import { motion } from 'framer-motion';
import { Plus, Ticket, MessageSquare } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TicketPage() {
  const { data, loading, error, refetch } = useApi<any[]>('/tickets');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' as const });
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: 'id', header: '#', render: (r: any) => <span className="text-dark-400">#{r.id}</span> },
    { key: 'subject', header: 'Subject', render: (r: any) => <span className="font-medium">{r.subject}</span> },
    {
      key: 'priority', header: 'Priority', render: (r: any) => (
        <Badge variant={r.priority === 'urgent' ? 'red' : r.priority === 'high' ? 'yellow' : r.priority === 'low' ? 'blue' : 'green'}>{r.priority}</Badge>
      )
    },
    {
      key: 'status', header: 'Status', render: (r: any) => (
        <Badge variant={r.status === 'open' ? 'blue' : r.status === 'resolved' ? 'green' : 'yellow'}>{r.status}</Badge>
      )
    },
    { key: 'created_at', header: 'Created', render: (r: any) => <span className="text-dark-400 text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/tickets', form); toast.success('Ticket created'); setShowCreate(false); setForm({ subject: '', description: '', priority: 'medium' }); refetch(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading tickets..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="text-dark-400 mt-1">Manage support requests</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>New Ticket</Button>
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare size={18} /> Create New Ticket</h3>
          <form onSubmit={createTicket} className="space-y-4 max-w-lg">
            <Input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
            <textarea className="input min-h-[120px]" placeholder="Describe your issue..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>{saving ? 'Creating...' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card overflow-hidden">
        <DataTable columns={columns} data={data || []} emptyTitle="No tickets" emptyDescription="Create a ticket to get support." />
      </motion.div>
    </div>
  );
}
