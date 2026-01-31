import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Play, ChevronDown } from 'lucide-react';
import logoImage from '/og-image.png';

interface DownloadOption {
  label: string;
  url: string;
}

interface DownloadDropdownProps {
  store: 'appstore' | 'playstore';
  variant?: 'default' | 'mobile' | 'header' | 'header-mobile';
  className?: string;
}

const DownloadDropdown = ({ store, variant = 'default', className = '' }: DownloadDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // URLs de descarga
  const playStoreUrls = {
    cliente: 'https://play.google.com/store/apps/details?id=com.miturnow.cliente',
    partner: 'https://play.google.com/store/apps/details?id=com.miturnow.partner',
  };

  const appStoreUrls = {
    cliente: '#', // Placeholder para cuando tengas los links de iOS
    partner: '#', // Placeholder para cuando tengas los links de iOS
  };

  const options: DownloadOption[] = store === 'playstore' 
    ? [
        {
          label: 'Mí Turnow',
          url: playStoreUrls.cliente,
        },
        {
          label: 'Mí Turnow Partner',
          url: playStoreUrls.partner,
        },
      ]
    : [
        {
          label: 'Mí Turnow',
          url: appStoreUrls.cliente,
        },
        {
          label: 'Mí Turnow Partner',
          url: appStoreUrls.partner,
        },
      ];

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // También cerrar en touch para móviles
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Prevenir scroll cuando el dropdown está abierto en móvil (solo para Hero, no para Header)
  useEffect(() => {
    if (isOpen && (variant === 'mobile' || variant === 'header-mobile')) {
      // Solo prevenir scroll si no estamos en el header móvil
      if (variant !== 'header-mobile') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, variant]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setIsOpen(false);
  };

  // Estilos según la variante
  const getButtonStyles = () => {
    if (variant === 'mobile' || variant === 'header-mobile') {
      if (variant === 'header-mobile') {
        return store === 'appstore'
          ? 'flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-semibold cursor-pointer w-full'
          : 'flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold cursor-pointer w-full';
      }
      return store === 'appstore'
        ? 'flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex-1'
        : 'flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-black text-black rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex-1';
    }
    
    if (variant === 'header') {
      return store === 'appstore'
        ? 'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 bg-white text-primary hover:bg-white/90 cursor-pointer'
        : 'flex items-center gap-2 px-4 py-2 border rounded-lg font-semibold text-sm transition-all hover:scale-105 bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer';
    }

    // Variante default (CTA y Hero desktop)
    return store === 'appstore'
      ? 'store-badge group'
      : 'btn-outline-dark group';
  };

  const getButtonContent = () => {
    if (variant === 'mobile' || variant === 'header-mobile') {
      return (
        <>
          {store === 'appstore' ? <Apple className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{store === 'appstore' ? 'App Store' : 'Google Play'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </>
      );
    }

    if (variant === 'header') {
      return (
        <>
          {store === 'appstore' ? <Apple className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {store === 'appstore' ? 'App Store' : 'Play Store'}
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </>
      );
    }

    // Variante default
    return (
      <>
        {store === 'appstore' ? <Apple className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        <div className="text-left">
          <div className="text-xs opacity-70">
            {store === 'appstore' ? 'Descargar en' : 'Disponible en'}
          </div>
          <div className={`font-bold -mt-1 ${variant === 'default' && store === 'appstore' ? '' : 'font-semibold text-lg'}`}>
            {store === 'appstore' ? 'App Store' : 'Google Play'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        className={getButtonStyles()}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getButtonContent()}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para móvil (solo para Hero, no para Header) */}
            {variant === 'mobile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45]"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`
                ${variant === 'mobile' 
                  ? 'fixed inset-x-4 top-1/2 -translate-y-1/2 z-[50] max-w-sm mx-auto' 
                  : variant === 'header-mobile'
                  ? 'absolute top-full mt-2 left-0 right-0 z-[60]'
                  : 'absolute top-full mt-2 right-0 z-[50]'}
                ${variant === 'mobile' ? '' : 'min-w-[280px]'}
                bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                border border-gray-200/50 dark:border-gray-700/50
                rounded-xl shadow-2xl
                overflow-hidden
              `}
              style={{
                boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 pointer-events-none" />
              
              <div className="relative p-2">
                {options.map((option, index) => (
                  <motion.button
                    key={option.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleOptionClick(option.url)}
                    className="
                      w-full flex items-center gap-3 px-4 py-3.5
                      rounded-lg
                      text-left
                      transition-all duration-200
                      hover:bg-gray-100/80 dark:hover:bg-gray-800/80
                      active:scale-[0.98]
                      group/item
                    "
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-white/50 dark:bg-gray-800/50 flex items-center justify-center transition-colors">
                      <img 
                        src={logoImage} 
                        alt="Mí Turnow Logo" 
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {store === 'appstore' ? 'iOS' : 'Android'}
                      </div>
                    </div>
                    {store === 'appstore' ? (
                      <Apple className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DownloadDropdown;

