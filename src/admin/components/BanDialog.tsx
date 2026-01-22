import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface BanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  entityType: "business" | "client";
  isBanned: boolean;
  onConfirm: (reason: string) => Promise<void>;
  isPending?: boolean;
}

export function BanDialog({
  open,
  onOpenChange,
  entityName,
  entityType,
  isBanned,
  onConfirm,
  isPending = false,
}: BanDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    await onConfirm(reason);
    if (!isBanned) {
      setReason(""); // Solo limpiar si se está baneando (no al desbanear)
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setReason("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={isBanned ? "h-5 w-5 text-success" : "h-5 w-5 text-destructive"} />
            {isBanned ? "Desbanear" : "Banear"} {entityType === "business" ? "Establecimiento" : "Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isBanned ? (
              <>
                ¿Estás seguro de desbanear a <strong>{entityName}</strong>? 
                Podrán volver a utilizar las aplicaciones.
              </>
            ) : (
              <>
                Banear a <strong>{entityName}</strong> impedirá que utilicen las aplicaciones 
                de forma permanente, incluso si tienen suscripción activa, hasta que un administrador 
                les quite el ban.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!isBanned && (
            <div>
              <Label htmlFor="ban-reason">
                Razón del ban <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ban-reason"
                placeholder="Ej: Violación de términos de servicio, comportamiento inapropiado, fraude..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-1"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esta razón quedará registrada para auditoría interna
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending || (!isBanned && !reason.trim())}
              variant={isBanned ? "default" : "destructive"}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isBanned ? "Desbaneando..." : "Baneando..."}
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {isBanned ? "Desbanear" : "Banear"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

