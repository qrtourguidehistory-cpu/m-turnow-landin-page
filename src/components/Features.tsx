import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import PhoneMockup from './PhoneMockup';
import screenUserAppointments from '@/assets/screen-user-appointments.png';
import screenUserMap from '@/assets/screen-user-map.png';
import screenPartnerDashboard from '@/assets/screen-partner-dashboard.png';
import screenPartnerAnalytics from '@/assets/screen-partner-analytics.png';

interface Feature {
  id: string;
  app: 'user' | 'partner';
  title: string;
  description: string;
  image: string;
}

const features: Feature[] = [
  {
    id: 'reserve',
    app: 'user',
    title: 'Reserva en segundos',
    description: 'Encuentra disponibilidad en tiempo real y reserva tu turno sin llamadas ni esperas. Todo desde tu celular.',
    image: screenUserAppointments,
  },
  {
    id: 'explore',
    app: 'user',
    title: 'Explora negocios cercanos',
    description: 'Descubre establecimientos, lee reseñas y encuentra los mejores servicios cerca de ti con un solo toque.',
    image: screenUserMap,
  },
  {
    id: 'dashboard',
    app: 'partner',
    title: 'Gestión inteligente',
    description: 'Panel de control completo para administrar turnos, clientes y horarios. Optimiza tu operación diaria.',
    image: screenPartnerDashboard,
  },
  {
    id: 'analytics',
    app: 'partner',
    title: 'Métricas que importan',
    description: 'Visualiza el flujo de ventas, contabilidad de tus ventas, reportes y analítica de tu negocio.',
    image: screenPartnerAnalytics,
  },
];

const FeatureSection = ({ feature, index }: { feature: Feature; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  // Smoother, more subtle animations
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30], { clamp: false });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.95, 1, 1]);

  const isEven = index % 2 === 0;
  
  // Secuencia: 1-negro, 2-blanco, 3-blanco, 4-negro
  const isCarbon = index === 0 || index === 3;

  return (
    <div 
      id={`feature-${feature.id}`}
      ref={ref}
      className={`py-20 md:py-32 ${isCarbon ? 'bg-carbon' : 'bg-background'}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
          {/* Content */}
          <motion.div
            style={{ opacity }}
            className={`${isEven ? 'lg:order-1' : 'lg:order-2'} ${isCarbon ? 'text-white' : 'text-foreground'}`}
          >
            <motion.div
              initial={{ opacity: 0, x: isEven ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                isCarbon 
                  ? 'bg-white/10 text-white border border-white/20' 
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {feature.app === 'partner' ? 'Mí Turnow Partner' : 'Mí Turnow'}
              </span>
              
              <h2 className="headline-lg mb-6">
                {feature.title}
              </h2>
              
              <p className={`text-lg md:text-xl leading-relaxed ${isCarbon ? 'text-white/70' : 'text-muted-foreground'}`}>
                {feature.description}
              </p>
            </motion.div>
          </motion.div>

          {/* Phone */}
          <motion.div 
            style={{ y, scale }}
            className={`flex justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
          >
            <PhoneMockup 
              image={feature.image} 
              alt={feature.title}
              className="w-56 md:w-72"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section id="features" className="scroll-container">
      {features.map((feature, index) => (
        <FeatureSection key={feature.id} feature={feature} index={index} />
      ))}
    </section>
  );
};

export default Features;
