import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Si está cargando, mostrar nada (o un loader mínimo)
  if (isLoading) {
    return null;
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Si hay usuario, dar acceso directo (confiamos en que el login validó que es admin)
  return <>{children}</>;
}
