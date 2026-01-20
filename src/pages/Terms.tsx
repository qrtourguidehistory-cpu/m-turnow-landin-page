import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
          <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Última actualización: Enero 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Aceptación de Términos</h2>
              <p className="text-muted-foreground">
                Al acceder y usar Mí Turnow ("la Aplicación"), aceptas estar legalmente vinculado por estos Términos y Condiciones. Si no estás de acuerdo, no uses la Aplicación.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground">
                Mí Turnow es una plataforma de intermediación que conecta usuarios con establecimientos de servicios personales (barberías, salones de belleza, spas, etc.). NO SOMOS responsables de los servicios prestados por los establecimientos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-destructive">3. LIMITACIÓN DE RESPONSABILIDAD</h2>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-muted-foreground font-medium mb-3">
                  IMPORTANTE - LEE CUIDADOSAMENTE:
                </p>
                <p className="text-muted-foreground mb-3">
                  Mí Turnow actúa ÚNICAMENTE como intermediario tecnológico. EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY:
                </p>
                <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                  <li>NO somos responsables de la calidad, seguridad o legalidad de los servicios prestados por los establecimientos</li>
                  <li>NO garantizamos la disponibilidad, exactitud o confiabilidad de la información de los establecimientos</li>
                  <li>NO somos responsables por daños físicos, emocionales, económicos o de cualquier tipo resultantes de servicios recibidos</li>
                  <li>NO respondemos por cancelaciones, cambios de horario o incumplimientos por parte de los establecimientos</li>
                  <li>NO somos responsables por pérdida de datos, interrupciones del servicio o errores técnicos</li>
                  <li>Cualquier disputa con un establecimiento es directamente entre tú y el establecimiento</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. USO DE LA APLICACIÓN "TAL CUAL"</h2>
              <p className="text-muted-foreground uppercase font-medium">
                LA APLICACIÓN SE PROPORCIONA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD" SIN GARANTÍAS DE NINGÚN TIPO, expresas o implícitas, incluyendo pero no limitado a garantías de comerciabilidad, idoneidad para un propósito particular o no infracción.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Responsabilidades del Usuario</h2>
              <p className="text-muted-foreground mb-3">Al usar Mí Turnow, te comprometes a:</p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la seguridad de tu cuenta</li>
                <li>Respetar las políticas de cancelación de los establecimientos</li>
                <li>Pagar directamente al establecimiento por los servicios recibidos</li>
                <li>No usar la app para actividades ilegales o fraudulentas</li>
                <li>Verificar directamente con el establecimiento antes de acudir a tu cita</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. INDEMNIZACIÓN</h2>
              <p className="text-muted-foreground">
                Aceptas INDEMNIZAR, DEFENDER y MANTENER INDEMNE a Mí Turnow, sus propietarios, directores, empleados y afiliados de cualquier reclamo, demanda, daño, pérdida, responsabilidad, costo o gasto (incluyendo honorarios legales) que surja de:
              </p>
              <ul className="text-muted-foreground list-disc pl-6 space-y-2">
                <li>Tu uso de la Aplicación</li>
                <li>Tu violación de estos Términos</li>
                <li>Tu interacción con cualquier establecimiento</li>
                <li>Servicios recibidos a través de la plataforma</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Reservas y Cancelaciones</h2>
              <p className="text-muted-foreground">
                Las políticas de cancelación son establecidas por cada establecimiento independientemente. Mí Turnow NO es responsable de políticas de cancelación, cargos por no presentarse o disputas relacionadas con reservas.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Pagos</h2>
              <p className="text-muted-foreground">
                Los pagos por servicios se realizan DIRECTAMENTE con el establecimiento. Mí Turnow NO procesa, maneja ni es responsable de transacciones de pago entre usuarios y establecimientos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Propiedad Intelectual</h2>
              <p className="text-muted-foreground">
                Todos los derechos de propiedad intelectual de la Aplicación pertenecen a Mí Turnow. No puedes copiar, modificar, distribuir o crear obras derivadas sin autorización expresa.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Suspensión y Terminación</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de suspender o terminar tu acceso a la Aplicación en cualquier momento, sin previo aviso, por cualquier motivo, incluyendo violación de estos Términos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">11. RENUNCIA A DEMANDAS COLECTIVAS</h2>
              <p className="text-muted-foreground font-medium">
                Aceptas que cualquier disputa se resolverá de manera individual. RENUNCIAS A TU DERECHO de participar en demandas colectivas o acciones de clase contra Mí Turnow.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">12. Jurisdicción y Ley Aplicable</h2>
              <p className="text-muted-foreground">
                Estos Términos se regirán por las leyes de República Dominicana. Cualquier disputa se resolverá en los tribunales competentes de República Dominicana.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">13. Modificaciones</h2>
              <p className="text-muted-foreground">
                Podemos modificar estos Términos en cualquier momento. Los cambios serán efectivos al publicarse. Tu uso continuado constituye aceptación de los nuevos términos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">14. Divisibilidad</h2>
              <p className="text-muted-foreground">
                Si alguna disposición de estos Términos es inválida o inaplicable, las demás disposiciones permanecerán en pleno vigor y efecto.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">15. Contacto</h2>
              <p className="text-muted-foreground">
                Para preguntas sobre estos Términos:
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

export default Terms;
