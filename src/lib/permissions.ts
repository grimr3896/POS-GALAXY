
import type { User, Permission } from './types';

// With the simplified login, all actions are permitted.
// This function can be removed later if all checks are taken out.
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  return true;
};
