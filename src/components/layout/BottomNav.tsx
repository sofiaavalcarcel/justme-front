import { NavLink } from 'react-router-dom';
import { Home, Search, CalendarDays, Heart, UserCircle, LayoutDashboard, Briefcase, Wallet, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './BottomNav.css';

export function BottomNav() {
  const { role } = useAuth();
  const { t } = useTranslation();

  const userTabs = [
    { to: '/user', icon: <Home size={22} />, label: t('bottomNav.links.home') },
    { to: '/user/search', icon: <Search size={22} />, label: t('bottomNav.links.search') },
    { to: '/user/appointments', icon: <CalendarDays size={22} />, label: t('bottomNav.links.bookings') },
    { to: '/user/favorites', icon: <Heart size={22} />, label: t('bottomNav.links.saved') },
    { to: '/user/profile', icon: <UserCircle size={22} />, label: t('bottomNav.links.profile') },
  ];

  const proTabs = [
    { to: '/professional', icon: <LayoutDashboard size={22} />, label: t('bottomNav.links.dashboard') },
    { to: '/professional/requests', icon: <Briefcase size={22} />, label: t('bottomNav.links.requests') },
    { to: '/professional/calendar', icon: <CalendarDays size={22} />, label: t('bottomNav.links.calendar') },
    { to: '/professional/wallet', icon: <Wallet size={22} />, label: t('bottomNav.links.wallet') },
    { to: '/professional/profile', icon: <UserCircle size={22} />, label: t('bottomNav.links.profile') },
  ];

  const adminTabs = [
    { to: '/admin', icon: <LayoutDashboard size={22} />, label: t('bottomNav.links.dashboard') },
    { to: '/admin/users', icon: <Users size={22} />, label: t('bottomNav.links.users') },
    { to: '/admin/professionals', icon: <Briefcase size={22} />, label: t('bottomNav.links.pros') },
    { to: '/admin/analytics', icon: <BarChart3 size={22} />, label: t('bottomNav.links.analytics') },
    { to: '/admin/settings', icon: <UserCircle size={22} />, label: t('bottomNav.links.settings') },
  ];

  const tabs = role === 'admin' ? adminTabs : role === 'professional' ? proTabs : userTabs;

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/user' || tab.to === '/professional' || tab.to === '/admin'}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
