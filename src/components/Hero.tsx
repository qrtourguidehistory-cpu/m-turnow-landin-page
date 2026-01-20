import { motion } from 'framer-motion';
import { Apple, Play, ArrowRight } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import screenUserOnboarding from '@/assets/screen-user-onboarding.png';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero = () => {
  const isMobile = useIsMobile();
  
  return <section id="hero" className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-white/5 to-transparent blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-8 pt-32 pb-20 relative z-10">
        {isMobile ? (
          /* Layout móvil: Título → Descripción → Teléfono → Estadísticas → Botones */
          <div className="flex flex-col items-center text-center">
            {/* Título - Arriba */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900 }}
            >
              <span className="text-black">TU TIEMPO,</span>
              <br />
              <span 
                className="inline-block"
                style={{
                  background: 'linear-gradient(to right, #000000 0%, #4B5563 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 900
                }}
              >
                TU CONTROL
              </span>
            </motion.h1>

            {/* Descripción */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base text-gray-600 mb-6 max-w-md leading-relaxed"
            >
              Reserva y gestiona turnos sin filas. La app que conecta usuarios y negocios.
            </motion.p>

            {/* Teléfono - Centro */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center w-full mb-6"
            >
              <div className="relative">
                <PhoneMockup image={screenUserOnboarding} alt="Mí Turnow App" className="w-64 md:w-80" animate={false} />
              </div>
            </motion.div>

            {/* Estadísticas */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">3.5K+</div>
                <div className="text-sm text-gray-600 mt-1">Usuarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-gray-600 mt-1">Negocios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-sm text-gray-600 mt-1">Rating</div>
              </div>
            </motion.div>

            {/* Botones de descarga - Lado a lado */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-row gap-3 w-full max-w-md justify-center"
            >
              <a href="#download" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex-1">
                <Apple className="w-5 h-5" />
                <span>App Store</span>
              </a>
              <a href="#download" className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-black text-black rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex-1">
                <Play className="w-5 h-5" />
                <span>Google Play</span>
              </a>
            </motion.div>
          </div>
        ) : (
          /* Layout desktop: Mantener diseño original */
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-8rem)]">
            {/* Content */}
            <div className="text-foreground">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full text-sm font-medium border border-primary/20 text-primary">
                  Disponible en iOS y Android
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="headline-xl mb-6 font-black tracking-tight"
                style={{ fontWeight: 900 }}
              >
                <span className="text-black">TU TIEMPO,</span>
                <br />
                <span 
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(to right, #000000 0%, #4B5563 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 900
                  }}
                >
                  TU CONTROL
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed"
              >
                Reserva, gestiona y olvídate de las filas y esperas incómodas. La plataforma que conecta usuarios y negocios para una gestión de turnos moderna, eficiente y sin fricciones.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a href="#download" className="store-badge group">
                  <Apple className="w-8 h-8" />
                  <div>
                    <div className="text-xs opacity-70">Descargar en</div>
                    <div className="font-semibold text-lg -mt-1">App Store</div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#download" className="btn-outline-dark group">
                  <Play className="w-8 h-8" />
                  <div>
                    <div className="text-xs opacity-70">Disponible en</div>
                    <div className="font-semibold text-lg -mt-1">Google Play</div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-border"
              >
                <div>
                  <div className="text-3xl md:text-4xl font-bold">3.5K+</div>
                  <div className="text-muted-foreground text-sm mt-1">Usuarios activos</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">500+</div>
                  <div className="text-muted-foreground text-sm mt-1">Negocios partner</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">4.9</div>
                  <div className="text-muted-foreground text-sm mt-1">Rating App Store</div>
                </div>
              </motion.div>
            </div>

            {/* Phone Mockup - Desktop */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                <PhoneMockup image={screenUserOnboarding} alt="Mí Turnow App" className="w-64 md:w-80" animate={false} />
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-white/10 blur-3xl rounded-full" />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>;
};
export default Hero;