import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, FileText, LogOut, Camera } from "lucide-react";
import { toast } from "sonner";

interface ProfileDropdownProps {
  collapsed?: boolean;
}

export function ProfileDropdown({ collapsed = false }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.email?.split("@")[0] || "Admin",
    email: user?.email || "admin@bookwise.app",
    phone: "",
    notes: "",
    avatarUrl: "",
  });

  const handleSave = () => {
    toast.success("Perfil actualizado correctamente");
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    toast.info("Cerrando sesión...");
    await signOut();
    navigate("/auth", { replace: true });
  };

  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "AD";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer ${collapsed ? "justify-center px-2" : ""}`}>
            <Avatar className="h-7 w-7">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials()}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{profile.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || profile.email}</p>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <User className="h-4 w-4 mr-2" />
            Ver Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Editar Información
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Mis Notas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mi Perfil</DialogTitle>
            <DialogDescription>Administra tu información personal</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas Personales</Label>
                <Textarea
                  id="notes"
                  placeholder="Escribe notas personales aquí..."
                  value={profile.notes}
                  onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
