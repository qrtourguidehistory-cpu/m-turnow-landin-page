import { useEffect, useRef, useCallback } from 'react';

export const useAutoScroll = (sectionIds: string[], intervalMs: number = 4000) => {
  const currentIndex = useRef(0);
  const isPaused = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pauseScroll = useCallback(() => {
    isPaused.current = true;
    
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    pauseTimeoutRef.current = setTimeout(() => {
      isPaused.current = false;
    }, 15000); // Resume after 15 seconds of no interaction
  }, []);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    let intervalTimeout: NodeJS.Timeout | null = null;
    let interval: NodeJS.Timeout | null = null;
    let isScrolling = false;
    let lastScrollTime = 0;

    const scrollToNext = () => {
      if (isPaused.current || isScrolling) return;
      
      const now = Date.now();
      // Asegurar que pasó el tiempo suficiente desde el último scroll
      if (now - lastScrollTime < intervalMs) return;
      
      // Buscar el siguiente índice válido
      let attempts = 0;
      let nextIndex = currentIndex.current;
      
      while (attempts < sectionIds.length) {
        nextIndex = (nextIndex + 1) % sectionIds.length;
        const element = document.getElementById(sectionIds[nextIndex]);
        
        if (element) {
          currentIndex.current = nextIndex;
          isScrolling = true;
          lastScrollTime = now;
          
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Esperar a que termine el scroll suave (típicamente toma ~500-800ms)
          scrollTimeout = setTimeout(() => {
            isScrolling = false;
          }, 1200); // Dar tiempo suficiente para que termine el scroll suave
          
          break;
        }
        attempts++;
      }
    };

    // Esperar un poco antes de empezar el auto-scroll para que la página cargue
    intervalTimeout = setTimeout(() => {
      interval = setInterval(scrollToNext, intervalMs);
    }, 2000);

    // Pause on user interaction
    const handleWheel = () => pauseScroll();
    const handleTouchStart = () => pauseScroll();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        pauseScroll();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (intervalTimeout) {
        clearTimeout(intervalTimeout);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sectionIds, intervalMs, pauseScroll]);
};
