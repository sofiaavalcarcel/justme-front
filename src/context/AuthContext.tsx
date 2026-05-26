import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type LoginCredentials, type RegisterData } from '../services/authService';
import { verificationService, type VerificationStatus } from '../services/verificationService';
import { professionalsService } from '../services/professionalsService';

export interface UserProfile {
  id: string | number;
  name: string;
  lastName?: string;
  email: string;
  roles: { id: number; name: string }[];
  role?: 'user' | 'professional' | 'admin';
  photoUrl?: string;
  phone?: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
  addresses?: { id: string; label?: string; title?: string; current?: boolean; address: string }[];
  isTwoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: 'user' | 'professional' | 'admin' | null;
  isLoggingIn: boolean;
  verificationStatus: VerificationStatus['status'];
  professionalId: string | null; // The ID from the professionals table
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<void>;
  loginWithToken: (token: string, roleParam?: string | null, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'user' | 'professional' | 'admin') => void;
  refreshVerificationStatus: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  resolveProfessionalId: (userId: string | number) => Promise<string | null>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'user' | 'professional' | 'admin' | null>(() => {
    return (localStorage.getItem('justme_role') as any) || (sessionStorage.getItem('justme_role') as any) || null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [vStatus, setVStatus] = useState<VerificationStatus['status']>('none');
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const refreshVerificationStatus = async () => {
    try {
      const result = await verificationService.getVerificationStatus();
      setVStatus(result.status);
    } catch {
      setVStatus('none');
    }
  };

  /**
   * Resolve the professional profile ID from the user ID.
   * The professionals table has its own auto-increment IDs separate from users.
   */
  const resolveProfessionalId = async (userId: string | number) => {
    try {
      const proProfile = await professionalsService.getProfessionalByUserId(String(userId));
      if (proProfile?.id) {
        const pid = String(proProfile.id);
        setProfessionalId(pid);
        if (localStorage.getItem('justme_token')) {
          localStorage.setItem('justme_professional_id', pid);
          sessionStorage.removeItem('justme_professional_id');
        } else {
          sessionStorage.setItem('justme_professional_id', pid);
          localStorage.removeItem('justme_professional_id');
        }
        return pid;
      }
    } catch {
      // Professional profile doesn't exist yet
    }
    setProfessionalId(null);
    localStorage.removeItem('justme_professional_id');
    sessionStorage.removeItem('justme_professional_id');
    return null;
  };

  // Automatically fetch user profile if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('justme_token') || sessionStorage.getItem('justme_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          const userRole = profile.roles?.[0]?.name || 'user';
          setUser({ ...profile, role: userRole });
          setRole(userRole as any);
          if (localStorage.getItem('justme_token')) {
            localStorage.setItem('justme_role', userRole);
          } else {
            sessionStorage.setItem('justme_role', userRole);
          }

          // Fetch verification status and professional ID
          if (userRole === 'professional') {
            await refreshVerificationStatus();
            await resolveProfessionalId(profile.id);
          } else {
            // Even users might have applied to be a professional
            const cachedPid = localStorage.getItem('justme_professional_id') || sessionStorage.getItem('justme_professional_id');
            if (cachedPid) setProfessionalId(cachedPid);
          }
        } catch (error) {
          console.error("Failed to fetch profile automatically", error);
          logout();
        }
      }
      setIsLoggingIn(false);
    };

    initAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginCredentials, rememberMe: boolean = false) => {
    setIsLoggingIn(true);
    try {
      const response = await authService.login(credentials);
      const token = response.access_token || response.token;
      if (token) {
        if (rememberMe) {
          localStorage.setItem('justme_token', token);
          sessionStorage.removeItem('justme_token');
        } else {
          sessionStorage.setItem('justme_token', token);
          localStorage.removeItem('justme_token');
        }
      }

      const userRole = response?.user?.roles?.[0]?.name || 'user';
      if (rememberMe) {
        localStorage.setItem('justme_role', userRole);
        sessionStorage.removeItem('justme_role');
      } else {
        sessionStorage.setItem('justme_role', userRole);
        localStorage.removeItem('justme_role');
      }
      setUser({ ...response.user, role: userRole } as unknown as UserProfile);
      setRole(userRole as any);

      if (userRole === 'professional') {
        await refreshVerificationStatus();
        if (response.user?.id) {
          await resolveProfessionalId(response.user.id);
        }
      }
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithToken = async (token: string, roleParam?: string | null, rememberMe: boolean = false) => {
    setIsLoggingIn(true);
    try {
      if (rememberMe) {
        localStorage.setItem('justme_token', token);
      } else {
        sessionStorage.setItem('justme_token', token);
      }
      
      const profile = await authService.getProfile();
      const userRole = roleParam || profile.roles?.[0]?.name || 'user';
      
      if (rememberMe) {
        localStorage.setItem('justme_role', userRole);
        sessionStorage.removeItem('justme_role');
      } else {
        sessionStorage.setItem('justme_role', userRole);
        localStorage.removeItem('justme_role');
      }
      setUser({ ...profile, role: userRole } as unknown as UserProfile);
      setRole(userRole as any);

      if (userRole === 'professional') {
        await refreshVerificationStatus();
        await resolveProfessionalId(profile.id);
      }
    } catch (error) {
      console.error('Login with token error in context:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoggingIn(true);
    try {
      const response = await authService.register(data);
      const token = response.access_token || response.token;
      if (token) {
        localStorage.setItem('justme_token', token);
        sessionStorage.removeItem('justme_token');
      }

      const userRole = response?.user?.roles?.[0]?.name || 'user';
      localStorage.setItem('justme_role', userRole);
      sessionStorage.removeItem('justme_role');
      setUser({ ...response.user, role: userRole } as unknown as UserProfile);
      setRole(userRole as any);
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setVStatus('none');
    setProfessionalId(null);
    localStorage.removeItem('justme_token');
    localStorage.removeItem('justme_role');
    localStorage.removeItem('justme_professional_id');
    sessionStorage.removeItem('justme_token');
    sessionStorage.removeItem('justme_role');
    sessionStorage.removeItem('justme_professional_id');
  };

  const switchRole = (newRole: 'user' | 'professional' | 'admin') => {
    if (user) {
      setUser({ ...user, roles: [{ id: 0, name: newRole }] });
      setRole(newRole);
      if (localStorage.getItem('justme_token')) {
        localStorage.setItem('justme_role', newRole);
        sessionStorage.removeItem('justme_role');
      } else {
        sessionStorage.setItem('justme_role', newRole);
        localStorage.removeItem('justme_role');
      }
      if (newRole === 'professional' && !professionalId) {
        resolveProfessionalId(user.id);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, role, isLoggingIn,
      verificationStatus: vStatus,
      professionalId,
      login, loginWithToken, register, logout, switchRole,
      refreshVerificationStatus, setUser, resolveProfessionalId,
      isLoginModalOpen, openLoginModal, closeLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
