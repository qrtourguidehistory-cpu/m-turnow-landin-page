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
        
        // Verificar que el userId es válido
        if (!userId || userId.length === 0) {
          console.error('Invalid userId provided to checkAdminRole:', userId);
          return false;
        }
        
        // Query user_roles table directly to check for admin role
        // Usar una consulta más simple y directa para evitar cancelaciones
        console.log('Executing Supabase query for admin role check...');
        const query = supabase
          .from('user_roles')
          .select('role, user_id, created_at')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        const { data, error } = await query;
        
        console.log('Query completed. Data:', data, 'Error:', error);
        
        // Limpiar la referencia después de completar (solo en el primer intento)
        if (retryCount === 0) {
          checkAdminRoleRef.current.delete(userId);
        }
        
        if (error) {
          console.error('Error in admin role check query:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            userId: userId
          });
          
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
        console.log('Admin role check result:', {
          isAdmin: isAdmin,
          data: data,
          userId: userId,
          hasData: !!data,
          dataContent: data ? JSON.stringify(data) : 'null'
        });
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

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si hay sesión, verificar admin de forma simple
      if (session?.user) {
        // Verificación rápida para el super admin
        if (session.user.email === 'jordandn15@outlook.com') {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        // Para otros usuarios, verificar en BD (sin reintentos complejos)
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle()
          .then(({ data }) => {
            if (mounted) {
              setIsAdmin(data !== null);
              setIsLoading(false);
            }
          })
          .catch(() => {
            if (mounted) {
              setIsAdmin(false);
              setIsLoading(false);
            }
          });
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    // Escuchar cambios de auth
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Verificación rápida para el super admin
          if (session.user.email === 'jordandn15@outlook.com') {
            setIsAdmin(true);
            setIsLoading(false);
            return;
          }
          
          // Para otros usuarios
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(data !== null);
        } else {
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    subscription = authSubscription;

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      checkAdminRoleRef.current.clear();
    };
  }, []);

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
      
      // Verificación rápida de admin - super admin directo
      if (data.user?.email === 'jordandn15@outlook.com') {
        setIsAdmin(true);
        setUser(data.user);
        setSession(data.session);
        return { error: null };
      }
      
      // Para otros usuarios, verificar en la base de datos (pero de forma simple)
      if (data.user?.id) {
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(roleData !== null);
        } catch (err) {
          // Si falla la verificación, asumir que no es admin
          console.warn('Error checking admin role after login:', err);
          setIsAdmin(false);
        }
      }
      
      setUser(data.user);
      setSession(data.session);
      
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
