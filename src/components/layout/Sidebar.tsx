import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, BarChart3, Settings, LogOut,
  Scissors, CalendarDays, Wallet, Star, Image as ImageIcon,
  Search, Heart, CreditCard, Home, UserCircle, ShieldCheck, FileText, Sparkles,
  ArrowLeftRight, Clock, X, Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ModeTransition } from '../ui/ModeTransition';
import { BecomeProfessionalModal } from '../ui/BecomeProfessionalModal';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, role, logout, switchRole, verificationStatus, refreshVerificationStatus } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showModeTransition, setShowModeTransition] = useState(false);
  const [targetMode, setTargetMode] = useState<'user' | 'professional'>('user');
  const [showBecomeProModal, setShowBecomeProModal] = useState(false);

  const userLinks = [
    { to: '/user', icon: <Home size={20} />, label: t('sidebar.links.home') },
    { to: '/user/search', icon: <Search size={20} />, label: t('sidebar.links.search') },
    { to: '/user/appointments', icon: <CalendarDays size={20} />, label: t('sidebar.links.appointments') },
    { to: '/user/favorites', icon: <Heart size={20} />, label: t('sidebar.links.favorites') },
    { to: '/user/payments', icon: <CreditCard size={20} />, label: t('sidebar.links.payments') },
    { to: '/user/rewards', icon: <Gift size={20} />, label: t('sidebar.links.rewards') },
    { to: '/user/profile', icon: <UserCircle size={20} />, label: t('sidebar.links.profile') },
  ];

  const proLinks = [
    { to: '/professional', icon: <LayoutDashboard size={20} />, label: t('sidebar.links.dashboard') },
    { to: '/professional/calendar', icon: <CalendarDays size={20} />, label: t('sidebar.links.calendar') },
    { to: '/professional/wallet', icon: <Wallet size={20} />, label: t('sidebar.links.wallet') },
    { to: '/professional/services', icon: <Scissors size={20} />, label: t('sidebar.links.services') },
    { to: '/professional/portfolio', icon: <ImageIcon size={20} />, label: t('sidebar.links.portfolio') },
    { to: '/professional/reviews', icon: <Star size={20} />, label: t('sidebar.links.reviews') },
    { to: '/professional/schedule', icon: <Clock size={20} />, label: t('sidebar.links.schedule') },
    { to: '/professional/analytics', icon: <BarChart3 size={20} />, label: t('sidebar.links.analytics') },
    { to: '/professional/profile', icon: <UserCircle size={20} />, label: t('sidebar.links.profile') },
  ];

  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: t('sidebar.links.dashboard') },
    { to: '/admin/ai', icon: <Sparkles size={20} />, label: 'Admin IA' },
    { to: '/admin/analytics', icon: <BarChart3 size={20} />, label: t('sidebar.links.analytics') },
    { to: '/admin/transactions', icon: <FileText size={20} />, label: t('sidebar.links.transactions') },
    { to: '/admin/bookings', icon: <CalendarDays size={20} />, label: 'Citas' },
    { to: '/admin/users', icon: <Users size={20} />, label: t('sidebar.links.users') },
    { to: '/admin/professionals', icon: <Briefcase size={20} />, label: t('sidebar.links.professionals') },
    { to: '/admin/services', icon: <Scissors size={20} />, label: t('sidebar.links.services') },
    { to: '/admin/settings', icon: <Settings size={20} />, label: t('sidebar.links.settings') },
    { to: '/admin/profile', icon: <UserCircle size={20} />, label: t('sidebar.links.profile') },
  ];

  const links = role === 'admin' ? adminLinks : role === 'professional' ? proLinks : userLinks;
  const roleLabel = role === 'admin' ? t('sidebar.roleAdmin') : role === 'professional' ? t('sidebar.rolePro') : t('sidebar.roleUser');

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  const handleRoleSwitch = () => {
    if (role === 'user') {
      // If user is not an approved professional, show the application modal
      if (verificationStatus !== 'approved') {
        setShowBecomeProModal(true);
        return;
      }
      setTargetMode('professional');
      setShowModeTransition(true);
    } else if (role === 'professional') {
      setTargetMode('user');
      setShowModeTransition(true);
    }
    onClose?.();
  };

  const handleTransitionComplete = () => {
    setShowModeTransition(false);
    if (targetMode === 'professional') {
      switchRole('professional');
      navigate('/professional');
    } else {
      switchRole('user');
      navigate('/user');
    }
  };

  const handleBecomeProSuccess = async () => {
    await refreshVerificationStatus();
  };

  // Determine the switch button text
  const switchButtonText = role === 'user'
    ? (verificationStatus === 'approved' ? t('sidebar.actions.switchToPro') : t('sidebar.actions.becomePro'))
    : t('sidebar.actions.switchToClient');

  return (
    <>
      {/* Mode Transition Overlay */}
      <ModeTransition
        targetMode={targetMode}
        isVisible={showModeTransition}
        onComplete={handleTransitionComplete}
      />

      {/* Become Professional Modal */}
      <BecomeProfessionalModal
        isOpen={showBecomeProModal}
        onClose={() => setShowBecomeProModal(false)}
        onSuccess={handleBecomeProSuccess}
      />

      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="logo-icon"><Sparkles size={20} /></span>
            <span className="logo-text">JustMe</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
            <div className="sidebar-role-badge">
              <ShieldCheck size={12} />
              <span>{roleLabel}</span>
            </div>
            <button onClick={onClose} className="sidebar-close-btn">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/user' || link.to === '/professional' || link.to === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Role Switch Button */}
          {role !== 'admin' && (
            <button className="sidebar-role-switch" onClick={handleRoleSwitch}>
              <ArrowLeftRight size={16} />
              {switchButtonText}
            </button>
          )}

          {user && (
            <div className="sidebar-user">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user.name}</p>
                <p className="sidebar-user-email">{user.email}</p>
              </div>
            </div>
          )}
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>{t('sidebar.actions.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
