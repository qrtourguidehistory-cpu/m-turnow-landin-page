import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BusinessSubscription } from "../../hooks/useSubscriptions";

interface ManualActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: BusinessSubscription | null;
  businessName?: string;
  onActivate: (periodEnd: Date, activationNote: string) => Promise<void>;
  isPending?: boolean;
}

export function ManualActivationDialog({
  open,
  onOpenChange,
  subscription,
  businessName,
  onActivate,
  isPending = false,
}: ManualActivationDialogProps) {
  const [activationNote, setActivationNote] = useState("");
  const [durationValue, setDurationValue] = useState<string>("30");
  const [durationUnit, setDurationUnit] = useState<"days" | "months" | "years">("days");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setActivationNote("");
      setDurationValue("30");
      setDurationUnit("days");
    }
  }, [open]);

  const calculatePeriodEnd = (): Date => {
    const now = new Date();
    const value = parseInt(durationValue) || 30;

    switch (durationUnit) {
      case "days":
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case "months":
        const monthsFromNow = new Date(now);
        monthsFromNow.setMonth(monthsFromNow.getMonth() + value);
        return monthsFromNow;
      case "years":
        const yearsFromNow = new Date(now);
        yearsFromNow.setFullYear(yearsFromNow.getFullYear() + value);
        return yearsFromNow;
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  };

  const handleActivate = async () => {
    const periodEnd = calculatePeriodEnd();
    await onActivate(periodEnd, activationNote);
  };

  const displayName = businessName || subscription?.business_name || "Establecimiento";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Activar Suscripción Manualmente</DialogTitle>
          <DialogDescription>
            Activa esta suscripción manualmente por un período de tiempo específico (pago efectivo, transferencia, o corrección de error)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Negocio</p>
            <p className="text-sm text-muted-foreground">{displayName}</p>
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label>Duración de la Activación</Label>
            <div className="flex gap-3 items-center">
              <Input
                type="number"
                min="1"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                className="w-24"
                placeholder="30"
              />
              <Select value={durationUnit} onValueChange={(value: "days" | "months" | "years") => setDurationUnit(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Días</SelectItem>
                  <SelectItem value="months">Meses</SelectItem>
                  <SelectItem value="years">Años</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              La suscripción estará activa hasta: <strong>{format(calculatePeriodEnd(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</strong>
            </p>
          </div>

          {/* Activation Note */}
          <div>
            <Label htmlFor="activation_note">Nota de Activación (opcional)</Label>
            <Textarea
              id="activation_note"
              placeholder="Ej: Pago recibido vía transferencia, recibo #12345, corrección de error en Stripe..."
              value={activationNote}
              onChange={(e) => setActivationNote(e.target.value)}
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Esta nota quedará registrada para auditoría interna
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActivate}
              disabled={isPending || !durationValue || parseInt(durationValue) <= 0}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Activar Suscripción
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

