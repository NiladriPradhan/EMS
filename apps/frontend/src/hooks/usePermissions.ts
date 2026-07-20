import { useAuth } from "./useAuth";

export const usePermissions = () => {
  const { user } = useAuth();
  const permissions = user?.permissions || [];

  /**
   * Check if the user has a specific permission
   */
  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  /**
   * Check if the user has ANY of the given permissions
   */
  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some((permission) =>
      permissions.includes(permission),
    );
  };

  /**
   * Check if the user has ALL of the given permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
  };
};
