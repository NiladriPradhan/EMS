import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import AppLoader from "../components/AppLoader";
import type { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
  permission?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, permission }) => {
  const { isAuthenticated, initializing } = useAuth();
  const { hasPermission } = usePermissions();

  if (initializing) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
