import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, Bot, User, Loader, TrendingUp, TrendingDown,
  Users, Calendar, DollarSign, Star, AlertTriangle, CheckCircle,
  Zap, Activity, Sparkles, RefreshCw
} from 'lucide-react';
import { Card, Button } from '../../../components/ui';
import { useAiMetrics, useAiInsights, useAiAlerts, useAiChat } from '../hooks/useAdminAi';
import type { ChatMessage, AiInsight, AiAlert } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ── Sub-components ──────────────────────────────────────────

const InsightCard = ({ insight }: { insight: AiInsight }) => {
  const colors = {
    info: { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
    warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    success: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    danger: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  };
  const c = colors[insight.type];
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px',
      background: c.bg, borderRadius: 'var(--radius-xl)', border: `1px solid ${c.border}`,
    }}>
      <Sparkles size={16} style={{ color: c.color, marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 'var(--text-sm)', color: c.color, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
          {insight.message}
        </p>
        {insight.metric && (
          <span style={{ fontSize: '11px', color: c.color, opacity: 0.7, fontWeight: 700 }}>
            {insight.metric}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const AlertCard = ({ alert }: { alert: AiAlert }) => {
  const sev = {
    low: { color: 'var(--primary-600)', bg: 'var(--primary-50)', border: 'var(--primary-100)' },
    medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    high: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };
  const s = sev[alert.severity];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
      padding: '14px 16px', background: s.bg, borderRadius: 'var(--radius-xl)',
      border: `1px solid ${s.border}`, display: 'flex', gap: '12px', alignItems: 'flex-start',
    }}>
      <AlertTriangle size={18} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: s.color, margin: 0 }}>{alert.title}</p>
          {alert.count !== undefined && (
            <span style={{ fontSize: '10px', fontWeight: 800, background: s.color, color: 'white', padding: '2px 7px', borderRadius: '99px' }}>
              {alert.count}
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: s.color, opacity: 0.8, margin: 0 }}>{alert.description}</p>
      </div>
    </motion.div>
  );
};

const MetricCard = ({ label, value, icon, color, sub, delay = 0 }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card variant="glass" style={{ border: '1px solid var(--neutral-200)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--neutral-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</p>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, margin: 0, color: 'var(--neutral-900)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</h3>
          {sub && <p style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: '6px', fontWeight: 500 }}>{sub}</p>}
        </div>
        <div style={{ padding: '10px', background: `${color}18`, color, borderRadius: 'var(--radius-lg)' }}>{icon}</div>
      </div>
      <div style={{ position: 'absolute', bottom: -15, right: -15, width: 70, height: 70, background: color, opacity: 0.04, borderRadius: '50%', filter: 'blur(20px)' }} />
    </Card>
  </motion.div>
);

// ── Chat Component ───────────────────────────────────────────

