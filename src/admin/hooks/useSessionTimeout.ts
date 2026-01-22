import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos en milisegundos
const ADMIN_SESSION_KEY = 'admin_session_active';
const ADMIN_LAST_ACTIVITY_KEY = 'admin_last_activity';

export function useSessionTimeout(onSignOut: () => Promise<void>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isWindowVisibleRef = useRef<boolean>(!document.hidden);

  // Verificar si estamos en una ruta de admin (sin el prefijo /admin en las rutas)
  const isAdminRoute = window.location.pathname !== '/auth' && 
                       window.location.pathname !== '/';

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const now = Date.now();
    lastActivityRef.current = now;
    
    // Guardar en localStorage
    if (isAdminRoute) {
      localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, now.toString());
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    }

    // Configurar timeout para cerrar sesión después de inactividad
    timeoutRef.current = setTimeout(async () => {
      // Verificar si la ventana está visible antes de cerrar sesión
      if (!document.hidden && isAdminRoute) {
        await onSignOut();
        localStorage.removeItem(ADMIN_SESSION_KEY);
        localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
      }
    }, INACTIVITY_TIMEOUT);
  }, [onSignOut, isAdminRoute]);

  const handleActivity = useCallback(() => {
    if (isWindowVisibleRef.current && isAdminRoute) {
      resetTimeout();
    }
  }, [resetTimeout, isAdminRoute]);

  useEffect(() => {
    // Solo activar si estamos en una ruta de admin
    if (!isAdminRoute) {
      return;
    }

    // Verificar al cargar si la sesión debe cerrarse
    const checkSessionOnLoad = async () => {
      const lastActivity = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
      const sessionActive = localStorage.getItem(ADMIN_SESSION_KEY);
      
      if (lastActivity && sessionActive === 'true') {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
        
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          // Cerrar sesión si pasó el tiempo límite
          await onSignOut();
          localStorage.removeItem(ADMIN_SESSION_KEY);
          localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
          return;
        } else {
          // Continuar con el tiempo restante
          lastActivityRef.current = parseInt(lastActivity, 10);
          const remainingTime = INACTIVITY_TIMEOUT - timeSinceLastActivity;
          timeoutRef.current = setTimeout(async () => {
            await onSignOut();
            localStorage.removeItem(ADMIN_SESSION_KEY);
            localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
          }, remainingTime);
        }
      } else {
        // Iniciar nuevo timeout
        resetTimeout();
      }
    };

    checkSessionOnLoad();

    // Eventos de actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Agregar listeners de actividad
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Detectar cuando la ventana se oculta (cierra pestaña/ventana)
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Ventana se ocultó - guardar timestamp
        isWindowVisibleRef.current = false;
        const now = Date.now();
        lastActivityRef.current = now;
        localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, now.toString());
        
        // Limpiar timeout mientras está oculta
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // Ventana volvió a ser visible
        isWindowVisibleRef.current = true;
        
        // Verificar si pasaron más de 10 minutos desde la última actividad
        const lastActivity = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
          
          if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
            // Cerrar sesión si pasó el tiempo límite
            await onSignOut();
            localStorage.removeItem(ADMIN_SESSION_KEY);
            localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
          } else {
            // Reiniciar timeout con el tiempo restante
            lastActivityRef.current = parseInt(lastActivity, 10);
            const remainingTime = INACTIVITY_TIMEOUT - timeSinceLastActivity;
            timeoutRef.current = setTimeout(async () => {
              await onSignOut();
              localStorage.removeItem(ADMIN_SESSION_KEY);
              localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
            }, remainingTime);
          }
        } else {
          resetTimeout();
        }
      }
    };

    // Detectar cuando la ventana pierde el foco
    const handleBlur = () => {
      // Guardar timestamp cuando pierde el foco
      const now = Date.now();
      lastActivityRef.current = now;
      localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, now.toString());
    };

    // Detectar cuando la ventana recupera el foco
    const handleFocus = async () => {
      // Verificar si pasaron más de 10 minutos
      const lastActivity = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
        
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          await onSignOut();
          localStorage.removeItem(ADMIN_SESSION_KEY);
          localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
        } else {
          resetTimeout();
        }
      } else {
        resetTimeout();
      }
    };

    // Detectar cuando se cierra la ventana/pestaña
    const handleBeforeUnload = () => {
      // Marcar que la sesión debe verificarse al volver
      localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, Date.now().toString());
      // Intentar cerrar sesión de forma síncrona
      supabase.auth.signOut().catch(() => {
        // Ignorar errores en beforeunload
      });
    };

    // Detectar cuando la página se descarga
    const handlePageHide = () => {
      // Guardar timestamp
      localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, Date.now().toString());
      // Intentar cerrar sesión
      supabase.auth.signOut().catch(() => {
        // Ignorar errores
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleActivity, resetTimeout, onSignOut, isAdminRoute]);
}

