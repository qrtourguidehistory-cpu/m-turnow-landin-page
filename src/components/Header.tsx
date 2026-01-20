import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Apple, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnWhiteBg, setIsOnWhiteBg] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Detectar si estamos sobre fondo blanco o negro
      const sections = document.querySelectorAll('section');
      const scrollPos = window.scrollY + 100;
      
      let onWhite = true;
      sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          onWhite = !section.classList.contains('bg-carbon');
        }
      });
      setIsOnWhiteBg(onWhite);
    };
    
    handleScroll(); // Check initial state
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para scroll suave a secciones
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Función para manejar el botón de contacto
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Buscar sección de contacto o crear scroll a una sección específica
    const contactSection = document.querySelector('#contacto') || document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Si no existe sección, navegar a la ruta
      window.location.href = '/contacto';
    }
  };

  // Función para botones de descarga
  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>, store: 'appstore' | 'playstore') => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    const downloadSection = document.querySelector('#download');
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Si no existe la sección, puedes abrir los links reales aquí
      // window.open(store === 'appstore' ? 'https://apps.apple.com/...' : 'https://play.google.com/...', '_blank');
    }
  };
  const navItems = [{
    label: 'Inicio',
    href: '#hero'
  }, {
    label: 'Funciones',
    href: '#apps'
  }, {
    label: 'Apps',
    href: '#cta'
  }, {
    label: 'Contacto',
    href: '/contacto'
  }];
  return <>
    <motion.header initial={{
      y: -100
    }} animate={{
      y: 0
    }} transition={{
      duration: 0.6,
      ease: 'easeOut'
    }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isMobile ? 'bg-black' : 'bg-primary/95 backdrop-blur-md'} shadow-lg`}>
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <a 
              href="#hero" 
              onClick={(e) => handleScrollToSection(e, '#hero')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src={logo} alt="Mí Turnow" className="w-10 h-10 object-contain" />
              <span className={`font-bold text-xl ${isMobile ? 'block' : 'hidden sm:block'} transition-colors text-white`}>Mí Turnow</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map(item => {
                const isRoute = item.href.startsWith('/');
                if (item.label === 'Contacto') {
                  return (
                    <a 
                      key={item.label} 
                      href={item.href}
                      onClick={handleContactClick}
                      className={`transition-colors font-medium text-white/80 hover:text-white cursor-pointer`}
                    >
                      {item.label}
                    </a>
                  );
                }
                return isRoute ? (
                  <Link key={item.label} to={item.href} className={`transition-colors font-medium text-white/80 hover:text-white`}>
                    {item.label}
                  </Link>
                ) : (
                  <a 
                    key={item.label} 
                    href={item.href}
                    onClick={(e) => handleScrollToSection(e, item.href)}
                    className={`transition-colors font-medium text-white/80 hover:text-white cursor-pointer`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* Download Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <a 
                href="#download" 
                onClick={(e) => handleDownloadClick(e, 'appstore')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 bg-white text-primary hover:bg-white/90 cursor-pointer`}
              >
                <Apple className="w-4 h-4" />
                App Store
              </a>
              <a 
                href="#download" 
                onClick={(e) => handleDownloadClick(e, 'playstore')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-semibold text-sm transition-all hover:scale-105 bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer`}
              >
                <Play className="w-4 h-4" />
                Play Store
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-2 text-white`}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="fixed inset-0 z-40 bg-primary pt-24 px-6 md:hidden">
            <div className="flex flex-col gap-6">
              {navItems.map((item, index) => {
                const isRoute = item.href.startsWith('/');
                
                if (item.label === 'Contacto') {
                  return (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={handleContactClick}
                      className="text-white text-2xl font-semibold cursor-pointer"
                    >
                      {item.label}
                    </motion.a>
                  );
                }
                
                if (isRoute) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white text-2xl font-semibold cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  );
                }
                
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={(e) => {
                      handleScrollToSection(e, item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-white text-2xl font-semibold cursor-pointer"
                  >
                    {item.label}
                  </motion.a>
                );
              })}
              <div className="flex flex-col gap-3 pt-6 border-t border-white/20">
                <a 
                  href="#download" 
                  onClick={(e) => handleDownloadClick(e, 'appstore')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-semibold cursor-pointer"
                >
                  <Apple className="w-5 h-5" />
                  App Store
                </a>
                <a 
                  href="#download" 
                  onClick={(e) => handleDownloadClick(e, 'playstore')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  Play Store
                </a>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </>;
};
export default Header;