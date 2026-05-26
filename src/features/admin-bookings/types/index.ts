export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type LocationType = 'professional' | 'home';

export interface Booking {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  professionalId: number;
  professional: {
    id: number;
    user: {
      name: string;
      lastName: string;
      avatar?: string;
    };
  };
  professionalService: {
    id: number;
    service: {
      name: string;
      category: string;
    };
  };
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  price: number;
  location: string;
  locationType: LocationType;
  notes?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  history?: {
    status: BookingStatus;
    timestamp: string;
    comment?: string;
  }[];
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}
