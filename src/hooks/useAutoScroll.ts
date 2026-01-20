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
    const interval = setInterval(() => {
      if (isPaused.current) return;
      
      currentIndex.current = (currentIndex.current + 1) % sectionIds.length;
      const element = document.getElementById(sectionIds[currentIndex.current]);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, intervalMs);

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
      clearInterval(interval);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sectionIds, intervalMs, pauseScroll]);
};
