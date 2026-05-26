import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  lastName?: string;
  docType?: string;
  docNumber?: string;
  email: string;
  password: string;
  role: 'user' | 'professional';
  phone?: string;
}

export interface AuthResponse {
  access_token?: string;
  token?: string;
  refresh_token?: string;
  require2FA?: boolean;
  userId?: number;
  user?: {
    id: number;
    name: string;
    lastName?: string;
    email: string;
    roles: { id: number; name: string }[];
    photoUrl?: string;
    avatar?: string;
    isTwoFactorEnabled?: boolean;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const payload = {
        email: credentials.email,
        password: credentials.password
      };
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      console.log('Backend Login Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login service error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const payload = {
        name: data.name,
        lastName: data.lastName,
        docType: data.docType,
        docNumber: data.docNumber,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone
      };
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      return response.data;
    } catch (error: any) {
      console.error('Register service error:', error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // 2FA Methods
  generate2FA: async () => {
    const response = await apiClient.post<{ qrCode: string }>('/auth/2fa/generate');
    return response.data;
  },

  turnOn2FA: async (code: string) => {
    const response = await apiClient.post('/auth/2fa/turn-on', { code });
    return response.data;
  },

  turnOff2FA: async () => {
    const response = await apiClient.post('/auth/2fa/turn-off');
    return response.data;
  },

  authenticate2FA: async (userId: number, code: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/2fa/authenticate', { userId, code });
    return response.data;
  }
};
