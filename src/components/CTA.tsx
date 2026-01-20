import { motion } from 'framer-motion';
import { Apple, Play, ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section id="cta" className="relative py-20 md:py-32 bg-background overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="headline-xl text-foreground mb-6">
              DESCARGA
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">AHORA</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Únete a miles de usuarios y negocios que ya están transformando la manera de gestionar turnos y citas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a 
              href="#download" 
              className="store-badge group"
            >
              <Apple className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xs opacity-70">Descargar en</div>
                <div className="font-bold -mt-1">App Store</div>
              </div>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a 
              href="#download" 
              className="btn-outline-dark group"
            >
              <Play className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xs opacity-70">Disponible en</div>
                <div className="font-bold -mt-1">Google Play</div>
              </div>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <p className="text-muted-foreground text-sm mb-4">Disponible para</p>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Apple className="w-5 h-5" />
                </div>
                <span className="font-medium">iOS 14+</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5" />
                </div>
                <span className="font-medium">Android 8+</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
