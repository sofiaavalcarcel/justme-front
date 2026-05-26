export interface User {
  id: string;
  name: string;
  lastName?: string | null;
  email: string;
  phone: string | null;
  role: 'user' | 'professional' | 'admin';
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}
