import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, Linkedin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const links = {
    menu: [{
      label: 'Inicio',
      href: '#hero'
    }, {
      label: 'Funciones',
      href: '#features'
    }, {
      label: 'Apps',
      href: '#apps'
    }, {
      label: 'Contacto',
      href: '/contacto',
      isRoute: true
    }],
    legal: [{
      label: 'Privacidad',
      href: '/privacidad',
      isRoute: true
    }, {
      label: 'Términos',
      href: '/terminos',
      isRoute: true
    }, {
      label: 'Cookies',
      href: '/cookies',
      isRoute: true
    }],
    social: [{
      icon: Instagram,
      href: '#',
      label: 'Instagram'
    }, {
      icon: Twitter,
      href: '#',
      label: 'Twitter'
    }, {
      icon: Facebook,
      href: '#',
      label: 'Facebook'
    }, {
      icon: Linkedin,
      href: '#',
      label: 'LinkedIn'
    }]
  };
  return <footer className="bg-carbon">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Mí Turnow" className="w-10 h-10 object-contain" />
              <span className="text-white font-bold text-xl">Mí Turnow</span>
            </div>
            <p className="text-white/70 mb-6 max-w-sm">
              La plataforma que conecta usuarios y negocios para una gestión de turnos moderna, eficiente y sin fricciones.
            </p>
            <div className="flex gap-3">
              {links.social.map(social => <a key={social.label} href={social.href} aria-label={social.label} className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:bg-white hover:text-primary transition-colors">
                  <social.icon className="w-5 h-5" />
                </a>)}
            </div>
          </motion.div>

          {/* Menu Links */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }}>
            <h4 className="font-semibold text-white mb-4">Menú</h4>
            <ul className="space-y-3">
              {links.menu.map(link => <li key={link.label}>
                  {link.isRoute ? <Link to={link.href} className="text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link> : <a href={link.href} className="text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </a>}
                </li>)}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }}>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {links.legal.map(link => <li key={link.label}>
                  <Link to={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
            <div className="mt-6 space-y-2">
              <a href="mailto:soporte@miturnow.com" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">soporte@miturnow.com</span>
              </a>
              <a href="tel:+18092195141" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 809-219-5141</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            © {currentYear} Mí Turnow. Todos los derechos reservados.
          </p>
          
        </div>
      </div>
    </footer>;
};
export default Footer;