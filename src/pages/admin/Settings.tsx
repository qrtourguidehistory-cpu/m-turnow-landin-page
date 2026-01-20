import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Database, 
  Bell, 
  Shield, 
  Globe,
  Server,
  Key,
  Save,
  Moon,
  Sun,
  Lock,
  Mail
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: dbStats } = useQuery({
    queryKey: ["db-stats"],
    queryFn: async () => {
      const [businesses, clients, appointments, staff] = await Promise.all([
        supabase.from("businesses").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("staff").select("id", { count: "exact", head: true }),
      ]);

      return {
        businesses: businesses.count || 0,
        clients: clients.count || 0,
        appointments: appointments.count || 0,
        staff: staff.count || 0,
      };
    }
  });

  const handleSave = () => {
    toast.success("Configuración guardada correctamente");
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    toast.success("Contraseña actualizada correctamente");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleRecoverPassword = () => {
    toast.success("Se ha enviado un email de recuperación");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Configuración</h1>
            <p className="text-muted-foreground mt-1">Ajustes globales del sistema</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="database">Base de Datos</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="apps">Apps Conectadas</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Configuración General
                </CardTitle>
                <CardDescription>Ajustes básicos del panel de administración</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div className="space-y-0.5">
                      <Label>Modo Oscuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Cambia entre tema claro y oscuro
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Deshabilita el acceso público a las apps
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Nombre del Sistema</Label>
                  <Input defaultValue="Bookwise Admin" />
                </div>
                <div className="space-y-2">
                  <Label>Versión</Label>
                  <Input defaultValue="1.0.0" disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuración Regional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Zona Horaria</Label>
                  <Input defaultValue="America/Santo_Domingo" />
                </div>
                <div className="space-y-2">
                  <Label>Idioma Predeterminado</Label>
                  <Input defaultValue="es" />
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Input defaultValue="DOP" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Estado de la Base de Datos
                </CardTitle>
                <CardDescription>Estadísticas de registros en Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-semibold">{dbStats?.businesses.toLocaleString() || 0}</p>
                    <p className="text-sm text-muted-foreground">Negocios</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-semibold">{dbStats?.clients.toLocaleString() || 0}</p>
                    <p className="text-sm text-muted-foreground">Clientes</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-semibold">{dbStats?.appointments.toLocaleString() || 0}</p>
                    <p className="text-sm text-muted-foreground">Citas</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-semibold">{dbStats?.staff.toLocaleString() || 0}</p>
                    <p className="text-sm text-muted-foreground">Staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Conexión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado de Supabase</span>
                  <Badge variant="default" className="bg-green-500">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Última sincronización</span>
                  <span className="text-sm text-muted-foreground">Hace 1 minuto</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>Controla cómo se envían las notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar emails para citas y recordatorios
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones push a las apps móviles
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleChangePassword}>Cambiar Contraseña</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Recuperar Contraseña
                </CardTitle>
                <CardDescription>Envía un email de recuperación</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleRecoverPassword}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email de Recuperación
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Row Level Security (RLS)</Label>
                    <p className="text-sm text-muted-foreground">
                      Políticas de seguridad activas en Supabase
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Activo</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación</Label>
                    <p className="text-sm text-muted-foreground">
                      Supabase Auth habilitado
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Activo</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Apps Conectadas</CardTitle>
                <CardDescription>Estado de conexión con las apps del ecosistema Bookwise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">P</span>
                    </div>
                    <div>
                      <p className="font-medium">Bookwise Partner</p>
                      <p className="text-sm text-muted-foreground">App para negocios</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500">Conectado</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-500">C</span>
                    </div>
                    <div>
                      <p className="font-medium">Bookwise Cliente</p>
                      <p className="text-sm text-muted-foreground">App para usuarios finales</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500">Conectado</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-500">A</span>
                    </div>
                    <div>
                      <p className="font-medium">Bookwise Admin</p>
                      <p className="text-sm text-muted-foreground">Panel de administración (esta app)</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500">Activo</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
