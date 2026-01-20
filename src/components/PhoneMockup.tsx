import { motion, Easing } from 'framer-motion';

interface PhoneMockupProps {
  image: string;
  alt: string;
  className?: string;
  animate?: boolean;
}

const PhoneMockup = ({ image, alt, className = '', animate = true }: PhoneMockupProps) => {
  if (animate) {
    return (
      <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as Easing }}
      >
        <PhoneContent image={image} alt={alt} />
      </motion.div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <PhoneContent image={image} alt={alt} />
    </div>
  );
};

const PhoneContent = ({ image, alt }: { image: string; alt: string }) => (
  <>
    {/* Simple Phone Frame - sin elementos internos para evitar teléfono dentro de teléfono */}
    <div className="relative bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-800 rounded-[2.5rem] md:rounded-[3rem] p-1.5 md:p-2 shadow-2xl">
      {/* Outer border shine */}
      <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-b from-white/20 via-transparent to-white/5 pointer-events-none" />
      
      {/* Side buttons */}
      <div className="absolute -left-0.5 top-24 w-0.5 h-8 bg-neutral-700 rounded-l-full" />
      <div className="absolute -left-0.5 top-36 w-0.5 h-12 bg-neutral-700 rounded-l-full" />
      <div className="absolute -right-0.5 top-28 w-0.5 h-10 bg-neutral-700 rounded-r-full" />
      
      {/* Screen - imagen directa sin notch */}
      <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white">
        <img 
          src={image} 
          alt={alt}
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
    
    {/* Reflection/glow effect */}
    <div className="absolute -inset-4 bg-gradient-to-b from-white/5 to-transparent rounded-[3.5rem] blur-xl -z-10 opacity-50" />
  </>
);

export default PhoneMockup;
