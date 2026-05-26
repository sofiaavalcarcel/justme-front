import { Bell, Search, Menu, Sparkles, CheckCheck, User, LogOut, Settings, Wallet, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle, LanguageToggle, Badge } from '../ui';
import { motion } from 'framer-motion';
import { apiClient } from '../../services/api';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

interface TopBarProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        apiClient.get<Notification[]>('/notifications'),
        apiClient.get<number>('/notifications/unread-count'),
      ]);
      setNotifications(notifRes.data);
      setUnread(typeof countRes.data === 'number' ? countRes.data : (countRes.data as any)?.count ?? 0);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: number) => {
    await apiClient.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await apiClient.patch('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const deleteAll = async () => {
    await apiClient.patch('/notifications/delete-all').catch(() => {});
    setNotifications([]);
    setUnread(0);
  };

  return { notifications, unread, markRead, markAllRead, deleteAll };
}

const typeColors: Record<string, string> = {
  booking: 'var(--primary-500)',
  wallet: 'var(--success-500)',
  review: '#fbbf24',
  system: 'var(--neutral-400)',
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout, role, openLoginModal } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unread, markRead, markAllRead, deleteAll } = useNotifications();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fullName = user ? `${user.name || ''} ${user.lastName || ''}`.trim() : '';

  // Navigate to the right profile/settings page based on role
  const getProfileRoute = () => {
    if (role === 'admin') return '/admin/profile';
    if (role === 'professional') return '/professional/profile';
    return '/user/profile';
  };

  const getSettingsRoute = () => {
    if (role === 'admin') return '/admin/settings';
    if (role === 'professional') return '/professional/profile';
    return '/user/profile';
  };

  const handleNavigate = (route: string) => {
    setShowProfile(false);
    navigate(route);
  };

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    setTimeout(() => openLoginModal(), 100);
    navigate('/');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div className="topbar-logo-mobile">
          <span className="logo-icon"><Sparkles size={20} /></span>
          <span className="logo-text">JustMe</span>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={18} />
        <input type="text" placeholder={t('nav.searchPlaceholder')} />
      </div>

      <div className="topbar-right">
        <div className="topbar-actions">
          <LanguageToggle size="sm" />
          <ThemeToggle size="sm" />
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="topbar-dropdown-container">
          <button
            className={`topbar-icon-btn ${showNotif ? 'active' : ''}`}
            id="notifications-btn"
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
          >
            <Bell size={20} />
            {unread > 0 && <span className="topbar-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>

          {showNotif && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="topbar-dropdown notifications-dropdown"
            >
              <div className="topbar-dropdown-header">
                <h3>{t('sharedPages.pro.notifTitle', 'Notificaciones')}</h3>
                {notifications.length > 0 && (
                  <div className="topbar-dropdown-actions">
                    <button className="topbar-dropdown-action" onClick={markAllRead} title={t('sharedPages.pro.markAllRead', 'Marcar todo leído')}>
                      <CheckCheck size={14} />
                    </button>
                    <button className="topbar-dropdown-action danger" onClick={deleteAll} title={t('nav.clearAll', 'Borrar todo')}>
                      <LogOut size={14} style={{ transform: 'rotate(90deg)' }} /> 
                    </button>
                  </div>
                )}
              </div>
              <div className="topbar-dropdown-list">
                {notifications.length === 0 ? (
                  <div className="topbar-dropdown-empty">
                    <div className="empty-icon-ring">
                      <Bell size={28} />
                    </div>
                    <p>{t('sharedPages.pro.noNotif', 'Sin notificaciones')}</p>
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    className={`topbar-notif-item ${n.isRead ? '' : 'unread'}`}
                    onClick={() => !n.isRead && markRead(n.id)}
                  >
                    <div
                      className="topbar-notif-icon"
                      style={{ background: `${typeColors[n.type] || typeColors.system}15`, color: typeColors[n.type] || typeColors.system }}
                    >
                      {n.type === 'booking' ? <Bell size={14} /> : 
                       n.type === 'wallet' ? <Wallet size={14} /> : 
                       n.type === 'review' ? <Star size={14} /> : 
                       <Sparkles size={14} />}
                    </div>
                    <div className="topbar-notif-content">
                      <p className="topbar-notif-title">{n.title}</p>
                      <p className="topbar-notif-msg">{n.message}</p>
                      <p className="topbar-notif-time">
                        {new Date(n.createdAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.isRead && <div className="unread-dot" />}
                  </div>
                ))}
              </div>
              <div className="topbar-dropdown-footer">
                <button onClick={() => setShowNotif(false)}>{t('userHome.seeAll')}</button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Profile Dropdown */}
        {user && (
          <div ref={profileRef} className="topbar-dropdown-container">
            <button
              className={`topbar-avatar-btn ${showProfile ? 'active' : ''}`}
              onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            >
              <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
            </button>

            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="topbar-dropdown profile-dropdown"
              >
                <div className="topbar-profile-header">
                  <Avatar src={user.avatar} name={user.name} size="md" status="online" />
                  <div className="profile-info">
                    <p className="profile-name">{fullName || user.name}</p>
                    <p className="profile-email">{user.email}</p>
                    <Badge variant="primary" size="sm">
                      {user.roles?.[0]?.name || role || 'admin'}
                    </Badge>
                  </div>
                </div>
                <div className="topbar-dropdown-divider" />
                <div className="topbar-dropdown-menu">
                  <button className="topbar-dropdown-item" onClick={() => handleNavigate(getProfileRoute())}>
                    <div className="item-icon"><User size={16} /></div>
                    <span>{t('sidebar.links.profile')}</span>
                  </button>
                  <button className="topbar-dropdown-item" onClick={() => handleNavigate(getSettingsRoute())}>
                    <div className="item-icon"><Settings size={16} /></div>
                    <span>{t('sidebar.links.settings')}</span>
                  </button>
                  {role === 'professional' && (
                    <button className="topbar-dropdown-item" onClick={() => handleNavigate('/professional/wallet')}>
                      <div className="item-icon"><Wallet size={16} /></div>
                      <span>{t('sidebar.links.wallet')}</span>
                    </button>
                  )}
                </div>
                <div className="topbar-dropdown-divider" />
                <button className="topbar-dropdown-item danger" onClick={handleLogout}>
                  <div className="item-icon"><LogOut size={16} /></div>
                  <span>{t('sidebar.actions.logout')}</span>
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}



