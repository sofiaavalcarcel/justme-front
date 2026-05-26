/**
 * Role-Permission mapping for post-login dashboard routing.
 * Uses for...of iteration as per technical requirement.
 */

interface RoleDashboardMapping {
  role: string;
  dashboardPath: string;
  requiredPermissions: string[];
}

/**
 * Priority-ordered dashboard mappings.
 * ADMIN > PROFESSIONAL > USER — first match wins.
 */
const ROLE_DASHBOARD_MAP: RoleDashboardMapping[] = [
  {
    role: 'admin',
    dashboardPath: '/admin',
    requiredPermissions: [
      'admin.dashboard',
      'admin.users',
      'admin.professionals',
      'admin.services',
      'admin.transactions',
      'admin.analytics',
      'admin.settings',
    ],
  },
  {
    role: 'professional',
    dashboardPath: '/professional',
    requiredPermissions: [
      'pro.dashboard',
      'pro.calendar',
      'pro.services',
      'pro.bookings',
      'pro.wallet',
      'pro.analytics',
    ],
  },
  {
    role: 'user',
    dashboardPath: '/user',
    requiredPermissions: [
      'user.search',
      'user.bookings',
      'user.favorites',
      'user.profile',
    ],
  },
];

/**
 * Determines the correct dashboard path after login by iterating
 * over the user's roles array using a for...of loop.
 *
 * Logic:
 * 1. Iterates each possible dashboard mapping (admin → pro → user)
 * 2. For each mapping, checks if any of the user's roles match
 * 3. Optionally verifies the user holds at least one required permission/module
 * 4. Returns the first matching dashboard path (highest priority wins)
 *
 * @param userRoles - Array of role objects from the user profile
 * @returns The dashboard path to redirect to
 */
export function resolvePostLoginDashboard(
  userRoles: { id: number; name: string; modules?: { name: string }[] }[]
): string {
  // Iterate over each dashboard mapping using for...of (technical requirement)
  for (const mapping of ROLE_DASHBOARD_MAP) {
    // Check if user has this role by iterating their roles
    for (const userRole of userRoles) {
      if (userRole.name === mapping.role) {
        // Verify user has at least one required permission/module
        const userModules = userRole.modules?.map((m) => m.name) || [];

        // If the modules system is not yet populated, allow access based on role alone
        if (userModules.length === 0) {
          return mapping.dashboardPath;
        }

        // Check if user has at least one of the required permissions
        for (const requiredPerm of mapping.requiredPermissions) {
          if (userModules.includes(requiredPerm)) {
            return mapping.dashboardPath;
          }
        }
      }
    }
  }

  // Fallback for unknown/unmatched roles
  return '/user';
}

/**
 * Get the list of permitted modules for a specific role.
 * Useful for conditionally rendering sidebar items.
 */
export function getPermittedModules(
  userRoles: { id: number; name: string; modules?: { name: string }[] }[],
  targetRole: string
): string[] {
  const modules: string[] = [];

  for (const role of userRoles) {
    if (role.name === targetRole && role.modules) {
      for (const mod of role.modules) {
        if (!modules.includes(mod.name)) {
          modules.push(mod.name);
        }
      }
    }
  }

  return modules;
}
