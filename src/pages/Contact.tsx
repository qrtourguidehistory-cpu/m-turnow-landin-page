import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Contacto</h1>
          
          <div className="space-y-8">
            <p className="text-lg text-muted-foreground">
              ¿Tienes preguntas o necesitas ayuda? Estamos aquí para asistirte. Contáctanos a través de cualquiera de los siguientes medios.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-muted rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold">Email</h3>
                </div>
                <a 
                  href="mailto:soporte@miturnow.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  soporte@miturnow.com
                </a>
              </div>

              <div className="bg-muted rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold">Teléfono</h3>
                </div>
                <a 
                  href="tel:+18092195141" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  +1 809-219-5141
                </a>
              </div>
            </div>

            <div className="bg-muted rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold">Sitio Web</h3>
              </div>
              <a 
                href="https://miturnow.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                www.miturnow.com
              </a>
            </div>

            <div className="bg-carbon rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold mb-4">Horario de Atención</h3>
              <div className="space-y-2 text-white/70">
                <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                <p>Sábados: 9:00 AM - 1:00 PM</p>
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
