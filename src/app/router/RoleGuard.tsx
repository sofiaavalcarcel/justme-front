import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../entities/session/model/store';
import { UserRole } from '../../shared/config/roles';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children ? <>{children}</> : <Outlet />;
};