function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0', role: 'assistant', content: '👋 Hola, soy tu asistente IA de JustMe. Pregúntame sobre reservas, ingresos, usuarios o profesionales.',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const { sendMessage, isSending } = useAiChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestions = ['¿Cuántas citas hay hoy?', '¿Cuál es el servicio más popular?', '¿Cómo están los ingresos?'];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isSending) return;
    setInput('');
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    try {
      const res = await sendMessage(msg);
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: res.reply, timestamp: new Date(), source: res.source }]);
    } catch {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Error al conectar con el asistente. Inténtalo de nuevo.', timestamp: new Date() }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 420 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {messages.map(m => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 36, height: 36, borderRadius: '12px', background: m.role === 'user' ? 'var(--primary-600)' : 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: m.role === 'assistant' ? '1px solid var(--primary-100)' : 'none', boxShadow: m.role === 'user' ? '0 4px 12px var(--primary-200)' : 'none' }}>
                {m.role === 'user' ? <User size={18} color="white" /> : <Bot size={18} style={{ color: 'var(--primary-600)' }} />}
              </div>
              <div style={{
                maxWidth: '80%', padding: '12px 16px', 
                borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                background: m.role === 'user' ? 'var(--primary-600)' : '#ffffff',
                color: m.role === 'user' ? 'white' : 'var(--neutral-800)',
                fontSize: 'var(--text-sm)', lineHeight: 1.6, 
                border: m.role === 'assistant' ? '1px solid var(--neutral-200)' : 'none',
                boxShadow: m.role === 'assistant' ? 'var(--shadow-sm)' : '0 4px 12px var(--primary-200)'
              }}>
                <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </motion.div>
          ))}
          {isSending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'var(--primary-50)', border: '1px solid var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} style={{ color: 'var(--primary-600)' }} />
              </div>
              <div style={{ padding: '12px 16px', background: '#ffffff', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary-400)' }} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: d, duration: 0.7 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => handleSend(s)} style={{ fontSize: '12px', padding: '8px 14px', borderRadius: '99px', border: '1px solid var(--neutral-200)', background: '#ffffff', color: 'var(--neutral-700)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}>
              <Sparkles size={12} style={{ color: 'var(--primary-500)' }} /> {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--neutral-100)', display: 'flex', gap: '10px', background: 'var(--neutral-50)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Pregunta algo sobre tu negocio..."
          style={{ flex: 1, padding: '12px 20px', border: '1px solid var(--neutral-200)', borderRadius: '99px', outline: 'none', fontSize: 'var(--text-sm)', background: '#ffffff', fontFamily: 'inherit', boxShadow: 'var(--shadow-sm)' }}
          disabled={isSending}
        />
        <button onClick={() => handleSend()} disabled={!input.trim() || isSending} style={{
          width: 46, height: 46, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--primary-600)' : 'var(--neutral-200)',
          color: 'white', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: input.trim() ? '0 4px 12px var(--primary-200)' : 'none'
        }}>
          {isSending ? <Loader size={18} className="spin" /> : <Send size={18} style={{ marginLeft: 2 }} />}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export function AdminAiPage() {
  const { metrics, isLoading, refetch } = useAiMetrics();
  const { insights, insightsSource, isLoading: loadingInsights } = useAiInsights();
  const { alerts } = useAiAlerts();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'chat'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard IA', icon: <Activity size={16} /> },
    { id: 'chat', label: 'Asistente', icon: <Bot size={16} /> },
  ] as const;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 'var(--radius-xl)', color: 'white', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
              <Brain size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--neutral-900)', letterSpacing: '-0.03em', margin: 0 }}>
                Admin IA
              </h2>
              <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)', margin: 0 }}>
                Monitoreo inteligente y asistente administrativo
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--success-50)', border: '1px solid var(--success-100)', borderRadius: '99px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success-500)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success-600)' }}>Sistema activo</span>
          </div>
          <Button variant="ghost" icon={<RefreshCw size={16} />} onClick={() => refetch()}>Actualizar</Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-xl)', padding: '4px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveSection(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px',
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: activeSection === t.id ? 'white' : 'transparent',
            color: activeSection === t.id ? 'var(--neutral-900)' : 'var(--neutral-500)',
            fontWeight: activeSection === t.id ? 700 : 500, fontSize: 'var(--text-sm)',
            boxShadow: activeSection === t.id ? 'var(--shadow-sm)' : 'none',
          }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'dashboard' ? (
          <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* KPI Grid */}
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader className="spin" size={36} style={{ color: 'var(--primary-500)' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <MetricCard label="Total Citas" value={metrics?.totalBookings ?? 0} icon={<Calendar size={22} />} color="#6366f1" sub={`${metrics?.completedBookings} completadas`} delay={0.05} />
                <MetricCard label="Ingresos" value={fmt(metrics?.totalRevenue ?? 0)} icon={<DollarSign size={22} />} color="#10b981" sub={`Tasa: ${metrics?.bookingRate}%`} delay={0.1} />
                <MetricCard label="Usuarios" value={metrics?.totalUsers ?? 0} icon={<Users size={22} />} color="#f59e0b" sub={`${metrics?.activeUsers} activos/30d`} delay={0.15} />
                <MetricCard label="Profesionales" value={metrics?.totalProfessionals ?? 0} icon={<Activity size={22} />} color="#8b5cf6" sub={`${metrics?.activeProfessionals} activos`} delay={0.2} />
                <MetricCard label="Rating Promedio" value={`${metrics?.avgRating?.toFixed(1) ?? '0.0'} ⭐`} icon={<Star size={22} />} color="#f59e0b" sub="De profesionales" delay={0.25} />
                <MetricCard label="Top Servicio" value={metrics?.topService ?? 'N/A'} icon={<Zap size={22} />} color="#ec4899" sub="Más solicitado" delay={0.3} />
              </div>
            )}

            {/* Trends + Insights + Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>

              {/* Insights */}
              <Card variant="glass" style={{ border: '1px solid var(--neutral-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontWeight: 800, fontSize: 'var(--text-lg)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: '#6366f1' }} /> Insights IA
                  </h3>
                  {insightsSource === 'ollama' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', padding: '3px 10px', borderRadius: '99px' }}>
                      <Bot size={10} /> IA Local
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, background: 'var(--neutral-100)', color: 'var(--neutral-600)', padding: '3px 10px', borderRadius: '99px' }}>
                      ⚡ Fallback Local
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {loadingInsights ? (
                    <Loader className="spin" size={24} style={{ color: 'var(--primary-500)', margin: '20px auto', display: 'block' }} />
                  ) : insights.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--neutral-400)' }}>
                      <CheckCircle size={32} style={{ marginBottom: '8px', color: 'var(--success-400)' }} />
                      <p style={{ fontWeight: 600, margin: 0 }}>Sin alertas. Todo en orden.</p>
                    </div>
                  ) : insights.map(i => <InsightCard key={i.id} insight={i} />)}
                </div>
              </Card>

              {/* Alerts */}
              <Card variant="glass" style={{ border: '1px solid var(--neutral-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontWeight: 800, fontSize: 'var(--text-lg)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> Alertas del Sistema
                  </h3>
                  {alerts.length > 0 && (
                    <span style={{ background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px' }}>
                      {alerts.length}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {alerts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--neutral-400)' }}>
                      <CheckCircle size={32} style={{ marginBottom: '8px', color: 'var(--success-400)' }} />
                      <p style={{ fontWeight: 600, margin: 0 }}>No hay alertas activas.</p>
                    </div>
                  ) : alerts.map(a => <AlertCard key={a.id} alert={a} />)}
                </div>
              </Card>
            </div>

            {/* Business summary */}
            {metrics && (
              <Card variant="glass" style={{ border: '1px solid var(--neutral-200)', background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  <div>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, fontWeight: 700, marginBottom: '8px' }}>RESUMEN EJECUTIVO</p>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 900, margin: 0, lineHeight: 1.3 }}>
                      {metrics.cancelRate >= 30 ? '⚠️ Tasa de cancelación elevada — acción requerida.' : metrics.bookingRate >= 70 ? '✅ Plataforma operando en óptimo nivel.' : '📊 Rendimiento dentro de parámetros normales.'}
                    </h3>
                    <p style={{ opacity: 0.6, fontSize: 'var(--text-sm)', marginTop: '6px' }}>
                      Crecimiento mensual: {metrics.recentGrowth > 0 ? '+' : ''}{metrics.recentGrowth}% | Cancelaciones: {metrics.cancelRate}% | Top: {metrics.topService}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {metrics.recentGrowth >= 0
                      ? <TrendingUp size={48} style={{ opacity: 0.3 }} />
                      : <TrendingDown size={48} style={{ opacity: 0.3 }} />
                    }
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <Card variant="glass" padding="none" style={{ border: '1px solid var(--neutral-200)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', background: '#ffffff' }}>
              {/* Chat header */}
              <div style={{ padding: '20px 24px', background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: '14px', border: '1px solid var(--primary-100)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                  <Bot size={24} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, margin: 0, fontSize: '18px', color: 'var(--neutral-900)' }}>Asistente Administrativo</p>
                  <p style={{ fontSize: '12px', color: 'var(--neutral-500)', margin: '2px 0 0 0', fontWeight: 500 }}>Responde en tiempo real usando IA Local</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success-50)', padding: '6px 12px', borderRadius: '99px', border: '1px solid var(--success-100)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success-500)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success-700)' }}>En línea</span>
                </div>
              </div>
              <AiChat />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
