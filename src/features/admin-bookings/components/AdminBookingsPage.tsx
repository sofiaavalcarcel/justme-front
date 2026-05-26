import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Search, Filter, Eye, 
  CheckCircle2, XCircle, Clock, MapPin, Phone, 
  Mail, CreditCard, DollarSign, Download, Plus,
  ChevronLeft, ChevronRight, User, Scissors,
  MessageSquare, Info, Loader
} from 'lucide-react';
import { Card, Badge, Button, Avatar, Input } from '../../../components/ui';
import { useAdminBookings } from '../hooks/useAdminBookings';
import type { Booking, BookingStatus } from '../types';

// --- Sub-components ---

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const configs = {
    pending: { variant: 'warning' as const, icon: <Clock size={12} />, label: 'Pendiente' },
    confirmed: { variant: 'accent' as const, icon: <CheckCircle2 size={12} />, label: 'Confirmada' },
    completed: { variant: 'success' as const, icon: <CheckCircle2 size={12} />, label: 'Completada' },
    cancelled: { variant: 'error' as const, icon: <XCircle size={12} />, label: 'Cancelada' },
  };
  
  const config = configs[status] || configs.pending;
  
  return (
    <Badge variant={config.variant} size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const StatCard = ({ title, value, icon, color, delay = 0 }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card variant="glass" className="hover-lift" style={{ border: '1px solid var(--neutral-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ padding: '12px', background: `${color}15`, color: color, borderRadius: 'var(--radius-xl)' }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--neutral-900)', fontFamily: 'var(--font-display)' }}>{value}</h3>
        </div>
      </div>
    </Card>
  </motion.div>
);

// --- Main Page Component ---

export function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { bookings, stats, total, totalPages, isLoading } = useAdminBookings(page, 10);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookings;
    return bookings.filter(b => 
      b.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.professional.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.professionalService.service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  return (
    <div className="admin-bookings-feature" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-4)' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--neutral-900)', letterSpacing: '-0.03em', marginBottom: 'var(--space-1)' }}>
            Gestión de Citas
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
            Control centralizado de todas las reservas y servicios a domicilio.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="outline" icon={<Download size={18} />}>Exportar</Button>
          <Button variant="primary" icon={<Plus size={18} />}>Nueva Cita</Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <StatCard title="Total Citas" value={stats?.total || 0} icon={<Calendar size={24} />} color="var(--primary-500)" delay={0.1} />
        <StatCard title="Pendientes" value={stats?.pending || 0} icon={<Clock size={24} />} color="#f59e0b" delay={0.2} />
        <StatCard title="Completadas" value={stats?.completed || 0} icon={<CheckCircle2 size={24} />} color="#10b981" delay={0.3} />
        <StatCard title="Canceladas" value={stats?.cancelled || 0} icon={<XCircle size={24} />} color="#ef4444" delay={0.4} />
        <StatCard title="Ingresos" value={formatCurrency(stats?.revenue || 0)} icon={<DollarSign size={24} />} color="var(--accent-500)" delay={0.5} />
      </div>

      {/* Main Table Section */}
      <Card variant="glass" padding="none" style={{ border: '1px solid var(--neutral-200)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
        {/* Table Toolbar */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', background: 'rgba(255,255,255,0.5)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Input 
              placeholder="Buscar por cliente, profesional o servicio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} style={{ color: 'var(--neutral-400)' }} />}
              style={{ borderRadius: 'var(--radius-full)', background: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="ghost" icon={<Filter size={18} />}>Filtros</Button>
            <Badge variant="default" style={{ padding: '8px 12px', fontWeight: 600 }}>
              {total} resultados
            </Badge>
          </div>
        </div>

        {/* The Table */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-100)' }}>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>Cliente</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>Profesional</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>Servicio</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>Fecha y Hora</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>Estado</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>Precio</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                    <Loader className="spin" size={32} style={{ color: 'var(--primary-500)', margin: '0 auto' }} />
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--neutral-400)', fontWeight: 500 }}>No se encontraron citas con esos criterios.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredBookings.map((booking, i) => (
                    <motion.tr 
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid var(--neutral-100)', background: i % 2 === 0 ? 'transparent' : 'rgba(250,250,250,0.5)' }}
                      whileHover={{ background: 'var(--neutral-50)' }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar src={booking.user.avatar} name={booking.user.name} size="sm" />
                          <div>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--neutral-900)', margin: 0 }}>{booking.user.name} {booking.user.lastName}</p>
                            <p style={{ fontSize: '11px', color: 'var(--neutral-500)', margin: 0 }}>ID: #{booking.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar src={booking.professional.user.avatar} name={booking.professional.user.name} size="xs" />
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--neutral-700)', margin: 0 }}>{booking.professional.user.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Badge variant="default" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-700)' }}>
                          {booking.professionalService.service.name}
                        </Badge>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--neutral-800)' }}>{booking.date}</span>
                          <span style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>{booking.startTime} - {booking.endTime}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neutral-900)' }}>{formatCurrency(booking.price)}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          icon={<Eye size={16} />}
                          onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                        >
                          Ver más
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: 'var(--space-4)', background: 'var(--neutral-50)', borderTop: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 500 }}>
            Mostrando {filteredBookings.length} de {total} reservas
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft size={16} />} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--neutral-700)' }}>Página {page} de {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} icon={<ChevronRight size={16} />} />
          </div>
        </div>
      </Card>

      {/* Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBooking && (
          <BookingDetailsModal 
            booking={selectedBooking} 
            onClose={() => setIsModalOpen(false)} 
            formatCurrency={formatCurrency}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Detail Modal Internal Component ---

function BookingDetailsModal({ booking, onClose, formatCurrency }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }}
        style={{ background: 'white', width: '100%', maxWidth: '800px', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', boxShadow: 'var(--shadow-2xl)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: 'var(--space-6)', background: 'linear-gradient(135deg, var(--neutral-900), var(--neutral-800))', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>Reserva #{booking.id}</h3>
              <StatusBadge status={booking.status} />
            </div>
            <p style={{ fontSize: 'var(--text-xs)', opacity: 0.7, margin: 0 }}>Creada el {new Date(booking.createdAt).toLocaleString()}</p>
          </div>
          <Button variant="ghost" onClick={onClose} style={{ color: 'white', minWidth: '40px', padding: 0 }} icon={<XCircle size={24} />} />
        </div>

        {/* Modal Body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)', padding: 'var(--space-8)', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Left Column: People & Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            <section>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} /> Información del Cliente
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar src={booking.user.avatar} name={booking.user.name} size="lg" />
                <div>
                  <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--neutral-900)', margin: 0 }}>{booking.user.name} {booking.user.lastName}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {booking.user.email}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {booking.user.phone}</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scissors size={16} /> Profesional Asignado
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar src={booking.professional.user.avatar} name={booking.professional.user.name} size="lg" />
                <div>
                  <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--neutral-900)', margin: 0 }}>{booking.professional.user.name} {booking.professional.user.lastName}</p>
                  <Badge variant="accent" size="sm">Especialista en Belleza</Badge>
                </div>
              </div>
            </section>

            <section>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Ubicación del Servicio
              </h4>
              <Card variant="default" padding="sm" style={{ background: 'var(--neutral-50)', border: '1px solid var(--neutral-100)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)', margin: 0 }}>{booking.location}</p>
                <Badge variant="default" size="sm" style={{ marginTop: '8px' }}>
                  {booking.locationType === 'home' ? 'Servicio a Domicilio' : 'En el local'}
                </Badge>
              </Card>
            </section>
          </div>

          {/* Right Column: Service Details & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            <section>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} /> Detalles del Servicio
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-500)' }}>Servicio</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{booking.professionalService.service.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-500)' }}>Fecha</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{booking.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-500)' }}>Horario</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>
            </section>

            <section>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={16} /> Información de Pago
              </h4>
              <Card variant="default" padding="md" style={{ background: 'linear-gradient(to bottom right, var(--neutral-50), white)', border: '1.5px dashed var(--neutral-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>Método</span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{booking.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-900)', fontWeight: 600 }}>Total Pagado</span>
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--primary-600)' }}>{formatCurrency(booking.price)}</span>
                </div>
              </Card>
            </section>

            <section>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--neutral-900)', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} /> Notas del Cliente
              </h4>
              <div style={{ padding: '12px', background: 'var(--warning-50)', color: 'var(--warning-800)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)', fontStyle: 'italic', border: '1px solid var(--warning-100)' }}>
                {booking.notes || "No hay notas adicionales para esta cita."}
              </div>
            </section>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{ padding: 'var(--space-6)', background: 'var(--neutral-50)', borderTop: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button variant="danger" icon={<XCircle size={16} />}>Cancelar Cita</Button>
          <Button variant="accent" icon={<CheckCircle2 size={16} />}>Confirmar Cita</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
