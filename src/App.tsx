import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Preloader, LoginModal } from './components/ui';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// User pages
import UserHome from './pages/user/UserHome';
import SearchPage from './pages/user/Search';
import ProfessionalProfile from './pages/user/ProfessionalProfile';
import Booking from './pages/user/Booking';
import Appointments from './pages/user/Appointments';
import UserProfile from './pages/user/UserProfile';
import UserRewards from './pages/user/UserRewards';

// Professional pages
import ProDashboard from './pages/professional/ProDashboard';
import ProWallet from './pages/professional/ProWallet';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Shared sub-pages
import {
  ProBookingRequests, ProCalendar, ProEarnings, ProServices, ProPortfolio, ProProfileEditor, ProReviews,
  AdminUsers, AdminProfessionals, AdminServices, AdminTransactions, AdminAnalytics, AdminSettings, AdminProfile, AdminBookings, AdminAi,
  UserFavorites, UserPayments,
} from './pages/SharedPages';
import ProSchedule from './pages/professional/ProSchedule';
import ProAnalytics from './pages/professional/ProAnalytics';

import './styles/index.css';

function GlobalModals() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  return <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />;
}

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Preloader />
          <GlobalModals />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* User Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user', 'professional', 'admin']} />}>
              <Route path="/user" element={<AppLayout />}>
                <Route index element={<UserHome />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="professional/:id" element={<ProfessionalProfile />} />
                <Route path="booking/:id" element={<Booking />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="favorites" element={<UserFavorites />} />
                <Route path="payments" element={<UserPayments />} />
                <Route path="rewards" element={<UserRewards />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>
            </Route>

            {/* Professional Routes */}
            <Route element={<ProtectedRoute allowedRoles={['professional', 'admin']} />}>
              <Route path="/professional" element={<AppLayout />}>
                <Route index element={<ProDashboard />} />
                <Route path="requests" element={<ProBookingRequests />} />
                <Route path="calendar" element={<ProCalendar />} />
                <Route path="earnings" element={<ProEarnings />} />
                <Route path="wallet" element={<ProWallet />} />
                <Route path="services" element={<ProServices />} />
                <Route path="portfolio" element={<ProPortfolio />} />
                <Route path="reviews" element={<ProReviews />} />
                <Route path="profile" element={<ProProfileEditor />} />
                <Route path="schedule" element={<ProSchedule />} />
                <Route path="analytics" element={<ProAnalytics />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AppLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="professionals" element={<AdminProfessionals />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="ai" element={<AdminAi />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
