import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Cookies = () => {
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
          <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Última actualización: Enero 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. ¿Qué son las Cookies?</h2>
              <p className="text-muted-foreground">
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Nos ayudan a recordar sus preferencias y mejorar su experiencia.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Cookies que Utilizamos</h2>
              <p className="text-muted-foreground">
                Utilizamos los siguientes tipos de cookies:
              </p>
              <ul className="text-muted-foreground list-disc pl-6">
                <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio.</li>
                <li><strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo usa nuestro sitio.</li>
                <li><strong>Cookies de funcionalidad:</strong> Recuerdan sus preferencias.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. Control de Cookies</h2>
              <p className="text-muted-foreground">
                Puede configurar su navegador para rechazar todas las cookies o para indicarle cuándo se envía una cookie. Sin embargo, algunas funciones del sitio pueden no funcionar correctamente sin cookies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Cookies de Terceros</h2>
              <p className="text-muted-foreground">
                Algunos de nuestros socios pueden establecer cookies en su dispositivo. Estas cookies están sujetas a las políticas de privacidad de dichos terceros.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Contacto</h2>
              <p className="text-muted-foreground">
                Si tiene preguntas sobre nuestra política de cookies, contáctenos en:
              </p>
              <ul className="text-muted-foreground list-disc pl-6">
                <li>Email: soporte@miturnow.com</li>
                <li>Teléfono: +1 809-219-5141</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
