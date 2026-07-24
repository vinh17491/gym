import { Calendar, HelpCircle as CircleHelp, Dumbbell, HeartPulse, ShoppingBag, Star, Ticket, UserCheck, Phone, Mail } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';
import { DashboardPageHeader, DashboardPanel, DashboardSkeleton, EmptyState, MetricCard, PanelError, QuickAction } from '../../components/dashboard/DashboardPrimitives';

interface Booking {
  id: number;
  status: string;
  booking_date: string;
  start_time?: string;
  end_time?: string;
  coach_notes?: string;
}

interface LoyaltyPoints {
  balance: number;
}

interface MyCoachData {
  coach: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    avg_rating: number;
    total_sessions: number;
  } | null;
  upcoming_session?: Booking | null;
  latest_completed?: Booking | null;
}

export default function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const bookings = useApi<Booking[]>('/bookings');
  const points = useApi<LoyaltyPoints>('/loyalty/points');
  const myCoach = useApi<MyCoachData>('/bookings/my-coach');

  if (user?.role === 'admin') return <Navigate to="/admin" />;
  if (user?.role === 'coach') return <Navigate to="/coach" />;
  if (bookings.loading || points.loading) return <DashboardSkeleton />;

  const rows = bookings.data || [];
  const upcoming = rows.filter(item => ['pending', 'confirmed'].includes(item.status));
  const completed = rows.filter(item => item.status === 'completed');
  const coachInfo = myCoach.data?.coach;

  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        eyebrow="KHÔNG GIAN CÁ NHÂN"
        title={`Chào ${user?.name?.split(' ')[0] || 'bạn'}`}
        description="Tiếp tục hành trình của bạn với những việc cần làm tiếp theo."
        action={<Link className="primary-button" to="/booking">Đặt lịch Coach</Link>}
      />

      {(bookings.error || points.error) && (
        <PanelError
          message={bookings.error || points.error || 'Không thể tải dữ liệu'}
          onRetry={() => { void bookings.refetch(); void points.refetch(); void myCoach.refetch(); }}
        />
      )}

      <div className="metric-grid">
        <MetricCard title="Điểm Loyalty" value={points.data?.balance ?? '—'} icon={<Star size={18} />} tone="amber" />
        <MetricCard title="Buổi đã hoàn thành" value={completed.length} icon={<Dumbbell size={18} />} tone="lime" />
        <MetricCard title="Lịch sắp tới" value={upcoming.length} icon={<Calendar size={18} />} tone="blue" />
        <MetricCard title="Trạng thái tài khoản" value="Đang hoạt động" icon={<HeartPulse size={18} />} tone="slate" />
      </div>

      <div className="dashboard-grid-main">
        {/* My Assigned Coach Panel */}
        <DashboardPanel title="Huấn luyện viên của tôi" description="Coach đang đồng hành cùng bạn tại GymFit">
          {coachInfo ? (
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {coachInfo.avatar_url ? (
                    <img src={coachInfo.avatar_url} alt={coachInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCheck className="w-7 h-7 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-white">{coachInfo.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {Number(coachInfo.avg_rating || 5).toFixed(1)}</span>
                    <span>·</span>
                    <span>{coachInfo.total_sessions} buổi hoàn thành</span>
                  </div>
                </div>
                <Link to={`/coaches/${coachInfo.id}`} className="secondary-button text-xs px-3 py-1.5">Đặt lịch tập</Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-900">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{coachInfo.email}</span>
                </div>
                {coachInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{coachInfo.phone}</span>
                  </div>
                )}
              </div>

              {myCoach.data?.latest_completed?.coach_notes && (
                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/30 text-xs text-blue-200">
                  <strong className="block text-blue-400 mb-0.5">Nhận xét buổi tập vừa qua từ Coach:</strong>
                  <p>{myCoach.data.latest_completed.coach_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="Chưa có Coach phân công"
              description="Hãy đặt một buổi tập với Coach để khởi đầu hành trình tập luyện được hướng dẫn."
              action={<Link className="secondary-button" to="/coaches">Khám phá danh sách Coach</Link>}
            />
          )}
        </DashboardPanel>

        <DashboardPanel title="Việc tiếp theo" description="Ưu tiên cá nhân của bạn">
          {upcoming.length ? (
            <div className="record-list">
              {upcoming.slice(0, 3).map((item, index) => (
                <div className="record-row" key={`${item.booking_date}-${index}`}>
                  <Calendar size={17} />
                  <span>
                    <strong>Buổi tập đã đặt</strong>
                    <small>{new Date(item.booking_date).toLocaleDateString('vi-VN')} · {item.status}</small>
                  </span>
                  <Link to="/booking">Xem</Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có lịch sắp tới" description="Đặt một buổi với Coach để bắt đầu kế hoạch tiếp theo." action={<Link className="secondary-button" to="/booking">Đặt lịch</Link>} />
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel title="Tóm tắt cá nhân" description="Chỉ hiển thị dữ liệu thuộc tài khoản của bạn">
        <div className="quick-grid">
          <QuickAction to="/orders" title="Đơn hàng của tôi" description="Xem lịch sử mua hàng" icon={<ShoppingBag size={18} />} />
          <QuickAction to="/loyalty" title="Loyalty" description="Điểm và phần thưởng" icon={<Star size={18} />} />
          <QuickAction to="/tickets" title="Hỗ trợ" description="Gửi yêu cầu hỗ trợ" icon={<Ticket size={18} />} />
        </div>
      </DashboardPanel>
    </div>
  );
}

