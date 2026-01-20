import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import screenComparisonUser from '@/assets/screen-comparison-user.png';
import screenComparisonPartner from '@/assets/screen-comparison-partner.png';
import logoMT from '@/assets/logo.png';

const userFeatures = [
  'Reserva turnos en segundos',
  'Notificaciones en tiempo real',
  'Historial de citas completo',
  'Cancelación flexible',
  'Múltiples negocios favoritos',
];

const partnerFeatures = [
  'Panel de gestión completo',
  'Control de flujo de clientes',
  'Métricas y reportes',
  'Configuración de horarios',
  'Notificaciones automáticas',
];

const Comparison = () => {
  return (
    <section id="apps" className="py-20 md:py-32 bg-carbon">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="headline-lg mb-4 text-white">
            Dos apps, un ecosistema
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Conectamos clientes con negocios para una experiencia de atención fluida, predecible y moderna.
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* User App */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-background rounded-3xl p-6 md:p-10 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1">
                <img src={logoMT} alt="Mí Turnow Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Mí Turnow</h3>
                <p className="text-muted-foreground">Para usuarios</p>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <PhoneMockup 
                image={screenComparisonUser} 
                alt="Mí Turnow App"
                className="w-48 md:w-56"
              />
            </div>

            <ul className="space-y-3">
              {userFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Partner App */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-background rounded-3xl p-6 md:p-10 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1">
                <img src={logoMT} alt="Mí Turnow Partner Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">Mí Turnow Partner</h3>
                <p className="text-muted-foreground">Para negocios</p>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <PhoneMockup 
                image={screenComparisonPartner} 
                alt="Mí Turnow Partner App"
                className="w-48 md:w-56"
              />
            </div>

            <ul className="space-y-3">
              {partnerFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
