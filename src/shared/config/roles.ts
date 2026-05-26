export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  PROFESSIONAL: 'PROFESSIONAL',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
