export interface Professional {
  id: string;
  name?: string; // Some versions might have user nested
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  verified: boolean;
  isVisible: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
}

export interface ProfessionalUpdateDto {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  isVisible?: boolean;
}
