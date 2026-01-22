import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
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
  const checkAdminRoleRef = useRef<Map<string, Promise<boolean>>>(new Map());

  const checkAdminRole = useCallback(async (userId: string) => {
    // Evitar múltiples llamadas simultáneas para el mismo usuario
    if (checkAdminRoleRef.current.has(userId)) {
      console.log('Admin role check already in progress for user:', userId);
      return await checkAdminRoleRef.current.get(userId)!;
    }

    const checkPromise = (async () => {
      try {
        console.log('Checking admin role for user:', userId);
        
        // Query user_roles table directly to check for admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        // Limpiar la referencia después de completar
        checkAdminRoleRef.current.delete(userId);
        
        if (error) {
          // Si el error es un AbortError, ignorarlo silenciosamente
          if (error.message?.includes('abort') || error.message?.includes('AbortError') || 
              error.code === 'PGRST301' || error.code === 'PGRST116') {
            console.warn('Admin role check was aborted or cancelled:', error.message || error);
            return false;
          }
          console.error('Error checking admin role:', error);
          return false;
        }
        
        const isAdmin = data !== null;
        console.log('Admin role check result:', isAdmin, data);
        return isAdmin;
      } catch (err: any) {
        // Limpiar la referencia en caso de error
        checkAdminRoleRef.current.delete(userId);
        
        // Ignorar errores de aborto
        if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
          console.warn('Admin role check was aborted:', err.message);
          return false;
        }
        console.error('Error in checkAdminRole:', err);
        return false;
      }
    })();

    // Guardar la promesa en el mapa
    checkAdminRoleRef.current.set(userId, checkPromise);
    return await checkPromise;
  }, []);

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
      
      console.log('updateAdminStatus called with userId:', userId);
      
      try {
        if (userId) {
          const adminStatus = await checkAdminRole(userId);
          console.log('Admin status result:', adminStatus);
          if (mounted && !loadingResolved) {
            setIsAdmin(adminStatus);
            setIsLoading(false);
            loadingResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
          }
        } else {
          console.log('No userId provided, setting isAdmin to false');
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
        
        // Solo verificar timeout si hay valores en localStorage (sesión activa previa)
        if (isAdminRoute && session) {
          const lastActivity = localStorage.getItem('admin_last_activity');
          const sessionActive = localStorage.getItem('admin_session_active');
          
          // Solo verificar timeout si hay registro previo de actividad
          if (lastActivity && sessionActive === 'true') {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
            
            // Si pasaron más de 10 minutos, cerrar sesión
            if (timeSinceLastActivity >= 10 * 60 * 1000) {
              console.log('Session expired due to inactivity');
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
            } else {
              // Sesión válida, actualizar actividad
              localStorage.setItem('admin_last_activity', Date.now().toString());
            }
          } else {
            // Primera vez accediendo o sin registro previo - inicializar actividad
            localStorage.setItem('admin_last_activity', Date.now().toString());
            localStorage.setItem('admin_session_active', 'true');
          }
        }

        if (mounted) {
          console.log('Initial session check:', session ? 'exists' : 'null', 'User ID:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          // Solo actualizar estado de admin si hay una sesión con usuario
          if (session?.user?.id) {
            await updateAdminStatus(session.user.id);
          } else {
            // No hay sesión, establecer estados por defecto
            if (!loadingResolved) {
              setIsAdmin(false);
              setIsLoading(false);
              loadingResolved = true;
              if (timeoutId) clearTimeout(timeoutId);
            }
          }
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
        
        console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'null', 'User ID:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Solo actualizar estado de admin si hay una sesión con usuario
        if (session?.user?.id) {
          await updateAdminStatus(session.user.id);
        } else {
          // No hay sesión, establecer estados por defecto
          if (mounted && !loadingResolved) {
            setIsAdmin(false);
            setIsLoading(false);
            loadingResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
          }
        }
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
      // Limpiar todas las referencias de checkAdminRole
      checkAdminRoleRef.current.clear();
    };
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error: new Error(error.message) };
      }
      
      console.log('Sign in successful, user ID:', data.user?.id);
      
      // Marcar actividad al iniciar sesión
      const now = Date.now();
      localStorage.setItem('admin_last_activity', now.toString());
      localStorage.setItem('admin_session_active', 'true');
      
      // El onAuthStateChange se disparará automáticamente y actualizará el estado
      // Pero también podemos actualizar manualmente aquí para asegurar sincronización
      if (data.user?.id) {
        try {
          const adminStatus = await checkAdminRole(data.user.id);
          console.log('Admin status after login:', adminStatus);
          setIsAdmin(adminStatus);
          setUser(data.user);
          setSession(data.session);
        } catch (err: any) {
          // Si hay un error al verificar el rol, no fallar el login
          console.warn('Error checking admin role after login (non-fatal):', err);
          setUser(data.user);
          setSession(data.session);
          // El onAuthStateChange también intentará verificar el rol
        }
      }
      
      return { error: null };
    } catch (err) {
      console.error('Sign in exception:', err);
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






