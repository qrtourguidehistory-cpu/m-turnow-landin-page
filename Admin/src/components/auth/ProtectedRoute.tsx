import { ReactNode } from "react";
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  // Si no hay usuario, redirigir al login inmediatamente (sin esperar a que termine la carga)
  // Esto permite que el login page sea accesible de inmediato
  if (!user) {
    // Si está cargando, esperar máximo 2 segundos antes de redirigir
    if (isLoading) {
      const [shouldRedirect, setShouldRedirect] = React.useState(false);
      
      React.useEffect(() => {
        const timer = setTimeout(() => {
          setShouldRedirect(true);
        }, 2000);
        return () => clearTimeout(timer);
      }, []);

      if (shouldRedirect) {
        return <Navigate to="/auth" replace />;
      }

      // Mostrar loading solo por 2 segundos máximo
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      );
    }
    
    // Si no está cargando y no hay usuario, redirigir inmediatamente
    return <Navigate to="/auth" replace />;
  }

  // Si hay usuario pero está verificando si es admin, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario pero no es admin, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta aplicación.</p>
          <p className="text-sm text-muted-foreground">Contacta al administrador si crees que es un error.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
