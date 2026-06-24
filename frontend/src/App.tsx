import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CoachDashboard from './pages/coaches/CoachDashboard';
import MembersPage from './pages/members/MembersPage';
import ReferralPage from './pages/referral/ReferralPage';
import CouponPage from './pages/coupon/CouponPage';
import LoyaltyPage from './pages/loyalty/LoyaltyPage';
import AuditPage from './pages/audit/AuditPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import CRMPage from './pages/crm/CRMPage';
import TicketPage from './pages/tickets/TicketPage';
import InvoicePage from './pages/invoices/InvoicePage';
import BackupPage from './pages/backup/BackupPage';
import RevenuePage from './pages/revenue/RevenuePage';
import SettingsPage from './pages/settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="referral" element={<ReferralPage />} />
        <Route path="coupons" element={<CouponPage />} />
        <Route path="loyalty" element={<LoyaltyPage />} />
        <Route path="tickets" element={<TicketPage />} />
        <Route path="invoices" element={<InvoicePage />} />
        <Route path="crm" element={<CRMPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
        <Route path="admin/audit" element={<AdminRoute><AuditPage /></AdminRoute>} />
        <Route path="admin/revenue" element={<AdminRoute><RevenuePage /></AdminRoute>} />
        <Route path="admin/backup" element={<AdminRoute><BackupPage /></AdminRoute>} />
        <Route path="coach" element={<CoachDashboard />} />
      </Route>
    </Routes>
  );
}
