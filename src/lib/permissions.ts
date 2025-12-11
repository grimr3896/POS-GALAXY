
import type { User, Permission, Role } from './types';
import { rolePermissions } from './types';

export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) {
    return false;
  }
  
  const userPermissions = rolePermissions[user.role as Role];
  
  if (!userPermissions) {
    return false;
  }
  
  return userPermissions.includes(permission);
};
