import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Shield, AlertCircle, Key } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import adminBg from "../assets/admin-bg.jpg";

export default function Auth() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenEmail, setTokenEmail] = useState("");
  const [tokenPhone, setTokenPhone] = useState("");
  const [isSendingToken, setIsSendingToken] = useState(false);

  useEffect(() => {
    // Solo redirigir si el usuario es admin y ya terminó de cargar
    // No redirigir si está cargando para evitar loops
    if (user && isAdmin && !isLoading) {
      navigate("/", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Email no confirmado. Revisa tu bandeja de entrada.");
      } else {
        setError(error.message);
      }
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const handleTokenClick = () => {
    // Asegurarse de que los campos estén completamente vacíos
    setTokenEmail("");
    setTokenPhone("");
    setError(null);
    setShowTokenDialog(true);
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verificar email y teléfono
    const expectedEmail = "jordandn15@outlook.com";
    const expectedPhone = "8092195141";

    if (tokenEmail.toLowerCase() !== expectedEmail.toLowerCase()) {
      setError("El correo electrónico no es correcto");
      return;
    }

    if (tokenPhone.replace(/\D/g, "") !== expectedPhone.replace(/\D/g, "")) {
      setError("El número de teléfono no es correcto");
      return;
    }

    setIsSendingToken(true);
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        expectedEmail,
        {
          redirectTo: `${window.location.origin}/admin/auth?reset=true`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      toast.success("Se ha enviado un enlace de recuperación a tu correo electrónico");
      setShowTokenDialog(false);
      setTokenEmail("");
      setTokenPhone("");
    } catch (err: any) {
      setError(err.message || "Error al enviar el enlace de recuperación");
    } finally {
      setIsSendingToken(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${adminBg})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md border-border/50 bg-card/95 backdrop-blur-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Mí Turnow Admin
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Panel de Control Administrativo
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background/50 border-border focus:bg-background transition-colors"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-background/50 border-border focus:bg-background transition-colors"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="text-center pt-2 space-y-2">
            <p className="text-xs text-muted-foreground">
              Acceso restringido a administradores autorizados
            </p>
            <button
              type="button"
              onClick={handleTokenClick}
              className="text-xs text-primary hover:text-primary/80 underline transition-colors inline-flex items-center gap-1"
            >
              <Key className="h-3 w-3" />
              token
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Token Dialog */}
      <Dialog 
        open={showTokenDialog} 
        onOpenChange={(open) => {
          setShowTokenDialog(open);
          if (!open) {
            // Limpiar campos cuando se cierra el diálogo
            setTokenEmail("");
            setTokenPhone("");
            setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogDescription>
              Por favor, verifica tu correo electrónico y número de teléfono para recibir el enlace de recuperación.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="token-email">Correo Electrónico</Label>
              <Input
                id="token-email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={tokenEmail}
                onChange={(e) => setTokenEmail(e.target.value)}
                required
                disabled={isSendingToken}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token-phone">Número de Teléfono</Label>
              <Input
                id="token-phone"
                type="tel"
                placeholder="Ingresa tu número de teléfono"
                value={tokenPhone}
                onChange={(e) => setTokenPhone(e.target.value)}
                required
                disabled={isSendingToken}
                autoComplete="off"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTokenDialog(false);
                  setTokenEmail("");
                  setTokenPhone("");
                  setError(null);
                }}
                disabled={isSendingToken}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSendingToken}>
                {isSendingToken ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Enlace"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}









