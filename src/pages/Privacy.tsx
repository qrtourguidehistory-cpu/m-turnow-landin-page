import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
          <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Última actualización: Enero 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Información que Recopilamos</h2>
              <p className="text-muted-foreground mb-3">
                Mí Turnow ("nosotros", "nuestro" o "la Aplicación") recopila información personal limitada necesaria para proporcionar nuestros servicios de reserva de citas. Esta incluye:
              </p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                <li>Nombre y datos de contacto (teléfono, email)</li>
                <li>Información de cuenta y preferencias</li>
                <li>Historial de reservas y servicios utilizados</li>
                <li>Datos de ubicación (solo cuando uses la función de mapa)</li>
                <li>Información del dispositivo y datos de uso de la aplicación</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Uso de la Información</h2>
              <p className="text-muted-foreground mb-3">Utilizamos tu información únicamente para:</p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                <li>Gestionar tus reservas y comunicarte con los establecimientos</li>
                <li>Enviar notificaciones sobre tus citas</li>
                <li>Mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. Compartir Información</h2>
              <p className="text-muted-foreground mb-3">NO vendemos tu información personal. Solo la compartimos con:</p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                <li>Los establecimientos donde reserves citas (nombre y contacto)</li>
                <li>Proveedores de servicios técnicos necesarios para operar la app</li>
                <li>Autoridades cuando sea requerido por ley</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Seguridad de Datos</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información. Sin embargo, ningún sistema es 100% seguro y no podemos garantizar seguridad absoluta.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Tus Derechos</h2>
              <p className="text-muted-foreground mb-3">Tienes derecho a:</p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                <li>Acceder a tu información personal</li>
                <li>Corregir datos incorrectos</li>
                <li>Solicitar la eliminación de tu cuenta</li>
                <li>Retirar consentimientos</li>
                <li>Exportar tus datos</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Cookies y Tecnologías Similares</h2>
              <p className="text-muted-foreground">
                Usamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la app y personalizar contenido.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Menores de Edad</h2>
              <p className="text-muted-foreground">
                Nuestros servicios están destinados a personas mayores de 18 años. No recopilamos intencionalmente información de menores.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Cambios a esta Política</h2>
              <p className="text-muted-foreground">
                Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios importantes a través de la app o por email.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Contacto</h2>
              <p className="text-muted-foreground">
                Para preguntas sobre privacidad, contáctanos:
              </p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-1">
                <li>Email: soporte@miturnow.com</li>
                <li>Teléfono: +1 809-219-5141</li>
                <li>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM (Hora del Este)</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
