import { motion } from 'framer-motion';
import { 
  Star, Activity, Loader, 
  TrendingUp, Users, ShoppingBag, DollarSign,
  Calendar, ArrowUpRight, ArrowDownRight,
  Clock, UserPlus, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Card, Badge, Avatar, Button } from '../../../components/ui';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { useTranslation } from 'react-i18next';

// --- Internal Sub-components ---

const MetricCard = ({ title, value, icon, trend, color, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card variant="glass" className="hover-lift" style={{ border: '1px solid var(--neutral-200)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
            {title}
          </p>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--neutral-900)', fontFamily: 'var(--font-display)' }}>
            {value}
          </h3>
        </div>
        <div style={{ padding: '10px', background: `${color}15`, color: color, borderRadius: 'var(--radius-lg)' }}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'var(--space-3)' }}>
          {trend > 0 ? (
            <Badge variant="success" size="sm" style={{ padding: '2px 6px' }}>
              <ArrowUpRight size={12} style={{ marginRight: '2px' }} /> {trend}%
            </Badge>
          ) : (
            <Badge variant="error" size="sm" style={{ padding: '2px 6px' }}>
              <ArrowDownRight size={12} style={{ marginRight: '2px' }} /> {Math.abs(trend)}%
            </Badge>
          )}
          <span style={{ fontSize: '10px', color: 'var(--neutral-400)', fontWeight: 500 }}>vs last month</span>
        </div>
      )}
      
      {/* Decorative background shape */}
      <div style={{ 
        position: 'absolute', bottom: -10, right: -10, width: 60, height: 60, 
        background: color, opacity: 0.03, borderRadius: '50%', filter: 'blur(20px)' 
      }} />
    </Card>
  </motion.div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-6)' }}>
    {Icon && (
      <div style={{ padding: '10px', background: 'var(--neutral-100)', color: 'var(--neutral-600)', borderRadius: 'var(--radius-xl)' }}>
        <Icon size={20} />
      </div>
    )}
    <div>
      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: 'var(--neutral-900)' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', margin: 0 }}>{subtitle}</p>}
    </div>
  </div>
);

// --- Main Component ---

export function AdminAnalyticsDashboard() {
  const { t } = useTranslation();
  const { analytics, summary, revenue, activity, isLoading } = useAdminAnalytics();

  const COLORS = ['var(--primary-500)', 'var(--success-500)', 'var(--warning-500)', 'var(--error-500)'];

  const pieData = analytics ? [
    { name: 'Completed', value: analytics.completedBookings },
    { name: 'Cancelled', value: Math.round(analytics.totalBookings * (analytics.cancelRate / 100)) },
    { name: 'Others', value: analytics.totalBookings - analytics.completedBookings - Math.round(analytics.totalBookings * (analytics.cancelRate / 100)) }
  ].filter(d => d.value > 0) : [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: 'var(--space-4)' }}>
        <Loader className="spin" size={40} style={{ color: 'var(--primary-500)' }} />
        <p style={{ color: 'var(--neutral-500)', fontWeight: 500 }}>Cargando inteligencia de datos...</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="admin-analytics-feature" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-4)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--neutral-900)', letterSpacing: '-0.03em', marginBottom: 'var(--space-1)' }}>
            {t('sharedPages.admin.analytTitle', 'Intelligence Dashboard')}
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Análisis en tiempo real del ecosistema JustMe
          </p>
        </div>
        <Badge variant="primary" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
          LIVE DATA
        </Badge>
      </div>

      {/* Main Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <MetricCard 
          title="Revenue" 
          value={formatCurrency(summary?.totalRevenue || 0)} 
          icon={<DollarSign size={24} />} 
          trend={12} 
          color="#ef4444" 
          delay={0.1}
        />
        <MetricCard 
          title="Bookings" 
          value={summary?.totalBookings || 0} 
          icon={<Calendar size={24} />} 
          trend={8} 
          color="var(--primary-500)" 
          delay={0.2}
        />
        <MetricCard 
          title="Professionals" 
          value={summary?.totalProfessionals || 0} 
          icon={<ShoppingBag size={24} />} 
          trend={5} 
          color="var(--success-500)" 
          delay={0.3}
        />
        <MetricCard 
          title="Users" 
          value={summary?.totalUsers || 0} 
          icon={<Users size={24} />} 
          trend={analytics?.monthlyGrowth} 
          color="var(--accent-500)" 
          delay={0.4}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Revenue Area Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card variant="glass" padding="lg" style={{ height: '100%', border: '1px solid var(--neutral-200)' }}>
            <SectionHeader 
              title="Revenue Growth" 
              subtitle="Monthly performance in COP" 
              icon={TrendingUp} 
            />
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neutral-100)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neutral-400)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neutral-400)' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 'var(--radius-lg)', border: 'none', boxShadow: 'var(--shadow-lg)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Secondary Charts Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            {/* Pie Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <Card variant="glass" padding="lg" style={{ height: '100%', border: '1px solid var(--neutral-200)' }}>
                <SectionHeader title="Booking Status" />
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--neutral-500)' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Performance Stats */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
              <Card variant="glass" padding="lg" style={{ height: '100%', border: '1px solid var(--neutral-200)', background: 'var(--neutral-900)', color: 'white' }}>
                <SectionHeader title="Efficiency" icon={Info} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>Booking Conversion</span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{analytics?.bookingRate}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 'full', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${analytics?.bookingRate}%` }} style={{ height: '100%', background: 'var(--primary-400)' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>Satisfaction Score</span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{((analytics?.avgRating || 0) * 20).toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 'full', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(analytics?.avgRating || 0) * 20}%` }} style={{ height: '100%', background: 'var(--success-400)' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={20} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 900 }}>{analytics?.avgRating.toFixed(1)}</span>
                      <span style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>Global Rating</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Bar Chart for volume */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)' }}>
              <SectionHeader title="Volume comparison" subtitle="Bookings per month" />
              <div style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer>
                  <BarChart data={revenue}>
                    <XAxis dataKey="label" hide />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Bar dataKey="bookings" fill="var(--neutral-900)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <Card variant="glass" padding="none" style={{ overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title="System Activity" subtitle="Real-time log of platform events" icon={Clock} />
            <Button variant="ghost" size="sm">Ver Todo</Button>
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-50)', textAlign: 'left' }}>
                  <th style={{ padding: '16px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--neutral-400)', fontWeight: 700 }}>Actor</th>
                  <th style={{ padding: '16px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--neutral-400)', fontWeight: 700 }}>Acción</th>
                  <th style={{ padding: '16px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--neutral-400)', fontWeight: 700 }}>Detalle</th>
                  <th style={{ padding: '16px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--neutral-400)', fontWeight: 700 }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item: any, idx: number) => (
                  <tr key={item.id} style={{ borderBottom: idx === activity.length - 1 ? 'none' : '1px solid var(--neutral-100)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={item.userAvatar} name={item.userName} size="sm" />
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--neutral-800)' }}>{item.userName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Badge variant={item.type === 'registration' ? 'accent' : 'primary'} size="sm">
                        {item.type === 'registration' ? <UserPlus size={10} style={{ marginRight: '4px' }} /> : <Calendar size={10} style={{ marginRight: '4px' }} />}
                        {item.title}
                      </Badge>
                    </td>
                    <td style={{ padding: '16px', fontSize: 'var(--text-sm)', color: 'var(--neutral-600)' }}>{item.description}</td>
                    <td style={{ padding: '16px', fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>{new Date(item.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
