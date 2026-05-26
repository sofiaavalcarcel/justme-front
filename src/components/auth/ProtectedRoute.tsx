import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'professional' | 'admin')[];
  requireApproved?: boolean;
}

export function ProtectedRoute({ allowedRoles, requireApproved }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoggingIn, verificationStatus, openLoginModal } = useAuth();

  if (isLoggingIn) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Si no está autenticado, abrimos el modal y enviamos a la raíz
    setTimeout(() => openLoginModal(), 100);
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'professional') return <Navigate to="/professional" replace />;
    return <Navigate to="/user" replace />;
  }

  // Block non-approved professionals from restricted routes
  if (requireApproved && role === 'professional' && verificationStatus !== 'approved') {
    return <Navigate to="/professional" replace />;
  }

  return <Outlet />;
}
