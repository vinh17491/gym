import { useEffect, useState } from 'react';
import { Calendar, ClipboardList, Users, UserCircle as UserRound, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { DashboardPageHeader, DashboardPanel, EmptyState, MetricCard, QuickAction, PanelError } from '../../components/dashboard/DashboardPrimitives';
import { useAuthStore } from '../../stores/authStore';
import { useApi } from '../../hooks/useApi';

interface Booking {
  id: number;
  coach_id: number;
  member_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  coach_notes?: string;
  member_name: string;
  coach_name: string;
}

export default function CoachDashboard() {
  const user = useAuthStore(state => state.user);
  const bookings = useApi<Booking[]>('/bookings');
  const [assignedMembers, setAssignedMembers] = useState<number | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  
  // Complete modal state
  const [completingBookingId, setCompletingBookingId] = useState<number | null>(null);
  const [coachNotesInput, setCoachNotesInput] = useState('');

  const updateBookingStatus = async (bookingId: number, status: 'confirmed' | 'completed' | 'cancelled', coachNotes?: string) => {
    try {
      setStatusError(null);
      await api.put(`/bookings/${bookingId}/status`, { status, coach_notes: coachNotes });
      setCompletingBookingId(null);
      setCoachNotesInput('');
      await bookings.refetch();
    } catch (err: any) {
      setStatusError(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái');
    }
  };

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const { data } = await api.get('/crm?page=1&limit=1');
        setAssignedMembers(data.data?.total ?? 0);
      } catch (err: any) {
        setMembersError(err?.response?.data?.message || err?.message || 'Cannot load assigned members');
      }
    };
    void fetchAssigned();
  }, []);

  const todayDate = new Date().toISOString().split('T')[0];
  const upcoming = (bookings.data || []).filter(item => ['pending', 'confirmed'].includes(item.status));
  const todayBookings = upcoming.filter(item => item.booking_date === todayDate);
  const activeMembers = assignedMembers ?? 0;

  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        eyebrow="KHÔNG GIAN COACH"
        title={`Chào ${user?.name?.split(' ')[0] || 'Coach'}`}
        description="Tập trung vào lịch hôm nay và những học viên cần theo dõi."
        action={<Link className="primary-button" to="/booking">Mở lịch</Link>}
      />

      {(bookings.error || membersError) && (
        <PanelError message={bookings.error || membersError || 'Không thể tải dữ liệu'} onRetry={() => { void bookings.refetch(); setMembersError(null); }} />
      )}

      <div className="metric-grid">
        <MetricCard title="Học viên được phân công" value={String(activeMembers)} detail="Số học viên trong phạm vi bạn" icon={<Users size={18} />} tone="blue" />
        <MetricCard title="Buổi tập sắp tới" value={String(upcoming.length)} detail="Hẹn gặp members của bạn" icon={<Calendar size={18} />} tone="amber" />
        <MetricCard title="Lịch hôm nay" value={String(todayBookings.length)} detail="Các buổi trong hôm nay" icon={<UserRound size={18} />} tone="lime" />
      </div>

      <div className="dashboard-grid-main">
        <DashboardPanel title="Lịch hôm nay" description="Các buổi tập trong phạm vi Coach">
          {statusError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {statusError}
            </div>
          )}
          {todayBookings.length ? (
            <div className="record-list space-y-3">
              {todayBookings.slice(0, 4).map((item) => (
                <div key={item.id} className="record-row flex-col gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={17} />
                      <span>{new Date(item.booking_date).toLocaleDateString('vi-VN')}</span>
                      <span>{item.start_time} - {item.end_time}</span>
                    </div>
                    <span className={`badge badge-${item.status}`}>{item.status}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-300">
                    <div>
                      <strong>Học viên</strong>
                      <p>{item.member_name}</p>
                    </div>
                    <div>
                      <strong>Coach</strong>
                      <p>{item.coach_name}</p>
                    </div>
                    <div>
                      <strong>Ghi chú từ học viên</strong>
                      <p>{item.notes || 'Không có'}</p>
                    </div>
                  </div>

                  {completingBookingId === item.id ? (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-700 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-300">Ghi chú / Nhận xét của Coach cho buổi tập:</label>
                      <textarea
                        className="w-full rounded-md bg-slate-950 border border-slate-700 p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        rows={2}
                        placeholder="Nhập nhận xét, hướng dẫn hoặc lưu ý cho học viên..."
                        value={coachNotesInput}
                        onChange={e => setCoachNotesInput(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button className="text-xs px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700" onClick={() => setCompletingBookingId(null)}>Hủy</button>
                        <button className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-500 flex items-center gap-1" onClick={() => void updateBookingStatus(item.id, 'completed', coachNotesInput)}>
                          <CheckCircle size={14} /> Xác nhận hoàn thành
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {item.status === 'pending' && (
                        <>
                          <button className="secondary-button" onClick={() => void updateBookingStatus(item.id, 'confirmed')}>Xác nhận</button>
                          <button className="secondary-button" onClick={() => void updateBookingStatus(item.id, 'cancelled')}>Hủy</button>
                        </>
                      )}
                      {item.status === 'confirmed' && (
                        <button className="secondary-button" onClick={() => setCompletingBookingId(item.id)}>Hoàn thành buổi tập</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có buổi tập nào hôm nay" description="Khi có lịch trong hệ thống, các buổi tập sẽ xuất hiện tại đây." action={<Link className="secondary-button" to="/booking">Mở booking</Link>} />
          )}
        </DashboardPanel>

        <DashboardPanel title="Học viên được phân công" description="Danh sách học viên trong phạm vi của bạn">
          {activeMembers ? (
            <div className="record-list">
              <div className="record-row">
                <Users size={17} />
                <span>
                  <strong>{activeMembers}</strong>
                  <small>Học viên đang trong phạm vi</small>
                </span>
                <Link to="/crm">Quản lý CRM</Link>
              </div>
            </div>
          ) : (
            <EmptyState title="Chưa có học viên" description="Học viên sẽ xuất hiện khi được phân công cho bạn." action={<Link className="secondary-button" to="/crm">Quản lý CRM</Link>} />
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel title="Lối tắt" description="Đi tới chức năng Coach được cấp quyền">
        <div className="quick-grid">
          <QuickAction to="/booking" title="Lịch tập" description="Mở booking" icon={<Calendar size={18} />} />
          <QuickAction to="/members" title="Học viên" description="Danh sách trong scope" icon={<Users size={18} />} />
          <QuickAction to="/crm" title="CRM" description="Theo dõi chăm sóc" icon={<ClipboardList size={18} />} />
        </div>
      </DashboardPanel>
    </div>
  );
}

