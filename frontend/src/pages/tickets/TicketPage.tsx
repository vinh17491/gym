import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Send, User, Lock } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

interface TicketItem {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export default function TicketPage() {
  const user = useAuthStore(state => state.user);
  const isCoachOrAdmin = user?.role === 'coach' || user?.role === 'admin';
  const { data, loading, error, refetch } = useApi<TicketItem[]>('/tickets');
  
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' as const });
  const [saving, setSaving] = useState(false);

  // Active Ticket Detail & Thread Modal
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<(TicketItem & { messages: TicketMessage[] }) | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTicketDetail = async (ticketId: number) => {
    try {
      setSelectedTicketId(ticketId);
      const res = await api.get(`/tickets/${ticketId}`);
      setTicketDetail(res.data.data);
    } catch (e: any) {
      toast.error('Không thể tải chi tiết ticket');
    }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tickets', form);
      toast.success('Gửi yêu cầu hỗ trợ thành công!');
      setShowCreate(false);
      setForm({ subject: '', description: '', priority: 'medium' });
      void refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await api.post(`/tickets/${selectedTicketId}/reply`, {
        message: replyText,
        is_internal: isInternalNote
      });
      toast.success('Đã gửi phản hồi');
      setReplyText('');
      await fetchTicketDetail(selectedTicketId);
      void refetch();
    } catch (e: any) {
      toast.error('Không thể gửi phản hồi');
    } finally {
      setSendingReply(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status });
      toast.success(`Cập nhật trạng thái thành ${status}`);
      if (selectedTicketId === ticketId) {
        await fetchTicketDetail(ticketId);
      }
      void refetch();
    } catch (e: any) {
      toast.error('Không thể đổi trạng thái');
    }
  };

  const columns = [
    { key: 'id', header: '#', render: (r: TicketItem) => <span className="text-slate-400 font-mono">#{r.id}</span> },
    {
      key: 'subject',
      header: 'Tiêu đề & Người gửi',
      render: (r: TicketItem) => (
        <div className="flex flex-col">
          <span className="font-semibold text-white cursor-pointer hover:text-blue-400" onClick={() => void fetchTicketDetail(r.id)}>
            {r.subject}
          </span>
          {isCoachOrAdmin && r.user_name && (
            <span className="text-xs text-slate-400">{r.user_name} ({r.user_email})</span>
          )}
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Mức độ',
      render: (r: TicketItem) => (
        <Badge variant={r.priority === 'urgent' ? 'red' : r.priority === 'high' ? 'yellow' : r.priority === 'low' ? 'blue' : 'green'}>
          {r.priority}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r: TicketItem) => (
        <Badge variant={r.status === 'open' ? 'blue' : r.status === 'resolved' || r.status === 'closed' ? 'green' : 'yellow'}>
          {r.status}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Thời gian',
      render: (r: TicketItem) => <span className="text-slate-400 text-xs">{new Date(r.created_at).toLocaleString('vi-VN')}</span>
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (r: TicketItem) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="text-xs px-2.5 py-1" onClick={() => void fetchTicketDetail(r.id)}>
            Xem trao đổi
          </Button>
          {isCoachOrAdmin && r.status !== 'closed' && (
            <button
              className="text-xs px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30"
              onClick={() => void updateTicketStatus(r.id, 'closed')}
            >
              Đóng
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner text="Đang tải hỗ trợ..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{isCoachOrAdmin ? 'Trung tâm Hỗ trợ & Giải đáp' : 'Yêu cầu Hỗ trợ'}</h1>
          <p className="text-slate-400 mt-1">
            {isCoachOrAdmin ? 'Theo dõi và phản hồi thắc mắc từ các học viên.' : 'Gửi yêu cầu hỗ trợ tới ban huấn luyện và ban quản lý.'}
          </p>
        </div>
        {!isCoachOrAdmin && (
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>Tạo Yêu cầu Mới</Button>
        )}
      </motion.div>

      {showCreate && !isCoachOrAdmin && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 border border-slate-800 bg-slate-950">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-lg">
            <MessageSquare size={20} className="text-blue-400" /> Tạo yêu cầu hỗ trợ mới
          </h3>
          <form onSubmit={createTicket} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tiêu đề yêu cầu</label>
              <input
                type="text"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Nhập tiêu đề sự cố hoặc câu hỏi..."
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mô tả chi tiết</label>
              <textarea
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[120px]"
                placeholder="Mô tả cụ thể vấn đề của bạn..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mức độ ưu tiên</label>
              <select
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value as any})}
              >
                <option value="low">Thấp (Low)</option>
                <option value="medium">Trung bình (Medium)</option>
                <option value="high">Cao (High)</option>
                <option value="urgent">Khẩn cấp (Urgent)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={saving}>{saving ? 'Đang gửi...' : 'Gửi yêu cầu'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Hủy</Button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card overflow-hidden">
        <DataTable columns={columns} data={data || []} emptyTitle="Chưa có yêu cầu hỗ trợ" emptyDescription="Danh sách yêu cầu sẽ xuất hiện tại đây." />
      </motion.div>

      {/* Ticket Detail & Thread Modal */}
      {selectedTicketId && ticketDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col max-h-[85vh] space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-blue-400">#Ticket {ticketDetail.id}</span>
                <h3 className="text-lg font-bold text-white">{ticketDetail.subject}</h3>
                {ticketDetail.user_name && (
                  <p className="text-xs text-slate-400">Người gửi: {ticketDetail.user_name} ({ticketDetail.user_email})</p>
                )}
              </div>
              <button className="text-slate-400 hover:text-white text-lg font-bold" onClick={() => { setSelectedTicketId(null); setTicketDetail(null); }}>✕</button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2">
              {ticketDetail.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl border ${
                    msg.is_internal
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      : msg.sender_role === 'member'
                      ? 'bg-slate-900 border-slate-800 text-white'
                      : 'bg-blue-950/30 border-blue-800/40 text-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <User size={13} /> {msg.sender_name} ({msg.sender_role})
                      {msg.is_internal && <span className="badge badge-amber text-[10px] ml-2">Ghi chú nội bộ</span>}
                    </span>
                    <span>{new Date(msg.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={sendReply} className="border-t border-slate-800 pt-3 space-y-2">
              {isCoachOrAdmin && (
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                  <input
                    type="checkbox"
                    id="internal_note"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="internal_note" className="cursor-pointer flex items-center gap-1">
                    <Lock size={12} className="text-amber-400" /> Ghi chú nội bộ (Chỉ HLV/Admin xem được)
                  </label>
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[60px]"
                  placeholder="Nhập nội dung phản hồi..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                />
                <Button type="submit" loading={sendingReply} icon={<Send size={16} />}>Gửi</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

