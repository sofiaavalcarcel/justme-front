/**
 * Lazy-loadable wrappers for SharedPages components.
 * React.lazy() requires a module with a default export,
 * but SharedPages.tsx uses named exports. These wrappers bridge the gap.
 */
import { lazy } from 'react';

// ── Professional sub-pages ──
export const LazyProBookingRequests = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.ProBookingRequests }))
);
export const LazyProCalendar = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.ProCalendar }))
);
export const LazyProEarnings = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.ProEarnings }))
);
export const LazyProServices = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.ProServices }))
);
export const LazyProPortfolio = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.ProPortfolio }))
);
export const LazyProProfileEditor = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.ProProfileEditor }))
);
export const LazyProReviews = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.ProReviews }))
);

// ── Admin sub-pages ──
export const LazyAdminUsers = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.AdminUsers }))
);
export const LazyAdminProfessionals = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.AdminProfessionals }))
);
export const LazyAdminServices = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.AdminServices }))
);
export const LazyAdminTransactions = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.AdminTransactions }))
);
export const LazyAdminAnalytics = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.AdminAnalytics }))
);
export const LazyAdminSettings = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.AdminSettings }))
);
export const LazyAdminProfile = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.AdminProfile }))
);

// ── User sub-pages ──
export const LazyUserFavorites = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.UserFavorites }))
);
export const LazyUserPayments = lazy(() =>
  import('./SharedPages').then(m => ({ default: m.UserPayments }))
);
