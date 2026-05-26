import { apiClient } from '../../../shared/api/axiosClient';
import type { Booking, BookingStats } from '../types';

// Mock data generator for beauty services
const generateMockBookings = (): Booking[] => {
  const services = ['Manicura Premium', 'Corte y Peinado', 'Masaje Relajante', 'Maquillaje Social', 'Limpieza Facial'];
  const statuses: any[] = ['pending', 'confirmed', 'completed', 'cancelled'];
  const payments = ['Tarjeta de Crédito', 'Transferencia', 'Efectivo', 'JustMe Credits'];
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: 1000 + i,
    userId: 200 + i,
    user: {
      id: 200 + i,
      name: ['Ana', 'Maria', 'Laura', 'Valentina', 'Isabella'][i % 5],
      lastName: ['Gomez', 'Rodriguez', 'Lopez', 'Perez', 'Martinez'][i % 5],
      email: `customer${i}@example.com`,
      phone: `+57 300 ${1000000 + i}`,
      avatar: `https://i.pravatar.cc/150?u=user${i}`
    },
    professionalId: 300 + (i % 5),
    professional: {
      id: 300 + (i % 5),
      user: {
        name: ['Carlos', 'Elena', 'Roberto', 'Sofia', 'David'][i % 5],
        lastName: ['Styles', 'Beauty', 'Spa', 'Makeup', 'Barber'][i % 5],
        avatar: `https://i.pravatar.cc/150?u=pro${i % 5}`
      }
    },
    professionalService: {
      id: 400 + i,
      service: {
        name: services[i % services.length],
        category: 'Belleza'
      }
    },
    date: new Date(2026, 4, 15 + (i % 10)).toISOString().split('T')[0],
    startTime: `${9 + (i % 8)}:00`,
    endTime: `${10 + (i % 8)}:00`,
    status: statuses[i % statuses.length],
    price: 45000 + (i * 5000),
    location: 'Calle 100 #15-30, Bogotá, Colombia',
    locationType: i % 2 === 0 ? 'home' : 'professional',
    notes: i % 3 === 0 ? 'Por favor llegar puntual, es para un evento.' : undefined,
    paymentMethod: payments[i % payments.length],
    createdAt: new Date(2026, 4, 1).toISOString(),
    updatedAt: new Date(2026, 4, 1).toISOString(),
    history: [
      { status: 'pending', timestamp: new Date(2026, 4, 1).toISOString(), comment: 'Reserva creada por el cliente' }
    ]
  }));
};

export const bookingService = {
  getBookings: async (page = 1, limit = 10, _filters = {}) => {
    // In a real app: const response = await apiClient.get('/admin/bookings', { params: { page, limit, ...filters } });
    // For this premium demo, we use realistic mock data
    const allBookings = generateMockBookings();
    
    // Simulate filtering
    let filtered = [...allBookings];
    // ... logic for filters ...

    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  getStats: async (): Promise<BookingStats> => {
    // In real app: const response = await apiClient.get('/admin/bookings/stats');
    const mock = generateMockBookings();
    return {
      total: mock.length,
      pending: mock.filter(b => b.status === 'pending').length,
      confirmed: mock.filter(b => b.status === 'confirmed').length,
      completed: mock.filter(b => b.status === 'completed').length,
      cancelled: mock.filter(b => b.status === 'cancelled').length,
      revenue: mock.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0)
    };
  },

  updateStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/admin/bookings/${id}/status`, { status });
    return response.data;
  }
};
