import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

  const checkAdminRole = useCallback(async (userId: string, retryCount = 0): Promise<boolean> => {
    const MAX_RETRIES = 3;
    
    // Evitar múltiples llamadas simultáneas para el mismo usuario (solo en el primer intento)
    if (retryCount === 0 && checkAdminRoleRef.current.has(userId)) {
      console.log('Admin role check already in progress for user:', userId);
      try {
        return await checkAdminRoleRef.current.get(userId)!;
      } catch {
        // Si la promesa anterior falló, continuar con nuevo intento
      }
    }

    const checkPromise = (async (): Promise<boolean> => {
      try {
        console.log(`Checking admin role for user: ${userId} (attempt ${retryCount + 1})`);
        
        // Query user_roles table directly to check for admin role
        // Usar una consulta más simple y directa para evitar cancelaciones
        const query = supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        const { data, error } = await query;
        
        // Limpiar la referencia después de completar (solo en el primer intento)
        if (retryCount === 0) {
          checkAdminRoleRef.current.delete(userId);
        }
        
        if (error) {
          // Si el error es un AbortError, reintentar hasta MAX_RETRIES veces
          if (error.message?.includes('abort') || error.message?.includes('AbortError') || 
              error.code === 'PGRST301' || error.code === 'PGRST116') {
            console.warn(`Admin role check was aborted (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message || error);
            
            // Reintentar si no hemos alcanzado el máximo
            if (retryCount < MAX_RETRIES) {
              // Esperar un poco antes de reintentar (backoff exponencial)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
              return checkAdminRole(userId, retryCount + 1);
            }
            
            // Si se agotaron los reintentos, hacer una última consulta directa sin caché
            console.warn('Max retries reached, attempting final direct query');
            try {
              const { data: finalData, error: finalError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('role', 'admin')
                .maybeSingle();
              
              if (finalError) {
                console.error('Final admin role check failed:', finalError);
                return false;
              }
              
              return finalData !== null;
            } catch (finalErr: any) {
              console.error('Final admin role check exception:', finalErr);
              return false;
            }
          }
          console.error('Error checking admin role:', error);
          return false;
        }
        
        const isAdmin = data !== null;
        console.log('Admin role check result:', isAdmin, data);
        return isAdmin;
      } catch (err: any) {
        // Limpiar la referencia en caso de error (solo en el primer intento)
        if (retryCount === 0) {
          checkAdminRoleRef.current.delete(userId);
        }
        
        // Si es un AbortError, reintentar
        if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
          console.warn(`Admin role check was aborted (attempt ${retryCount + 1}/${MAX_RETRIES}):`, err.message);
          
          if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
            return checkAdminRole(userId, retryCount + 1);
          }
          
          // Último intento directo
          try {
            const { data: finalData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId)
              .eq('role', 'admin')
              .maybeSingle();
            
            return finalData !== null;
          } catch {
            return false;
          }
        }
        
        console.error('Error in checkAdminRole:', err);
        return false;
      }
    })();

    // Guardar la promesa en el mapa solo en el primer intento
    if (retryCount === 0) {
      checkAdminRoleRef.current.set(userId, checkPromise);
    }
    
    return await checkPromise;
  }, []);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let loadingResolved = false;

    // Timeout de seguridad: si después de 10 segundos no se ha resuelto, forzar loading a false
    // Esto permite que el usuario vea el login page si hay problemas de conexión
    timeoutId = setTimeout(() => {
      if (mounted && !loadingResolved) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setIsLoading(false);
        loadingResolved = true;
        // Si no hay usuario después del timeout, asegurar que isAdmin sea false
        if (!user) {
          setIsAdmin(false);
        }
      }
    }, 10000);

    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'null', 'User ID:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Verificar rol de admin si hay sesión
        if (session?.user?.id) {
          try {
            const adminStatus = await checkAdminRole(session.user.id);
            if (mounted && !loadingResolved) {
              setIsAdmin(adminStatus);
              setIsLoading(false);
              loadingResolved = true;
              if (timeoutId) clearTimeout(timeoutId);
            }
          } catch (err) {
            console.error('Error checking admin role in auth state change:', err);
            if (mounted && !loadingResolved) {
              setIsAdmin(false);
              setIsLoading(false);
              loadingResolved = true;
              if (timeoutId) clearTimeout(timeoutId);
            }
          }
        } else {
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id).then((adminStatus) => {
          if (mounted && !loadingResolved) {
            setIsAdmin(adminStatus);
            setIsLoading(false);
            loadingResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
          }
        }).catch((err) => {
          console.error('Error checking admin role in getSession:', err);
          if (mounted && !loadingResolved) {
            setIsAdmin(false);
            setIsLoading(false);
            loadingResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
          }
        });
      } else {
        if (mounted && !loadingResolved) {
          setIsLoading(false);
          loadingResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    });

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
      
      // Verificar rol de admin después del login
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

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
