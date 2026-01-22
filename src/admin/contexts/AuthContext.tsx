import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase/client";
import { useSessionTimeout } from "../hooks/useSessionTimeout";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    try {
      // Query user_roles table directly to check for admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return data !== null;
    } catch (err) {
      console.error('Error in checkAdminRole:', err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let loadingResolved = false;

    // Timeout de seguridad: si después de 10 segundos no se ha resuelto, forzar loading a false
    timeoutId = setTimeout(() => {
      if (mounted && !loadingResolved) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setIsLoading(false);
        loadingResolved = true;
      }
    }, 10000);

    // Función para actualizar el estado de admin
    const updateAdminStatus = async (userId: string | undefined) => {
      if (!mounted || loadingResolved) return;
      
      try {
        if (userId) {
          const adminStatus = await checkAdminRole(userId);
          if (mounted && !loadingResolved) {
            setIsAdmin(adminStatus);
            setIsLoading(false);
            loadingResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
          }
        } else {
          if (mounted && !loadingResolved) {
            setIsAdmin(false);
            setIsLoading(false);
            loadingResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
          }
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        if (mounted && !loadingResolved) {
          setIsAdmin(false);
          setIsLoading(false);
          loadingResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    // Verificar sesión existente primero
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted && !loadingResolved) {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setIsLoading(false);
            loadingResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
          }
          return;
        }

        // Verificar si estamos en una ruta de admin (cualquier ruta excepto /auth)
        const isAdminRoute = !window.location.pathname.startsWith('/auth');
        
        if (isAdminRoute && session) {
          const lastActivity = localStorage.getItem('admin_last_activity');
          const sessionActive = localStorage.getItem('admin_session_active');
          
          if (lastActivity && sessionActive === 'true') {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
            
            // Si pasaron más de 10 minutos, cerrar sesión
            if (timeSinceLastActivity >= 10 * 60 * 1000) {
              await supabase.auth.signOut();
              localStorage.removeItem('admin_session_active');
              localStorage.removeItem('admin_last_activity');
              if (mounted && !loadingResolved) {
                setSession(null);
                setUser(null);
                setIsAdmin(false);
                setIsLoading(false);
                loadingResolved = true;
                if (timeoutId) clearTimeout(timeoutId);
              }
              return;
            }
          } else if (!lastActivity || sessionActive !== 'true') {
            // Si no hay registro de actividad, cerrar sesión por seguridad
            await supabase.auth.signOut();
            localStorage.removeItem('admin_session_active');
            localStorage.removeItem('admin_last_activity');
            if (mounted && !loadingResolved) {
              setSession(null);
              setUser(null);
              setIsAdmin(false);
              setIsLoading(false);
              loadingResolved = true;
              if (timeoutId) clearTimeout(timeoutId);
            }
            return;
          }
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          await updateAdminStatus(session?.user?.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted && !loadingResolved) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          loadingResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    // Configurar listener de cambios de autenticación
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        await updateAdminStatus(session?.user?.id);
      }
    );

    subscription = authSubscription;
    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: new Error(error.message) };
      }
      
      // Marcar actividad al iniciar sesión
      const now = Date.now();
      localStorage.setItem('admin_last_activity', now.toString());
      localStorage.setItem('admin_session_active', 'true');
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_session_active');
    localStorage.removeItem('admin_last_activity');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }, []);

  // Usar el hook de timeout de sesión (solo se activa en rutas de admin)
  useSessionTimeout(signOut);

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}






