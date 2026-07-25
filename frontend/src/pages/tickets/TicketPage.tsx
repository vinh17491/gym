import { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, X, Send } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function TicketPage() {
  const { user } = useAuthStore();
  const { data, loading, error, refetch } = useApi<any[]>('/tickets');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' as const });
  const [saving, setSaving] = useState(false);

  const [viewTicketId, setViewTicketId] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const isCoachOrAdmin = user?.role === 'coach' || user?.role === 'admin';

  const loadTicketDetail = async (id: number) => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicketDetail(res.data.data);
      
      // Update viewed timestamp in localStorage
      try {
        const viewed = JSON.parse(localStorage.getItem('viewed_tickets') || '{}');
        viewed[id] = Date.now();
        localStorage.setItem('viewed_tickets', JSON.stringify(viewed));
      } catch (e) {}
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load ticket details');
    }
  };

  useEffect(() => {
    if (viewTicketId) {
      loadTicketDetail(viewTicketId);
    }
  }, [viewTicketId]);

  const columns = [
    { key: 'id', header: '#', render: (r: any) => <span className="text-dark-400">#{r.id}</span> },
    { key: 'subject', header: 'Subject', render: (r: any) => {
      let isUnread = false;
      try {
        const viewed = JSON.parse(localStorage.getItem('viewed_tickets') || '{}');
        const lastViewed = viewed[r.id] || 0;
        if (new Date(r.updated_at).getTime() > lastViewed && r.status !== 'resolved' && r.status !== 'closed') {
          isUnread = true;
        }
      } catch (e) {}

      return (
        <div className="flex items-center gap-2">
          {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500" title="New activity"></div>}
          <span className={`font-medium ${isUnread ? 'text-white' : 'text-slate-300'}`}>{r.subject}</span>
        </div>
      );
    }},
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
    {
      key: 'actions', header: '', render: (r: any) => (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" onClick={() => setViewTicketId(r.id)}>
            View
          </Button>
        </div>
      )
    }
  ];

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/tickets', form);
      toast.success('Ticket created');
      setShowCreate(false);
      setForm({ subject: '', description: '', priority: 'medium' });
      refetch();
    }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !viewTicketId) return;
    setReplying(true);
    try {
      await api.post(`/tickets/${viewTicketId}/reply`, { message: replyText });
      toast.success('Reply sent');
      setReplyText('');
      loadTicketDetail(viewTicketId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending reply');
    } finally {
      setReplying(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!viewTicketId) return;
    setStatusUpdating(true);
    try {
      await api.patch(`/tickets/${viewTicketId}/status`, { status });
      toast.success('Status updated');
      loadTicketDetail(viewTicketId);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating status');
    } finally {
      setStatusUpdating(false);
    }
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
        {!isCoachOrAdmin && (
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>New Ticket</Button>
        )}
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare size={18} /> Create New Ticket</h3>
          <form onSubmit={createTicket} className="space-y-4 max-w-lg">
            <Input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            <textarea className="w-full bg-[#0F172A] border border-[#1e293b] rounded-xl px-4 py-3 text-white transition-all duration-300 focus:outline-none focus:border-blue-500 min-h-[120px] resize-y" placeholder="Describe your issue..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <select className="w-full bg-[#0F172A] border border-[#1e293b] rounded-xl px-4 py-3 text-white transition-all duration-300 focus:outline-none focus:border-blue-500" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })}>
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

      <AnimatePresence>
        {viewTicketId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F172A] border border-[#1e293b] shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-slate-900">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">Ticket #{viewTicketId}</h3>
                  {ticketDetail && (
                    <Badge variant={ticketDetail.status === 'open' ? 'blue' : ticketDetail.status === 'resolved' ? 'green' : 'yellow'}>{ticketDetail.status}</Badge>
                  )}
                </div>
                <button onClick={() => { setViewTicketId(null); setTicketDetail(null); refetch(); }} className="text-[#64748B] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!ticketDetail ? (
                  <div className="flex justify-center"><LoadingSpinner /></div>
                ) : (
                  <>
                    <div className="space-y-1 mb-6 pb-6 border-b border-slate-800">
                      <h4 className="text-xl font-bold text-white">{ticketDetail.subject}</h4>
                      <p className="text-sm text-slate-400">From: {ticketDetail.user_name} ({ticketDetail.user_email})</p>
                      <p className="text-xs text-slate-500">Created: {new Date(ticketDetail.created_at).toLocaleString()}</p>
                    </div>

                    <div className="space-y-4">
                      {ticketDetail.messages?.map((msg: any) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${isMine ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 px-1">
                              {msg.sender_name} ({msg.sender_role}) • {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {ticketDetail && ticketDetail.status !== 'closed' && (
                <div className="p-4 border-t border-[#1e293b] bg-slate-900">
                  {isCoachOrAdmin && (
                    <div className="flex gap-2 mb-4">
                      <span className="text-sm text-slate-400 flex items-center">Update Status:</span>
                      {['open', 'pending', 'resolved', 'closed'].map(s => (
                        <button
                          key={s}
                          disabled={statusUpdating || ticketDetail.status === s}
                          onClick={() => updateStatus(s)}
                          className={`text-xs px-2 py-1 rounded border capitalize transition-colors ${ticketDetail.status === s ? 'bg-slate-700 text-white border-slate-600' : 'bg-transparent text-slate-400 border-slate-700 hover:text-white'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleReply} className="flex items-center gap-2">
                    <Input
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1"
                      disabled={replying}
                    />
                    <Button type="submit" disabled={!replyText.trim() || replying} icon={<Send size={16} />}>
                      Send
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
